import { cookies } from "next/headers";

import { Card } from "@/components/ui";
import { Gallery } from "@/components/shared/Gallery";
import { DetailProperties } from "@/components/shared/DetailProperties";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { i18n } from "@/lib/i18n";
import type { components } from "@/lib/openapi/types";

type TourDetailDto = components["schemas"]["TourDetailDto"];

const normalizeGuidParam = (value: string) => value.trim().replace(/^\{/, "").replace(/\}$/, "");

const isGuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const fetchTourDetail = async (id: string): Promise<TourDetailDto | null> => {
  let primaryError: unknown = null;

  try {
    return await getJson<TourDetailDto>(apiEndpoints.tours.detail(id));
  } catch (error) {
    console.error("Failed to load tour detail (primary)", error);
    primaryError = error;
  }

  const proxyBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proxyUrl = `${proxyBase.replace(/\/$/, "")}/api/proxy${apiEndpoints.tours.detail(id)}`;

  try {
    const response = await fetch(proxyUrl, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) {
      let proxyMessage = "";
      try {
        const payload = (await response.clone().json()) as { message?: string };
        proxyMessage = payload?.message ? `: ${payload.message}` : "";
      } catch {
        // ignore json parsing errors
      }
      throw new Error(`Proxy status ${response.status}${proxyMessage}`);
    }
    return (await response.json()) as TourDetailDto;
  } catch (error) {
    console.error("Failed to load tour detail (proxy fallback)", error);
    if (error instanceof Error) {
      throw error;
    }

    if (primaryError instanceof Error) {
      throw primaryError;
    }

    throw new Error("Failed to load tour detail");
  }
};

const formatDateTime = (value: string, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatCountryName = (countryCode: string, locale: string) => {
  const normalizedCode = countryCode.trim().toUpperCase();
  if (!normalizedCode) {
    return "";
  }

  try {
    const displayLocale = locale === "fa" ? "fa-IR" : locale;
    const displayNames = new Intl.DisplayNames([displayLocale], { type: "region" });
    return displayNames.of(normalizedCode) ?? normalizedCode;
  } catch {
    return normalizedCode;
  }
};

type TourDetailParams = { params: { id?: string | string[] } | Promise<{ id?: string | string[] }> };

export default async function TourDetailPage({ params }: TourDetailParams) {
  const resolvedParams = await Promise.resolve(params);
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const t = i18n(locale);

  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.at(0) ?? "" : resolvedParams.id ?? "";
  const requestedId = rawId ? normalizeGuidParam(rawId) : "";

  let tour: TourDetailDto | null = null;
  let loadError: string | null = null;

  if (!rawId) {
    loadError = "Missing tour id.";
  } else if (!isGuid(requestedId)) {
    loadError = `Invalid tour id: ${rawId}`;
  }

  try {
    if (!loadError) {
      tour = await fetchTourDetail(requestedId);
    }
  } catch (error) {
    console.error("Failed to load tour detail", error);
    loadError = error instanceof Error ? error.message : String(error);
  }

  if (!tour && !loadError) {
    loadError = "No tour data returned.";
  }

  const resolvedTour: TourDetailDto =
    tour ?? {
      tourId: requestedId,
      name: t.detail.tour.loadErrorTitle,
      description: t.detail.tour.loadErrorCopy,
      tourCategoryName: "",
      price: Number.NaN as number,
      currency: "",
      countryCode: "",
      schedules: [],
      photos: [],
    };

  const description = resolvedTour.description?.trim() || t.detail.tour.descriptionFallback;
  const schedules = [...resolvedTour.schedules].sort(
    (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()
  );
  const upcoming = schedules[0];
  const priceLabel =
    Number.isFinite(resolvedTour.price) && resolvedTour.currency
      ? `${Number(resolvedTour.price).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} ${resolvedTour.currency}`
      : undefined;

  const formattedPriceValue =
    priceLabel ??
    (Number.isFinite(resolvedTour.price)
      ? `${Number(resolvedTour.price).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} ${resolvedTour.currency}`
      : resolvedTour.price);

  const scheduleList =
    schedules.length === 0 ? (
      <span className="text-muted">{t.detail.tour.noSchedules}</span>
    ) : (
      <ul className="space-y-2 text-xs text-muted">
        {schedules.map((schedule) => (
          <li key={schedule.tourScheduleId}>
            <p className="font-semibold text-text">
              {t.detail.tour.scheduleRange(
                formatDateTime(schedule.startAtUtc, locale),
                formatDateTime(schedule.endAtUtc, locale)
              )}
            </p>
            <p className="text-[11px] uppercase text-muted">{t.detail.tour.capacity(schedule.capacity)}</p>
          </li>
        ))}
      </ul>
    );

  const propertyItems = [
    { label: t.detail.tour.propertyLabels.name, value: resolvedTour.name },
    { label: t.detail.tour.propertyLabels.description, value: description },
    { label: t.detail.tour.propertyLabels.tourCategoryName, value: resolvedTour.tourCategoryName },
    { label: t.detail.tour.propertyLabels.price, value: formattedPriceValue },
    { label: t.detail.tour.propertyLabels.countryCode, value: formatCountryName(resolvedTour.countryCode, locale) },
    {
      label: t.detail.tour.nextStartLabel,
      value: upcoming ? formatDateTime(upcoming.startAtUtc, locale) : t.detail.tour.noSchedules,
    },
    { label: t.detail.tour.propertyLabels.schedules, value: scheduleList },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <Card className="mx-auto w-full max-w-4xl overflow-hidden border border-white/10 bg-slate-950/50 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <Gallery photos={resolvedTour.photos} alt={`${resolvedTour.name} gallery`} />
      </Card>

      <DetailProperties
        title={t.detail.tour.propertyListTitle}
        items={propertyItems}
      />

    </div>
  );
}

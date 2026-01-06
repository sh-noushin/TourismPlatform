import Link from "next/link";
import { cookies } from "next/headers";

import { Badge, Card } from "@/components/ui";
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

  const isFallback = !tour;
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

  const quickFacts = [
    { label: t.detail.tour.categoryLabel, value: resolvedTour.tourCategoryName },
    { label: t.detail.tour.priceLabel, value: priceLabel },
    {
      label: t.detail.tour.nextStartLabel,
      value: upcoming ? formatDateTime(upcoming.startAtUtc, locale) : t.detail.tour.noSchedules,
    },
  ].filter((fact) => Boolean(fact.value));

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

  const photoDetails =
    resolvedTour.photos.length === 0 ? (
      <span className="text-muted">{t.cards.photos(0)}</span>
    ) : (
      <ul className="space-y-2 text-xs text-muted">
        {resolvedTour.photos.map((photo) => (
          <li key={photo.photoId}>
            <p className="font-semibold text-text">{photo.label ?? photo.photoId}</p>
            <p className="text-[11px] text-muted">{photo.permanentRelativePath}</p>
          </li>
        ))}
      </ul>
    );

  const propertyItems = [
    { label: t.detail.tour.propertyLabels.name, value: resolvedTour.name },
    { label: t.detail.tour.propertyLabels.description, value: description },
    { label: t.detail.tour.propertyLabels.tourCategoryName, value: resolvedTour.tourCategoryName },
    { label: t.detail.tour.propertyLabels.price, value: formattedPriceValue },
    { label: t.detail.tour.propertyLabels.currency, value: resolvedTour.currency },
    { label: t.detail.tour.propertyLabels.countryCode, value: resolvedTour.countryCode },
    { label: t.detail.tour.propertyLabels.schedules, value: scheduleList },
    { label: t.detail.tour.propertyLabels.photos, value: photoDetails },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-950/70 p-6 shadow-[0_40px_90px_rgba(0,0,0,0.6)]">
        <Link href="/tours" className="text-sm font-semibold text-primary transition hover:text-primary/80">
          {t.detail.backToTours}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {resolvedTour.tourCategoryName && <Badge variant="solid">{resolvedTour.tourCategoryName}</Badge>}
          <h1 className="text-3xl font-bold text-text">{resolvedTour.name}</h1>
          {priceLabel && <Badge variant="subtle">{priceLabel}</Badge>}
          {isFallback && <Badge variant="outline">{t.detail.tour.loadErrorTitle}</Badge>}
        </div>
        <p className="mt-3 text-sm text-muted">{description}</p>
        {loadError && (
          <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </p>
        )}
        {isFallback && (
          <p className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {t.detail.tour.loadErrorCopy}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase text-muted">
          {resolvedTour.tourCategoryName && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {resolvedTour.tourCategoryName}
            </span>
          )}
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            {t.cards.photos(resolvedTour.photos.length)}
          </span>
          {upcoming && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              {t.detail.tour.scheduleRange(
                formatDateTime(upcoming.startAtUtc, locale),
                formatDateTime(upcoming.endAtUtc, locale)
              )}
            </span>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border border-white/10 bg-slate-950/50 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <Gallery photos={resolvedTour.photos} alt={`${resolvedTour.name} gallery`} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,320px)]">
        <div className="space-y-6">
          <Card className="space-y-4 border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">{t.detail.tour.detailsTitle}</h2>
              <Badge variant="subtle">{resolvedTour.tourCategoryName}</Badge>
            </div>
            <p className="text-sm text-muted">{description}</p>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t.detail.tour.schedulesTitle}
              </h3>
              {schedules.length === 0 ? (
                <p className="text-sm text-muted">{t.detail.tour.noSchedules}</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.tourScheduleId}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                    >
                      <p className="text-sm font-semibold text-text">
                        {t.detail.tour.scheduleRange(
                          formatDateTime(schedule.startAtUtc, locale),
                          formatDateTime(schedule.endAtUtc, locale)
                        )}
                      </p>
                      <p className="text-xs text-muted">{t.detail.tour.capacity(schedule.capacity)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4 border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text">{t.detail.tour.quickFactsTitle}</h2>
              <span className="text-xs uppercase text-muted">{t.seeDetails}</span>
            </div>
            <dl className="grid gap-4 md:grid-cols-2">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <dt className="text-xs uppercase text-muted">{fact.label}</dt>
                  <dd className="text-sm font-semibold text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <DetailProperties title={t.detail.tour.propertyListTitle} items={propertyItems} />
        </div>

        <aside className="space-y-4">
          <Card className="space-y-3 border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-6">
            <h2 className="text-lg font-semibold text-text">{t.detail.tour.planAheadTitle}</h2>
            <p className="text-sm text-muted">{t.detail.tour.planAheadCopy}</p>
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/20"
            >
              {t.detail.tour.backCta}
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

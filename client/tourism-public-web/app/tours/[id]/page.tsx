import Image from "next/image";
import Link from "next/link";

import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { i18n } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";
import { translateValue } from "@/lib/i18n/translateValue";
import { resolveLocale } from "@/lib/locale";
import { destinationPhoto } from "@/lib/media/destinationPhoto";
import { posterStyle } from "@/lib/media/poster";
import { imageUrl } from "@/lib/utils/imageUrl";
import type { components } from "@/lib/openapi/types";

type TourDetailDto = components["schemas"]["TourDetailDto"];

const normalizeGuidParam = (value: string) => value.trim().replace(/^\{/, "").replace(/\}$/, "");

const isGuid = (value: string) =>
  // Shape only -- 8-4-4-4-12 hex. The old pattern also demanded an RFC-4122
  // version nibble of 1-5 and a variant of 8/9/a/b, which rejected perfectly
  // real ids: anything derived from a hash (as the seeded rows are) lands
  // outside that range, and those records could never open their own page.
  // Whether an id exists is the API's answer to give, not a regex's.
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const fetchTourDetail = async (id: string): Promise<TourDetailDto | null> => {
  try {
    return await getJson<TourDetailDto>(apiEndpoints.tours.detail(id));
  } catch (error) {
    console.error("Failed to load tour detail", error);
    return null;
  }
};

const formatDate = (value: string, locale: string) => {
  try {
    return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : locale, {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatCountryName = (countryCode: string, locale: string) => {
  const normalized = countryCode.trim().toUpperCase();
  if (!normalized) return "";
  try {
    const displayNames = new Intl.DisplayNames([locale === "fa" ? "fa-IR" : locale], {
      type: "region",
    });
    return displayNames.of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
};

type TourDetailParams = { params: { id?: string | string[] } | Promise<{ id?: string | string[] }> };

export default async function TourDetailPage({ params }: TourDetailParams) {
  const resolvedParams = await Promise.resolve(params);
  const locale = await resolveLocale();
  const isFarsi = locale === "fa";
  const t = i18n(locale);

  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.at(0) ?? "" : resolvedParams.id ?? "";
  const requestedId = rawId ? normalizeGuidParam(rawId) : "";
  const tour = isGuid(requestedId) ? await fetchTourDetail(requestedId) : null;

  if (!tour) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">{t.detail.tour.loadErrorTitle}</h1>
        <p className="mt-3 text-[color:var(--muted)]">{t.detail.tour.loadErrorCopy}</p>
        <Link
          href="/tours"
          className="mt-8 inline-flex rounded-xl bg-[color:var(--cta)] px-6 py-3 text-sm font-semibold text-white"
        >
          {t.detail.tour.backCta}
        </Link>
      </div>
    );
  }

  const number = new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US", { maximumFractionDigits: 0 });
  const price =
    Number.isFinite(tour.price) && tour.currency
      ? `${number.format(Number(tour.price))} ${tour.currency}`
      : null;

  const schedules = [...tour.schedules].sort(
    (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime(),
  );

  const title = localized(tour.name, tour.nameEn, locale);
  const description = localized(tour.description, tour.descriptionEn, locale);
  const category = localized(
    translateValue(tour.tourCategoryName, locale),
    tour.tourCategoryNameEn,
    locale,
  );

  const hero =
    imageUrl(tour.photos?.[0]?.permanentRelativePath) ||
    destinationPhoto(tour.name, tour.tourCategoryName, tour.description);

  const gallery = (tour.photos ?? []).slice(1, 5);
  const country = formatCountryName(tour.countryCode, locale);

  const facts = [
    { label: t.detail.tour.categoryLabel, value: category },
    { label: t.detail.tour.propertyLabels.countryCode, value: country },
    { label: t.detail.tour.priceLabel, value: price },
    {
      label: t.detail.tour.nextStartLabel,
      value: schedules[0] ? formatDate(schedules[0].startAtUtc, locale) : t.detail.tour.noSchedules,
    },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="bg-[color:var(--bg)]">
      {/* A photo when there is one, the record's own poster when there is not --
          the same artwork the card showed, so the page does not change identity
          between list and detail. */}
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
        {hero ? (
          <Image src={hero} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="h-full w-full" style={posterStyle(tour.tourId)} aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-5xl px-6 pb-8 text-white">
            {tour.tourCategoryName && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                {category}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-semibold md:text-5xl">{title}</h1>
            {price && <p className="mt-2 text-lg text-white/90">{price}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold">{t.detail.tour.detailsTitle}</h2>
            <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
              {description.trim() || t.detail.tour.descriptionFallback}
            </p>
          </section>

          {gallery.length > 0 && (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((photo) => (
                <div
                  key={photo.photoId}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  <Image
                    src={imageUrl(photo.permanentRelativePath)}
                    alt={photo.label ?? tour.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold">{t.detail.tour.schedulesTitle}</h2>
            {schedules.length === 0 ? (
              <p className="mt-3 text-[color:var(--muted)]">{t.detail.tour.noSchedules}</p>
            ) : (
              <ul className="mt-4 divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
                {schedules.map((schedule) => (
                  <li
                    key={schedule.tourScheduleId}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"
                  >
                    <span className="font-medium">
                      {t.detail.tour.scheduleRange(
                        formatDate(schedule.startAtUtc, locale),
                        formatDate(schedule.endAtUtc, locale),
                      )}
                    </span>
                    <span className="text-sm text-[color:var(--muted)]">
                      {t.detail.tour.capacity(schedule.capacity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              {t.detail.tour.quickFactsTitle}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">{fact.label}</dt>
                  <dd className="text-end font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-[color:var(--primary-soft)] p-6">
            <h2 className="font-semibold">{t.detail.tour.planAheadTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
              {t.detail.tour.planAheadCopy}
            </p>
            <Link
              href={`mailto:${t.home.contactEmail}?subject=${encodeURIComponent(title)}`}
              className="mt-4 inline-flex rounded-xl bg-[color:var(--cta)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--cta-hover)]"
            >
              {t.home.contactCta}
            </Link>
          </div>

          <Link
            href="/tours"
            className="inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            ← {t.detail.tour.backCta}
          </Link>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

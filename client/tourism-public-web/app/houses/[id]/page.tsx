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

type HouseDetailDto = components["schemas"]["HouseDetailDto"];

const normalizeGuidParam = (value: string) => value.trim().replace(/^\{/, "").replace(/\}$/, "");

const isGuid = (value: string) =>
  // Shape only -- see the tour page for why the RFC-4122 version check went.
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const fetchHouseDetail = async (id: string): Promise<HouseDetailDto | null> => {
  try {
    return await getJson<HouseDetailDto>(apiEndpoints.houses.detail(id));
  } catch (error) {
    console.error("Failed to load house detail", error);
    return null;
  }
};

type HouseDetailParams = { params: { id?: string | string[] } | Promise<{ id?: string | string[] }> };

export default async function HouseDetailPage({ params }: HouseDetailParams) {
  const resolvedParams = await Promise.resolve(params);
  const locale = await resolveLocale();
  const isFarsi = locale === "fa";
  const t = i18n(locale);

  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.at(0) ?? "" : resolvedParams.id ?? "";
  const requestedId = rawId ? normalizeGuidParam(rawId) : "";
  const house = isGuid(requestedId) ? await fetchHouseDetail(requestedId) : null;

  if (!house) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">{t.detail.house.loadErrorTitle}</h1>
        <p className="mt-3 text-[color:var(--muted)]">{t.detail.house.loadErrorCopy}</p>
        <Link
          href="/houses"
          className="mt-8 inline-flex rounded-xl bg-[color:var(--cta)] px-6 py-3 text-sm font-semibold text-white"
        >
          {t.detail.backToHouses}
        </Link>
      </div>
    );
  }

  const number = new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US", { maximumFractionDigits: 0 });
  const price =
    house.price !== undefined && Number.isFinite(Number(house.price)) && house.currency
      ? `${number.format(Number(house.price))} ${house.currency}`
      : null;

  const listingType =
    Number(house.listingType) === 1
      ? t.detail.house.listingTypeValues.rent
      : Number(house.listingType) === 2
        ? t.detail.house.listingTypeValues.buy
        : null;

  const location = translateValue(
    [house.city, house.country].filter(Boolean).join("، "),
    locale,
  );
  const address = [house.line1, house.line2, translateValue(house.region, locale), house.postalCode].filter(
    Boolean,
  );

  const title = localized(house.name, house.nameEn, locale);
  const description = localized(house.description, house.descriptionEn, locale);

  const hero =
    imageUrl(house.photos?.[0]?.permanentRelativePath) ||
    destinationPhoto(house.name, location, house.description);
  const gallery = (house.photos ?? []).slice(1, 5);

  const facts = [
    {
      label: t.detail.house.typeLabel,
      value: localized(translateValue(house.houseTypeName, locale), house.houseTypeNameEn, locale),
    },
    { label: t.detail.house.listingTypeLabel, value: listingType },
    { label: t.detail.house.locationLabel, value: location || t.detail.house.locationFallback },
    { label: t.detail.house.postalCodeLabel, value: house.postalCode },
  ].filter((fact) => Boolean(fact.value));

  return (
    <div className="bg-[color:var(--bg)]">
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
        {hero ? (
          <Image src={hero} alt={title} fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="h-full w-full" style={posterStyle(house.houseId)} aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-5xl px-6 pb-8 text-white">
            {location && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                {location}
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
            <h2 className="text-xl font-semibold">{t.detail.house.quickFactsTitle}</h2>
            <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
              {description.trim() || t.detail.house.descriptionFallback}
            </p>
          </section>

          {gallery.length > 0 && (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.map((photo) => (
                <div key={photo.photoId} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={imageUrl(photo.permanentRelativePath)}
                    alt={photo.label ?? house.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </section>
          )}

          {address.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">{t.detail.house.addressTitle}</h2>
              <p className="mt-3 text-[color:var(--muted)]">{address.join(isFarsi ? "، " : ", ")}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
            <dl className="space-y-3 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">{fact.label}</dt>
                  <dd className="text-end font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-[color:var(--primary-soft)] p-6">
            <h2 className="font-semibold">{t.detail.house.exploreTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
              {t.detail.house.exploreCopy}
            </p>
            <Link
              href={`mailto:${t.home.contactEmail}?subject=${encodeURIComponent(title)}`}
              className="mt-4 inline-flex rounded-xl bg-[color:var(--cta)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--cta-hover)]"
            >
              {t.home.contactCta}
            </Link>
          </div>

          <Link
            href="/houses"
            className="inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            ← {t.detail.backToHouses}
          </Link>
        </aside>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

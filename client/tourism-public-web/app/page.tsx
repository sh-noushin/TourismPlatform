import Image from "next/image";
import Link from "next/link";

import heroImage from "@/app/assets/header.png";

import { HeroSearch } from "@/components/home/HeroSearch.client";
import { ListingCard } from "@/components/shared/ListingCard";
import { RateStrip } from "@/components/home/RateStrip";
import { TrustBlock } from "@/components/home/TrustBlock";
import { fetchTourCategories } from "@/lib/api/categories";
import { getRateSummaries } from "@/lib/api/exchange";
import { getFeaturedTours, getFeaturedHouses } from "@/lib/api/featured";
import { getPublicPageSections, type PublicSectionDto } from "@/lib/api/publicPage";
import { i18n, formatFarsiNumber } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";
import { translateValue } from "@/lib/i18n/translateValue";
import { resolveLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

/** Prices are the one number readers compare, so they get grouping separators
 *  and the currency after them, in the reader's own digits. */
const formatPrice = (
  value: number | string | undefined,
  currency: string | undefined,
  isFarsi: boolean,
) => {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return null;
  const numeric = Number(value);
  const formatted = new Intl.NumberFormat(isFarsi ? "fa-IR" : "en-US", {
    maximumFractionDigits: 0,
  }).format(numeric);
  return currency ? `${formatted} ${currency}` : formatted;
};

function SectionHeading({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-[color:var(--text)] md:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 leading-relaxed text-[color:var(--muted)]">{description}</p>
        )}
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm font-semibold text-[color:var(--primary)] hover:underline"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

export default async function Home() {
  const locale = await resolveLocale();
  const isFarsi = locale === "fa";
  const t = i18n(locale);

  // Everything the page needs, fetched together: a slow rate feed should not
  // delay the tours, and a failed one should not blank the page.
  const [tours, houses, publicSections, categories, rates] = await Promise.all([
    getFeaturedTours(locale),
    getFeaturedHouses(24, locale),
    getPublicPageSections(),
    fetchTourCategories().catch(() => []),
    getRateSummaries(7),
  ]);

  const topTours = tours.slice(0, 6);
  const topHouses = houses.slice(0, 6);

  // Distinct cities across the catalogue -- the "destinations" counter below.
  const destinationCount = new Set(
    houses.map((house) => house.city).filter((city): city is string => Boolean(city)),
  ).size;

  const findSection = (id: string, fallbackType?: number) => {
    const idLower = id.trim().toLowerCase();
    const byId = publicSections.find((section) => section.id?.trim().toLowerCase() === idLower);
    if (byId) return byId;
    if (fallbackType === undefined) return undefined;
    return publicSections.find((section) => Number(section.sectionType) === fallbackType);
  };

  // A CMS section carries both languages; in English the translation wins and
  // the Persian is the fallback, field by field. A section translated by half
  // shows an English heading over a Persian paragraph rather than nothing.
  const sectionText = (section: PublicSectionDto | undefined, field: "header" | "content", fallback: string) => {
    const english = field === "header" ? section?.headerEn : section?.contentEn;
    if (locale === "en" && english?.trim()) {
      return english.trim();
    }
    return (section?.[field] ?? "").trim() || fallback;
  };

  const toursSection = findSection("tours", 0);
  const housesSection = findSection("houses", 1);
  const infosSection = findSection("infos", 2) ?? findSection("info", 2);

  return (
    <div className="bg-[color:var(--bg)] text-[color:var(--text)]">
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {/* Two stops rather than one: the copy sits in the lower third, and a
            flat scrim over the whole photo would grey out the sky as well. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-28 text-white">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">
            {t.home.heroKicker}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            {t.home.heroSubtitle}
          </p>

          <div className="mt-8">
            <HeroSearch
              labelDestination={t.home.searchDestination}
              placeholder={t.home.searchPlaceholder}
              labelTours={t.home.searchKindTours}
              labelHouses={t.home.searchKindHouses}
              labelSubmit={t.home.searchSubmit}
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- categories */}
      {categories.length > 0 && (
        <section className="border-b border-[color:var(--border)] bg-[color:var(--surface)] py-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-6">
            <span className="me-2 text-sm font-medium text-[color:var(--muted)]">
              {t.home.categoriesTitle}
            </span>
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/tours?category=${encodeURIComponent(category.name)}`}
                className="rounded-full border border-[color:var(--border)] px-4 py-1.5 text-sm transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
              >
                {localized(translateValue(category.name, locale), category.nameEn, locale)}
              </Link>
            ))}
            <Link
              href="/tours"
              className="rounded-full bg-[color:var(--cta)] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[color:var(--cta-hover)]"
            >
              {t.home.categoriesAll}
            </Link>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------- tours */}
      <section className="py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
          <SectionHeading
            title={sectionText(toursSection, "header", t.headingTours)}
            description={sectionText(toursSection, "content", t.toursDescription)}
            href="/tours"
            linkLabel={t.allTrips}
          />

          {topTours.length === 0 ? (
            <p className="text-[color:var(--muted)]">{t.noTours}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topTours.map((tour) => (
                <ListingCard
                  key={tour.tourId}
                  id={tour.tourId}
                  href={`/tours/${tour.tourId}`}
                  name={localized(tour.name, tour.nameEn, locale)}
                  context={localized(
                    translateValue(tour.tourCategoryName, locale),
                    tour.tourCategoryNameEn,
                    locale,
                  )}
                  description={localized(tour.description, tour.descriptionEn, locale)}
                  image={tour.photos?.[0]?.permanentRelativePath}
                  price={formatPrice(tour.price, tour.currency, isFarsi)}
                  meta={
                    tour.year
                      ? isFarsi
                        ? formatFarsiNumber(Number(tour.year))
                        : String(tour.year)
                      : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------- houses */}
      <section className="bg-[color:var(--surface-sunken)] py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6">
          <SectionHeading
            title={sectionText(housesSection, "header", t.headingHouses)}
            description={sectionText(housesSection, "content", t.housesDescription)}
            href="/houses"
            linkLabel={t.allHouses}
          />

          {topHouses.length === 0 ? (
            <p className="text-[color:var(--muted)]">{t.noHouses}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topHouses.map((house) => (
                <ListingCard
                  key={house.houseId}
                  id={house.houseId}
                  href={`/houses/${house.houseId}`}
                  name={localized(house.name, house.nameEn, locale)}
                  context={translateValue(
                    [house.city, house.country].filter(Boolean).join("، "),
                    locale,
                  )}
                  description={localized(house.description, house.descriptionEn, locale)}
                  image={house.photos?.[0]?.permanentRelativePath}
                  price={formatPrice(house.price, house.currency, isFarsi)}
                  meta={localized(translateValue(house.houseTypeName, locale), house.houseTypeNameEn, locale)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------- rates */}
      <RateStrip rates={rates} t={t} isFarsi={isFarsi} />

      {/* ------------------------------------------------------ about the firm */}
      <section id="about" className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 md:items-center">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={heroImage}
              alt=""
              width={900}
              height={640}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              {sectionText(infosSection, "header", t.about.heading)}
            </h2>
            <p className="mt-3 leading-relaxed text-[color:var(--muted)]">
              {sectionText(infosSection, "content", t.about.description)}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- trust/contact */}
      <TrustBlock
        t={t}
        isFarsi={isFarsi}
        tourCount={tours.length}
        destinationCount={destinationCount}
      />
    </div>
  );
}

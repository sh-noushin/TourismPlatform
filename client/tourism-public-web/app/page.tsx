import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/home/Hero";
import { getFeaturedTours, getFeaturedHouses } from "@/lib/api/featured";
import { imageUrl } from "@/lib/utils/imageUrl";
import { i18n, type Translations, formatFarsiNumber } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const formatPrice = (
  value: number | string | undefined,
  currency: string | undefined,
  isFarsi: boolean,
) => {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return null;
  const numeric = Number(value);
  const formatted = isFarsi ? formatFarsiNumber(numeric) : new Intl.NumberFormat("en-US").format(numeric);
  return {
    amount: formatted,
    currency,
  };
};

const getBadgeClassName = (isFarsi: boolean) =>
  [
    "bg-[#0d97d6]",
    "flex",
    "w-full",
    "items-center",
    "justify-between",
    "rounded-none",
    "px-4",
    "py-2",
    "text-[11px]",
    "font-semibold",
    "leading-none",
    "text-white",
    "shadow-sm",
    isFarsi ? "tracking-[0.08em]" : "tracking-[0.22em] uppercase",
  ].join(" ");

const formatYearForLocale = (value: number | string | undefined, isFarsi: boolean) => {
  const fallbackYear = new Date().getFullYear();
  const parsedYear = typeof value === "number" ? value : Number(value ?? fallbackYear);
  const safeYear = Number.isFinite(parsedYear) ? parsedYear : fallbackYear;
  return isFarsi ? formatFarsiNumber(safeYear) : String(safeYear);
};

const TourCard = ({
  id,
  name,
  category,
  description,
  price,
  currency,
  year,
  image,
  translations,
  isFarsi,
}: {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  price?: number | string;
  currency?: string;
  year?: number;
  image?: string | null;
  translations: Translations;
  isFarsi: boolean;
}) => {
  const src = imageUrl(image ?? undefined);
  const priceValue = formatPrice(price, currency, isFarsi);
  const daysLabel = translations.cards.tourDurationLabel(9);
  const yearLabel = formatYearForLocale(year, isFarsi);
  const descriptionText = description || translations.cards.tourDescriptionFallback;
  const badgeClassName = getBadgeClassName(isFarsi);
  const priceText = priceValue ? (
    <>
      <span>{translations.priceLabel}:</span>
      <span className="flex items-center gap-1" dir={isFarsi ? "ltr" : "ltr"}>
        <span>{priceValue.amount}</span>
        {priceValue.currency && <span>{priceValue.currency}</span>}
      </span>
    </>
  ) : (
    translations.cards.pricingSoon
  );
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="relative h-52 w-full">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" sizes="(min-width:1024px) 25vw, 90vw" priority />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-lg font-semibold text-slate-500">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={badgeClassName}>
        <span>{daysLabel}</span>
        <span>{yearLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">{category}</div>
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{descriptionText}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">{priceText}</span>
          <Link
            href={`/tours/${id}`}
            className="flex items-center gap-2 rounded-md bg-[#1273b5] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#0f5f95]"
          >
            {translations.seeDetails} <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

const HouseCard = ({
  id,
  name,
  description,
  city,
  country,
  price,
  currency,
  image,
  translations,
  isFarsi,
}: {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  price?: number | string;
  currency?: string;
  image?: string | null;
  translations: Translations;
  isFarsi: boolean;
}) => {
  const src = imageUrl(image ?? undefined);
  const priceValue = formatPrice(price, currency, isFarsi);
  const location = [city, country].filter(Boolean).join(", ");
  const yearLabel = formatYearForLocale(undefined, isFarsi);
  const statusLabel = translations.cards.availableStatus;
  const locationText = location || translations.cards.houseLocationFallback;
  const descriptionText = description || translations.cards.houseDescriptionFallback;
  const badgeClassName = getBadgeClassName(isFarsi);
  const priceText = priceValue ? (
    <>
      <span>{translations.priceLabel}:</span>
      <span className="flex items-center gap-1" dir={isFarsi ? "ltr" : "ltr"}>
        <span>{priceValue.amount}</span>
        {priceValue.currency && <span>{priceValue.currency}</span>}
      </span>
    </>
  ) : (
    translations.cards.pricingSoon
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="relative h-52 w-full">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" sizes="(min-width:1024px) 25vw, 90vw" priority />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-lg font-semibold text-slate-500">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className={badgeClassName}>
        <span>{yearLabel}</span>
        <span>{statusLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">{locationText}</div>
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{descriptionText}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">{priceText}</span>
          <Link
            href={`/houses/${id}`}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
          >
            {translations.seeDetails}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default async function Home() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

  const t = i18n(locale);
  const [tours, houses] = await Promise.all([getFeaturedTours(locale), getFeaturedHouses(6, locale)]);
  const isFarsi = locale === "fa";
  const topTours = tours.slice(0, 3);
  const topHouses = houses.slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero
        heading={t.headingTours}
        body={t.toursDescription}
        toursCta={t.allTrips}
        housesCta={t.allHouses}
      />

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <h2
              className={`mt-2 text-sky-600 ${
                isFarsi ? "!text-3xl !font-black md:!text-4xl" : "text-3xl font-semibold"
              }`}
            >
              {t.headingTours}
            </h2>
            <p className="mt-1 text-sm text-slate-600 md:text-base">{t.toursDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {topTours.map((tour) => (
              <TourCard
                key={tour.tourId}
                id={tour.tourId}
                name={tour.name}
                category={tour.tourCategoryName}
                description={tour.description}
                price={tour.price}
                currency={tour.currency}
                year={tour.year}
                image={tour.photos?.[0]?.permanentRelativePath}
                translations={t}
                isFarsi={isFarsi}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/tours"
              className="inline-flex items-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg hover:bg-sky-500"
            >
              {t.allTrips}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <h2
              className={`mt-2 text-sky-600 ${
                isFarsi ? "!text-3xl !font-black md:!text-4xl" : "text-3xl font-semibold"
              }`}
            >
              {t.headingHouses}
            </h2>
            <p className="mt-1 text-sm text-slate-600 md:text-base">{t.housesDescription}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {topHouses.map((house) => (
              <HouseCard
                key={house.houseId}
                id={house.houseId}
                name={house.name}
                description={house.description}
                city={house.city}
                country={house.country}
                price={house.price}
                currency={house.currency}
                image={house.photos?.[0]?.permanentRelativePath}
                translations={t}
                isFarsi={isFarsi}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/houses"
              className="inline-flex items-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg hover:bg-sky-500"
            >
              {t.allHouses}
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-3xl shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
                alt={t.about.heading}
                width={900}
                height={600}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">{t.about.tagline}</p>
              <h3 className="text-3xl font-semibold text-slate-900">{t.about.heading}</h3>
              <p className="text-base text-slate-700">{t.about.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tours"
                  className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow hover:bg-sky-500"
                >
                  {t.about.learnMore}
                </Link>
                <Link
                  href="mailto:hello@parker.travel"
                  className="rounded-full border border-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 hover:bg-sky-50"
                >
                  {t.about.contact}
                </Link>
              </div>
            </div>
          </div>
      </section>
    </main>
  );
}

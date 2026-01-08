import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/components/home/Hero";
import { getFeaturedTours, getFeaturedHouses } from "@/lib/api/featured";
import { imageUrl } from "@/lib/utils/imageUrl";
import { i18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const formatPrice = (value: number | string | undefined, currency: string | undefined) => {
  if (value === undefined || value === null || !Number.isFinite(Number(value))) return "";
  const formatted = new Intl.NumberFormat("en-US").format(Number(value));
  return currency ? `${formatted} ${currency}` : formatted;
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
}: {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  price?: number | string;
  currency?: string;
  year?: number;
  image?: string | null;
  }) => {
    const src = imageUrl(image ?? undefined);
    const priceLabel = formatPrice(price, currency);
    const daysLabel = "9 DAYS";
    const yearLabel = year ?? "2026";
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
        <div className="bg-[#0d97d6] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm">
          {daysLabel} · {yearLabel}
        </div>
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">{category}</div>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{description || "An unforgettable journey awaits."}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <span className="text-amber-500">★</span>
              <span>4.8</span>
              <span className="text-slate-400">·</span>
              <span>{priceLabel || "Pricing soon"}</span>
            </div>
            <Link
              href={`/tours/${id}`}
              className="flex items-center gap-2 rounded-md bg-[#1273b5] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#0f5f95]"
            >
              View Details <span aria-hidden="true">›</span>
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
}: {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  price?: number | string;
  currency?: string;
  image?: string | null;
}) => {
  const src = imageUrl(image ?? undefined);
  const priceLabel = formatPrice(price, currency);
  const location = [city, country].filter(Boolean).join(", ");

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
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-white">
          <span className="rounded-full bg-sky-600 px-3 py-1 shadow">2026</span>
          <span className="rounded-full bg-sky-800 px-3 py-1 shadow">Available</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">{location || "Featured stay"}</div>
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{description || "A curated home for your next escape."}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
            <span className="text-amber-500">★</span>
            <span>4.8</span>
            <span className="text-slate-400">·</span>
            <span>{priceLabel ? `from ${priceLabel}` : "Pricing soon"}</span>
          </div>
          <Link
            href={`/houses/${id}`}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-500"
          >
            View Details
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
  const topTours = tours.slice(0, 3);
  const topHouses = houses.slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Hero />

      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Our Recent Tours</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">The best new adventures chosen just for you!</h2>
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
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/tours"
              className="inline-flex items-center rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg hover:bg-sky-500"
            >
              View All Tours
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Explore Our Top Houses</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Amazing places for a perfect stay</h2>
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
              alt="Planning a trip"
              width={900}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Travel the World</p>
            <h3 className="text-3xl font-semibold text-slate-900">Plan with our travel agency</h3>
            <p className="text-base text-slate-700">
              Discover tailored itineraries, curated homes, and seamless journeys. Our team handles the details so you can
              focus on the experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tours"
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow hover:bg-sky-500"
              >
                Learn More
              </Link>
              <Link
                href="mailto:hello@parker.travel"
                className="rounded-full border border-sky-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 hover:bg-sky-50"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

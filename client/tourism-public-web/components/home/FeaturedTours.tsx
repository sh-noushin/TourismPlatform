import { getFeaturedTours } from "@/lib/api/featured";
import { FeaturedTourCard } from "./FeaturedTourCard";
import Link from "next/link";
import { i18n } from "@/lib/i18n";

interface FeaturedToursProps {
  page?: number;
  pageSize?: number;
  locale?: string;
}

const buildPageHref = (page: number) => {
  const params = new URLSearchParams();
  params.set("toursPage", String(page));
  return `/?${params.toString()}`;
};

export async function FeaturedTours({ page = 1, pageSize = 4, locale }: FeaturedToursProps & { locale?: string }) {
  const data = await getFeaturedTours(locale).catch((error) => {
    console.error("Failed to load featured tours", error);
    return [];
  });

  const t = i18n(locale);

  // Always show tours, preferring most recent years but not hiding missing year data
  const visibleToursSource = data
    .slice()
    .sort((a, b) => {
      const byYear = (b.year ?? 0) - (a.year ?? 0);
      return byYear !== 0 ? byYear : a.name.localeCompare(b.name);
    });

  const totalCount = visibleToursSource.length;
  const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, maxPage);
  const startIndex = (currentPage - 1) * pageSize;
  const tours = visibleToursSource.slice(startIndex, startIndex + pageSize);

  if (!tours.length) {
    return (
      <section className="bg-gradient-to-b from-[#0f1624] via-[#0b111a] to-[#0a0d14] py-16 text-center text-slate-100">
        <p className="text-lg text-slate-200">{t.noTours}</p>
      </section>
    );
  }

  return (
    <section className="relative -mt-6 bg-gradient-to-b from-[#0f1624] via-[#0b111a] to-[#0a0d14] pb-12 pt-18 lang-balanced-section">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center text-slate-100">
          <h2 className="mt-3 font-serif text-3xl font-semibold text-white md:text-4xl">{t.headingTours}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-200 md:text-base">{t.toursDescription}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {tours.map((tour, index) => {
            const rowIndex = Math.floor(index / 3);
            const imageSide = rowIndex % 2 === 0 ? "left" : "right";
            return <FeaturedTourCard key={tour.tourId} tour={tour} imageSide={imageSide} locale={locale} />;
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/tours"
            className="rounded-full border border-sky-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100 transition hover:bg-sky-500 hover:text-[#0a0d14]"
          >
            {t.allTrips}
          </Link>

          {maxPage > 1 ? (
            <div className="flex items-center justify-center gap-3 text-xs text-slate-200">
                <Link
                aria-disabled={currentPage <= 1}
                href={buildPageHref(Math.max(1, currentPage - 1))}
                className={`rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "bg-white/10 text-slate-100 hover:bg-white/20"
                }`}
              >
                {t.previous}
              </Link>
              <span className="text-xs text-slate-200">{t.pageOf(currentPage, maxPage)}</span>
                <Link
                aria-disabled={currentPage >= maxPage}
                href={buildPageHref(Math.min(maxPage, currentPage + 1))}
                className={`rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentPage >= maxPage
                    ? "pointer-events-none opacity-50"
                    : "bg-white/10 text-slate-100 hover:bg-white/20"
                }`}
              >
                {t.next}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

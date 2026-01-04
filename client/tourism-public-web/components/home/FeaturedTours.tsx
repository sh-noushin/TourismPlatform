import { getFeaturedTours } from "@/lib/api/featured";
import { FeaturedTourCard } from "./FeaturedTourCard";
import Link from "next/link";

interface FeaturedToursProps {
  page?: number;
  pageSize?: number;
}

const buildPageHref = (page: number) => {
  const params = new URLSearchParams();
  params.set("toursPage", String(page));
  return `/?${params.toString()}`;
};

export async function FeaturedTours({ page = 1, pageSize = 4 }: FeaturedToursProps) {
  const data = await getFeaturedTours().catch((error) => {
    console.error("Failed to load featured tours", error);
    return [];
  });

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
      <section className="bg-gradient-to-b from-[#f0f7fb] via-white to-[#f6fbff] py-16 text-center">
        <p className="text-lg text-slate-700">No tours available right now.</p>
      </section>
    );
  }

  return (
    <section className="relative -mt-8 bg-gradient-to-b from-[#f0f7fb] via-white to-[#f6fbff] pb-16 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">Your best adventure</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-slate-900 md:text-5xl">Find the trip you love</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-700">
            There are many variations of passages of lorem ipsum available, but the majority have suffered alteration
            in some form, by injected humour, or randomised words which don&apos;t look even slightly believable.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:auto-rows-fr">
          {tours.map((tour, index) => {
            const rowIndex = Math.floor(index / 2);
            const imageSide = rowIndex % 2 === 0 ? "left" : "right";
            return <FeaturedTourCard key={tour.tourId} tour={tour} imageSide={imageSide} />;
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/tours"
            className="rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            All trips
          </Link>

          {maxPage > 1 ? (
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <Link
                aria-disabled={currentPage <= 1}
                href={buildPageHref(Math.max(1, currentPage - 1))}
                className={`rounded-md border border-slate-200 px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "bg-white/80 text-slate-900 hover:bg-white"
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-slate-700">
                Page {currentPage} of {maxPage}
              </span>
              <Link
                aria-disabled={currentPage >= maxPage}
                href={buildPageHref(Math.min(maxPage, currentPage + 1))}
                className={`rounded-md border border-slate-200 px-4 py-2 text-sm font-medium transition-colors ${
                  currentPage >= maxPage
                    ? "pointer-events-none opacity-50"
                    : "bg-white/80 text-slate-900 hover:bg-white"
                }`}
              >
                Next
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

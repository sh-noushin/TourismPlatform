import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { FeaturedHouses } from "@/components/home/FeaturedHouses";

type SearchParams = Record<string, string | string[] | undefined>;

interface HomeProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

const toNumber = (value: string | string[] | undefined, fallback: number) => {
  if (!value) return fallback;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const toursPage = toNumber(resolvedSearchParams.toursPage, 1);

  return (
    <main className="min-h-screen bg-[#f6fbff]">
      <Hero />

      <FeaturedTours page={toursPage} pageSize={4} />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">Stays you will love</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-900 md:text-[32px]">
              Featured houses
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-700 md:text-base">
              Browse comfortable stays that pair perfectly with your adventure.
            </p>
          </div>

          <div className="mt-8">
            <FeaturedHouses />
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/houses"
              className="rounded-full border border-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 transition hover:border-slate-900/60 hover:bg-slate-900 hover:text-white"
            >
              All houses
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

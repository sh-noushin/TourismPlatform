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

      <FeaturedTours page={toursPage} pageSize={6} />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center text-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">Stays you will love</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-900 md:text-4xl">
              Featured houses
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-base text-slate-700">
              Browse comfortable stays that pair perfectly with your adventure.
            </p>
          </div>

          <div className="mt-10">
            <FeaturedHouses />
          </div>
        </div>
      </section>
    </main>
  );
}

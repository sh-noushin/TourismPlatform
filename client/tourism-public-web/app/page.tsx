import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { FeaturedTours } from "@/components/home/FeaturedTours";
import { FeaturedHouses } from "@/components/home/FeaturedHouses";
import { cookies } from "next/headers";
import { i18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";

  const t = i18n(locale);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d111a] via-[#0b1018] to-[#0a0d14] text-slate-100">
      <Hero />

      <FeaturedTours page={toursPage} pageSize={6} locale={locale} />

      <section className="bg-gradient-to-b from-[#0f1624] via-[#0b111a] to-[#0a0d14] py-12">
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{t.stayInspired}</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white md:text-[32px]">{t.headingHouses}</h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-200/90 md:text-base">{t.housesDescription}</p>
          </div>

          <div className="mt-8">
            <FeaturedHouses locale={locale} />
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/houses"
              className="rounded-full border border-sky-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100 transition hover:bg-sky-500 hover:text-[#0a0d14]"
            >
              {t.allHouses}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

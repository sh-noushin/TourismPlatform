import Link from "next/link";

import { Badge, Card } from "@/components/ui";
import { CategoryChips } from "@/components/shared/CategoryChips";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";

const highlights = [
  {
    title: "Browse Houses",
    description: "Filter by size, location, price, and room count with ImmoScout-inspired controls.",
  },
  {
    title: "Plan Tours",
    description: "Compare curated tours, calendars, and upcoming dates in one place.",
  },
  {
    title: "Stay Informed",
    description: "Shareable filter URLs and pagination keep every view ready to revisit.",
  },
];

const pillLinkClasses =
  "rounded-full border border-border px-5 py-2 text-sm font-semibold text-text transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

interface HouseTypeDto {
  id: string;
  name: string;
}

interface TourCategoryDto {
  id: string;
  name: string;
}

const buildHouseHref = (name: string) => `/houses?type=${encodeURIComponent(name)}`;
const buildTourHref = (name: string) => `/tours?category=${encodeURIComponent(name)}`;

const fetchHouseTypes = async () => {
  try {
    return await getJson<HouseTypeDto[]>(apiEndpoints.categories.houseTypes);
  } catch (error) {
    console.error("Failed to load house types", error);
    return [] as HouseTypeDto[];
  }
};

const fetchTourCategories = async () => {
  try {
    return await getJson<TourCategoryDto[]>(apiEndpoints.categories.tourCategories);
  } catch (error) {
    console.error("Failed to load tour categories", error);
    return [] as TourCategoryDto[];
  }
};

export default async function Home() {
  const [houseTypes, tourCategories] = await Promise.all([fetchHouseTypes(), fetchTourCategories()]);

  const houseTypeChips = houseTypes.map((type) => ({
    label: type.name,
    href: buildHouseHref(type.name),
  }));

  const tourCategoryChips = tourCategories.map((category) => ({
    label: category.name,
    href: buildTourHref(category.name),
  }));

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16">
      <section className="space-y-6 rounded-3xl border border-border bg-surface p-10 shadow-sm shadow-black/5">
        <Badge variant="solid" className="w-fit">
          Public Experience
        </Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-text">Discover houses and tours</h1>
          <p className="text-base text-muted">
            The Tourism Platform front-end reuses shared tokens, neutral surfaces and reusable UI primitives so every page feels
            consistent.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/houses" className={pillLinkClasses}>
            Explore Houses
          </Link>
          <Link href="/tours" className={pillLinkClasses}>
            View Tours
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-surface p-8 shadow-sm shadow-black/5 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text">Browse houses by type</h2>
            <p className="text-sm text-muted">Filter the house list by the type you are interested in.</p>
          </div>
          <Link href="/houses" className={pillLinkClasses}>
            View all Houses
          </Link>
        </div>
        <CategoryChips items={houseTypeChips} />
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-surface p-8 shadow-sm shadow-black/5 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text">Browse tours by category</h2>
            <p className="text-sm text-muted">Explore curated tours grouped by destination or theme.</p>
          </div>
          <Link href="/tours" className={pillLinkClasses}>
            View all Tours
          </Link>
        </div>
        <CategoryChips items={tourCategoryChips} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-text">{item.title}</h2>
            <p className="text-sm text-muted">{item.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

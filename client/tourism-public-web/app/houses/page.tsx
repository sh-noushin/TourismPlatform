import type { components } from "@/lib/openapi/types";

import { HouseFilters } from "@/components/houses/HouseFilters.client";
import { HouseResults } from "@/components/houses/HouseResults.server";
import { fetchHouseTypes, CategoryDto } from "@/lib/api/categories";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { houseSortValues, parseHouseFilters, toHouseQuery, HouseFilters as HouseFiltersShape } from "@/lib/filters/houses";
import { cookies } from "next/headers";
import { i18n } from "@/lib/i18n";
import type { SortOption } from "@/components/shared/SortDropdown.client";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

type SearchParams = Record<string, string | string[] | undefined>;

interface HousesPageProps {
  searchParams: SearchParams | Promise<SearchParams>;
}

const filterHouses = (houses: HouseSummaryDto[], filters: HouseFiltersShape) => {
  const normalizedLocation = filters.location?.toLowerCase().trim();

  return houses.filter((house) => {
    if (filters.type && house.houseTypeName !== filters.type) {
      return false;
    }

    if (normalizedLocation) {
      const locationTokens = [house.city, house.country]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!locationTokens.includes(normalizedLocation)) {
        return false;
      }
    }

    return true;
  });
};

const sortHouses = (houses: HouseSummaryDto[], sort: HouseFiltersShape["sort"]) => {
  return [...houses].sort((a, b) => {
    if (sort === "nameDesc") {
      return b.name.localeCompare(a.name);
    }
    return a.name.localeCompare(b.name);
  });
};

export default async function HousesPage({ searchParams }: HousesPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const filters = parseHouseFilters(resolvedSearchParams);
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const translations = i18n(locale);
  const sortOptions: SortOption[] = houseSortValues.map((value) => ({
    value,
    label: translations.sort.houses[value],
  }));

  const [houseTypes, houses] = await Promise.all([
    fetchHouseTypes().catch((error) => {
      console.error("Failed to load house types", error);
      return [] as CategoryDto[];
    }),
    getJson<HouseSummaryDto[]>(apiEndpoints.houses.list, toHouseQuery(filters)).catch((error) => {
      console.error("Failed to load houses", error);
      return [] as HouseSummaryDto[];
    }),
  ]);

  const filtered = filterHouses(houses, filters);
  const sorted = sortHouses(filtered, filters.sort);

  const totalCount = sorted.length;
  const maxPage = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const currentPage = Math.min(filters.page, maxPage);
  const startIndex = (currentPage - 1) * filters.pageSize;
  const paged = sorted.slice(startIndex, startIndex + filters.pageSize);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="lg:sticky lg:top-8">
          <HouseFilters
            initialFilters={filters}
            houseTypes={houseTypes}
            filtersTranslation={translations.filters}
            sortLabel={translations.sort.label}
            sortOptions={sortOptions}
          />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-[0_40px_80px_rgba(0,0,0,0.7)] backdrop-blur">
          <HouseResults
            houses={paged}
            page={currentPage}
            pageSize={filters.pageSize}
            totalCount={totalCount}
            currentQuery={resolvedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}

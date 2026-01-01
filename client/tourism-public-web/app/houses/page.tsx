import type { components } from "@/lib/openapi/types";

import { HouseFilters } from "@/components/houses/HouseFilters.client";
import { HouseResults } from "@/components/houses/HouseResults.server";
import { fetchHouseTypes, CategoryDto } from "@/lib/api/categories";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { parseHouseFilters, toHouseQuery, HouseFilters as HouseFiltersShape } from "@/lib/filters/houses";

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
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <div className="w-full">
        <div className="lg:sticky lg:top-8">
          <HouseFilters initialFilters={filters} houseTypes={houseTypes} />
        </div>
      </div>

      <div className="space-y-6">
        <HouseResults
          houses={paged}
          page={currentPage}
          pageSize={filters.pageSize}
          totalCount={totalCount}
          currentQuery={resolvedSearchParams}
        />
      </div>
    </div>
  );
}

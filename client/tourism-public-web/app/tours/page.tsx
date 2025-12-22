import type { components } from "@/lib/openapi/types";

import { TourFilters } from "@/components/tours/TourFilters.client";
import { TourResults } from "@/components/tours/TourResults.server";
import { fetchTourCategories, CategoryDto } from "@/lib/api/categories";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { parseTourFilters, toTourQuery, TourFilters as TourFiltersShape } from "@/lib/filters/tours";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];
type SearchParams = Record<string, string | string[] | undefined>;

interface ToursPageProps {
  searchParams: SearchParams;
}

const filterTours = (tours: TourSummaryDto[], filters: TourFiltersShape) => {
  const normalizedDestination = filters.destination?.toLowerCase().trim();

  return tours.filter((tour) => {
    if (filters.category && tour.tourCategoryName !== filters.category) {
      return false;
    }

    if (normalizedDestination) {
      const haystack = [tour.name, tour.tourCategoryName].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(normalizedDestination)) {
        return false;
      }
    }

    return true;
  });
};

const sortTours = (tours: TourSummaryDto[], sort: TourFiltersShape["sort"]) => {
  return [...tours].sort((a, b) => {
    if (sort === "nameDesc") {
      return b.name.localeCompare(a.name);
    }

    if (sort === "categoryAsc") {
      return a.tourCategoryName.localeCompare(b.tourCategoryName);
    }

    if (sort === "categoryDesc") {
      return b.tourCategoryName.localeCompare(a.tourCategoryName);
    }

    return a.name.localeCompare(b.name);
  });
};

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const filters = parseTourFilters(searchParams);

  const [tourCategories, tours] = await Promise.all([
    fetchTourCategories().catch((error) => {
      console.error("Failed to load tour categories", error);
      return [] as CategoryDto[];
    }),
    getJson<TourSummaryDto[]>(apiEndpoints.tours.list, toTourQuery(filters)).catch((error) => {
      console.error("Failed to load tours", error);
      return [] as TourSummaryDto[];
    }),
  ]);

  const filtered = filterTours(tours, filters);
  const sorted = sortTours(filtered, filters.sort);

  const totalCount = sorted.length;
  const maxPage = Math.max(1, Math.ceil(totalCount / filters.pageSize));
  const currentPage = Math.min(filters.page, maxPage);
  const startIndex = (currentPage - 1) * filters.pageSize;
  const paged = sorted.slice(startIndex, startIndex + filters.pageSize);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
      <div className="w-full">
        <TourFilters initialFilters={filters} tourCategories={tourCategories} />
      </div>

      <div className="space-y-6">
        <TourResults
          tours={paged}
          page={currentPage}
          pageSize={filters.pageSize}
          totalCount={totalCount}
          currentQuery={searchParams}
        />
      </div>
    </div>
  );
}

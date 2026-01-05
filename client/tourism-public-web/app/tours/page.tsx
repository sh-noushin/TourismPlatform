import type { components } from "@/lib/openapi/types";

import { TourFilters } from "@/components/tours/TourFilters.client";
import { TourResults } from "@/components/tours/TourResults.server";
import { fetchTourCategories, CategoryDto } from "@/lib/api/categories";
import { getJson } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { parseTourFilters, toTourQuery, TourFilters as TourFiltersShape, tourSortValues } from "@/lib/filters/tours";
import { cookies } from "next/headers";
import { i18n } from "@/lib/i18n";
import type { SortOption } from "@/components/shared/SortDropdown.client";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];
type SearchParams = Record<string, string | string[] | undefined>;

interface ToursPageProps {
  searchParams: SearchParams | Promise<SearchParams>;
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
  const resolvedSearchParams = (await Promise.resolve(searchParams)) ?? {};
  const filters = parseTourFilters(resolvedSearchParams);
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const translations = i18n(locale);
  const sortOptions: SortOption[] = tourSortValues.map((value) => ({
    value,
    label: translations.sort.tours[value],
  }));

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
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="lg:sticky lg:top-8">
              <TourFilters
                initialFilters={filters}
                tourCategories={tourCategories}
                filtersTranslation={translations.filters}
                sortLabel={translations.sort.label}
                sortOptions={sortOptions}
              />
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-[0_40px_80px_rgba(0,0,0,0.7)] backdrop-blur">
          <TourResults
            tours={paged}
            page={currentPage}
            pageSize={filters.pageSize}
            totalCount={totalCount}
            currentQuery={resolvedSearchParams}
                title={translations.results.toursHeader(totalCount)}
          />
        </div>
      </div>
    </div>
  );
}

import type { components } from "@/lib/openapi/types";

import { EmptyState, Pagination } from "@/components/ui";
import { TourCard } from "./TourCard";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];

interface TourResultsProps {
  tours: TourSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  currentQuery: Record<string, string | string[] | undefined>;
}

export function TourResults({ tours, page, pageSize, totalCount, currentQuery }: TourResultsProps) {
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : Math.min(totalCount, startIndex + tours.length - 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Tours</h1>
          <p className="text-sm text-muted">
            Showing {startIndex}-{endIndex} of {totalCount} experiences
          </p>
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          basePath="/tours"
          currentQuery={currentQuery}
          className="flex-wrap justify-end"
        />
      </div>

      {tours.length === 0 ? (
        <EmptyState
          title="No tours found"
          description="Change your filters to discover new experiences."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tours.map((tour) => (
            <TourCard key={tour.tourId} tour={tour} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        basePath="/tours"
        currentQuery={currentQuery}
        className="flex-wrap justify-center"
      />
    </section>
  );
}

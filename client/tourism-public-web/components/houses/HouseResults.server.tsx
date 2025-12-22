import type { components } from "@/lib/openapi/types";

import { EmptyState, Pagination } from "@/components/ui";
import { HouseCard } from "./HouseCard";
import { houseSortOptions } from "@/lib/filters/houses";
import { SortDropdown } from "@/components/shared/SortDropdown.client";
import { resolveSortValue } from "@/components/shared/SortDropdown.utils";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

interface HouseResultsProps {
  houses: HouseSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  currentQuery: Record<string, string | string[] | undefined>;
}

export function HouseResults({ houses, page, pageSize, totalCount, currentQuery }: HouseResultsProps) {
  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : Math.min(totalCount, startIndex + houses.length - 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{totalCount} results</p>
          <h1 className="text-2xl font-semibold text-text">Houses</h1>
          <p className="text-sm text-muted">
            Showing {startIndex}-{endIndex} of {totalCount} homes
          </p>
        </div>
        <SortDropdown
          label="Sort"
          value={resolveSortValue(currentQuery, houseSortOptions[0].value)}
          options={houseSortOptions}
          basePath="/houses"
          currentQuery={currentQuery}
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          basePath="/houses"
          currentQuery={currentQuery}
          className="flex-wrap justify-end"
        />
      </div>

      {houses.length === 0 ? (
        <EmptyState
          title="No homes found"
          description="Adjust your filters to discover more accommodations."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {houses.map((house) => (
            <HouseCard key={house.houseId} house={house} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        basePath="/houses"
        currentQuery={currentQuery}
        className="flex-wrap justify-center"
      />
    </section>
  );
}

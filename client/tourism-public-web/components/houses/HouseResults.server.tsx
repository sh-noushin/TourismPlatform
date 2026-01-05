import { cookies } from "next/headers";
import { EmptyState, Pagination } from "@/components/ui";
import { SortDropdown } from "@/components/shared/SortDropdown.client";
import type { SortOption } from "@/components/shared/SortDropdown.client";
import { resolveSortValue } from "@/components/shared/SortDropdown.utils";
import { HouseCard } from "./HouseCard";
import { houseSortValues, type HouseSort } from "@/lib/filters/houses";
import { i18n } from "@/lib/i18n";
import type { components } from "@/lib/openapi/types";

type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

type HouseResultsProps = {
  houses: HouseSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  currentQuery: Record<string, string | string[] | undefined>;
};

export async function HouseResults({ houses, page, pageSize, totalCount, currentQuery }: HouseResultsProps) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const t = i18n(locale);

  const defaultSort = (houseSortValues[0] ?? ("nameAsc" as HouseSort)) as HouseSort;
  const requestedSort = resolveSortValue(currentQuery, defaultSort);
  const sortValue =
    requestedSort && houseSortValues.includes(requestedSort as HouseSort)
      ? (requestedSort as HouseSort)
      : defaultSort;

  const sortOptions: SortOption[] = houseSortValues.map((value) => ({
    value,
    label: t.sort.houses[value],
  }));

  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : Math.min(totalCount, startIndex + houses.length - 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t.results.housesResultsLabel(totalCount)}
          </p>
          <h1 className="text-2xl font-semibold text-text">{t.headingHouses}</h1>
          <p className="text-sm text-muted">
            {t.results.housesRangeLabel(startIndex, endIndex, totalCount)}
          </p>
        </div>
        <SortDropdown
          label={t.sort.label}
          value={sortValue}
          options={sortOptions}
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
        <EmptyState title={t.results.housesEmptyTitle} description={t.results.housesEmptyDescription} />
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

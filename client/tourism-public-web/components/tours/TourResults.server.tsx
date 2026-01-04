import { SortDropdown } from "../shared/SortDropdown.client";
import { TourCard } from "./TourCard";

type QueryValue = string | string[] | undefined;

export type SortOption = {
  value: string;
  label: string;
};

const tourSortOptions = [
  { value: "nameAsc", label: "Name (A → Z)" },
  { value: "nameDesc", label: "Name (Z → A)" },
  { value: "categoryAsc", label: "Category (A → Z)" },
  { value: "categoryDesc", label: "Category (Z → A)" },
] as const;

export interface TourResultsProps {
  tours: Array<{ id?: string | number; [key: string]: unknown }>;
  currentQuery: Record<string, QueryValue>;
  basePath?: string;
  title?: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

function firstQueryValue(v: QueryValue): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export function TourResults({
  tours,
  currentQuery,
  basePath = "/tours",
  title,
}: TourResultsProps) {
  const count = tours?.length ?? 0;

  const defaultSort = tourSortOptions[0]?.value ?? "nameAsc";
  const sortValue = firstQueryValue(currentQuery.sort) ?? defaultSort;

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">
            {title ?? `${count} ${count === 1 ? "Tour" : "Tours"} Found`}
          </h2>
        </div>

        <div className="shrink-0">
          <SortDropdown
            label="Sort"
            value={sortValue}
            options={[...tourSortOptions] as SortOption[]}
            basePath={basePath}
            currentQuery={currentQuery}
          />
        </div>
      </header>

      {count === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-gray-500">No tours found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, idx) => (
            <TourCard key={(tour.id ?? idx) as any} tour={tour as any} />
          ))}
        </div>
      )}
    </section>
  );
}
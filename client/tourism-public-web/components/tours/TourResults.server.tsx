import { SortDropdown } from "../shared/SortDropdown.client";
import type { SortOption } from "../shared/SortDropdown.client";
import { TourCard } from "./TourCard";
import { i18n } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";
import type { TourSort } from "@/lib/filters/tours";
import { tourSortValues } from "@/lib/filters/tours";

type QueryValue = string | string[] | undefined;

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

export async function TourResults({
  tours,
  currentQuery,
  basePath = "/tours",
  title,
}: TourResultsProps) {
  const locale = await resolveLocale();
  const t = i18n(locale);

  const count = tours?.length ?? 0;
  const defaultSort = (tourSortValues[0] ?? ("nameAsc" as TourSort)) as TourSort;
  const requestedSort = firstQueryValue(currentQuery.sort);
  const sortValue =
    requestedSort && tourSortValues.includes(requestedSort as TourSort)
      ? (requestedSort as TourSort)
      : defaultSort;
  const sortOptions: SortOption[] = tourSortValues.map((value) => ({
    value,
    label: t.sort.tours[value],
  }));

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-[color:var(--text)]">{title ?? t.results.toursHeader(count)}</h2>
        </div>

        <div className="shrink-0">
          <SortDropdown
            label={t.sort.label}
            value={sortValue}
            options={sortOptions}
            basePath={basePath}
            currentQuery={currentQuery}
          />
        </div>
      </header>

      {count === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
          <p className="text-[color:var(--muted)]">{t.results.toursEmpty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, idx) => (
            <TourCard key={(tour.id ?? idx) as any} tour={tour as any} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}

const tourSortOptions = [
  { value: "nameAsc", label: "Name (A → Z)" },
  { value: "nameDesc", label: "Name (Z → A)" },
  { value: "categoryAsc", label: "Category (A → Z)" },
  { value: "categoryDesc", label: "Category (Z → A)" },
] as const;

export type TourSort = (typeof tourSortOptions)[number]["value"];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT: TourSort = tourSortOptions[0].value;

export interface TourFilters {
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  durationMin?: number;
  durationMax?: number;
  category?: string;
  sort: TourSort;
  page: number;
  pageSize: number;
}

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.at(0) : value;

const parseNumber = (value: string | string[] | undefined) => {
  const candidate = firstValue(value);
  if (!candidate) return undefined;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const cleanString = (value: string | string[] | undefined) => {
  const candidate = firstValue(value);
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const parseTourFilters = (
  params: Record<string, string | string[] | undefined>
): TourFilters => {
  const sortValue = cleanString(params.sort);
  const sort = tourSortOptions.some((option) => option.value === sortValue)
    ? (sortValue as TourSort)
    : DEFAULT_SORT;

  return {
    destination: cleanString(params.destination),
    dateFrom: cleanString(params.dateFrom),
    dateTo: cleanString(params.dateTo),
    priceMin: parseNumber(params.priceMin),
    priceMax: parseNumber(params.priceMax),
    durationMin: parseNumber(params.durationMin),
    durationMax: parseNumber(params.durationMax),
    category: cleanString(params.category),
    sort,
    page: Math.max(DEFAULT_PAGE, parseNumber(params.page) ?? DEFAULT_PAGE),
    pageSize: Math.max(DEFAULT_PAGE_SIZE, parseNumber(params.pageSize) ?? DEFAULT_PAGE_SIZE),
  };
};

export const toTourQuery = (filters: TourFilters) => {
  const query: Record<string, string> = {
    sort: filters.sort,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  };

  if (filters.destination) query.destination = filters.destination;
  if (filters.dateFrom) query.dateFrom = filters.dateFrom;
  if (filters.dateTo) query.dateTo = filters.dateTo;
  if (filters.priceMin !== undefined) query.priceMin = String(filters.priceMin);
  if (filters.priceMax !== undefined) query.priceMax = String(filters.priceMax);
  if (filters.durationMin !== undefined) query.durationMin = String(filters.durationMin);
  if (filters.durationMax !== undefined) query.durationMax = String(filters.durationMax);
  if (filters.category) query.category = filters.category;

  return query;
};

export { tourSortOptions };

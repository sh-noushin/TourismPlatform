export const houseSortOptions = [
  { value: "nameAsc", label: "Name (A → Z)" },
  { value: "nameDesc", label: "Name (Z → A)" },
] as const;

export type HouseSort = (typeof houseSortOptions)[number]["value"];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT: HouseSort = houseSortOptions[0].value;

export interface HouseFilters {
  location?: string;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  areaMin?: number;
  type?: string;
  sort: HouseSort;
  page: number;
  pageSize: number;
}

const firstValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value.at(0) : value);

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

export const parseHouseFilters = (
  params: Record<string, string | string[] | undefined>
): HouseFilters => {
  const sortValue = cleanString(params.sort);
  const sort = houseSortOptions.some((option) => option.value === sortValue)
    ? (sortValue as HouseSort)
    : DEFAULT_SORT;

  return {
    location: cleanString(params.location),
    priceMin: parseNumber(params.priceMin),
    priceMax: parseNumber(params.priceMax),
    roomsMin: parseNumber(params.roomsMin),
    areaMin: parseNumber(params.areaMin),
    type: cleanString(params.type),
    sort,
    page: Math.max(DEFAULT_PAGE, parseNumber(params.page) ?? DEFAULT_PAGE),
    pageSize: Math.max(DEFAULT_PAGE_SIZE, parseNumber(params.pageSize) ?? DEFAULT_PAGE_SIZE),
  };
};

export const toHouseQuery = (filters: HouseFilters) => {
  const query: Record<string, string> = {
    sort: filters.sort,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  };

  if (filters.location) query.location = filters.location;
  if (filters.priceMin !== undefined) query.priceMin = String(filters.priceMin);
  if (filters.priceMax !== undefined) query.priceMax = String(filters.priceMax);
  if (filters.roomsMin !== undefined) query.roomsMin = String(filters.roomsMin);
  if (filters.areaMin !== undefined) query.areaMin = String(filters.areaMin);
  if (filters.type) query.type = filters.type;

  return query;
};

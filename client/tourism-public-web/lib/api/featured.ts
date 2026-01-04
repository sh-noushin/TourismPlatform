import { getJson, type QueryParams } from "./client";
import { apiEndpoints } from "./endpoints";
import type { components } from "@/lib/openapi/types";

type PagedResultOfTourSummaryDto = components["schemas"]["PagedResultOfTourSummaryDto"];
type PagedResultOfHouseSummaryDto = components["schemas"]["PagedResultOfHouseSummaryDto"];

export async function getToursPage(params?: QueryParams): Promise<PagedResultOfTourSummaryDto> {
  return getJson<PagedResultOfTourSummaryDto>(apiEndpoints.tours.list, params);
}

export async function getHousesPage(params?: QueryParams): Promise<PagedResultOfHouseSummaryDto> {
  return getJson<PagedResultOfHouseSummaryDto>(apiEndpoints.houses.list, params);
}

/** Fetch newest tours from the current year (2026) */
export async function getFeaturedTours(limit: number = 6): Promise<PagedResultOfTourSummaryDto> {
  const currentYear = new Date().getFullYear();
  return getToursPage({
    pageSize: limit,
    pageNumber: 1,
    // You can add additional filters here if the API supports them
    // For example: year: currentYear, sortBy: 'createdAt', sortOrder: 'desc'
  });
}

/** Fetch newest houses from the current year (2026) */
export async function getFeaturedHouses(limit: number = 6): Promise<PagedResultOfHouseSummaryDto> {
  return getHousesPage({
    pageSize: limit,
    pageNumber: 1,
    // You can add additional filters here if the API supports them
  });
}

import { getJson } from "./client";
import { apiEndpoints } from "./endpoints";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];
type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

export async function getFeaturedTours(locale?: string): Promise<TourSummaryDto[]> {
  return getJson<TourSummaryDto[]>(apiEndpoints.tours.list, locale ? { lang: locale } : undefined);
}

export async function getFeaturedHouses(limit: number = 6, locale?: string): Promise<HouseSummaryDto[]> {
  const houses = await getJson<HouseSummaryDto[]>(apiEndpoints.houses.list, locale ? { lang: locale } : undefined);
  return houses.slice(0, limit);
}

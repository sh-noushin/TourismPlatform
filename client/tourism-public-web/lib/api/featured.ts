import { getJson } from "./client";
import { apiEndpoints } from "./endpoints";
import type { components } from "@/lib/openapi/types";

type TourSummaryDto = components["schemas"]["TourSummaryDto"];
type HouseSummaryDto = components["schemas"]["HouseSummaryDto"];

export async function getFeaturedTours(): Promise<TourSummaryDto[]> {
  return getJson<TourSummaryDto[]>(apiEndpoints.tours.list);
}

export async function getFeaturedHouses(limit: number = 6): Promise<HouseSummaryDto[]> {
  const houses = await getJson<HouseSummaryDto[]>(apiEndpoints.houses.list);
  return houses.slice(0, limit);
}

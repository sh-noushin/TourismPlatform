import { getJson } from "./client";

export interface RateSummaryDto {
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
  rate: number;
  capturedAtUtc: string;
  previousRate: number | null;
  changePercent: number | null;
  windowLow: number;
  windowHigh: number;
}

/**
 * Today's rates, from the same feed the admin console shows. The endpoint is
 * anonymous, so the marketing page can read it without a token.
 *
 * A failure here must not take the home page down with it: currency rates are
 * a garnish on a page whose job is selling tours, so an empty list is the
 * right answer when the feed is unreachable.
 */
export async function getRateSummaries(days = 7): Promise<RateSummaryDto[]> {
  try {
    return await getJson<RateSummaryDto[]>("/api/exchange/rates/summary", { days });
  } catch {
    return [];
  }
}

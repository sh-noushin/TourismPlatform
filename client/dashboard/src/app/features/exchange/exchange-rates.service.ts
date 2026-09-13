import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../api/client';

export interface ExchangeRatePoint {
  capturedAtUtc: string;
  rate: number;
}

export interface SyncResult {
  /** Snapshots stored. Zero is normal when nothing moved since the last poll. */
  imported: number;
  /** False when the API has no feed key, so nothing was fetched at all. */
  configured: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
}

export interface ExchangeRateSummary {
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
  rate: number;
  capturedAtUtc: string;
  previousRate: number | null;
  changePercent: number | null;
  windowLow: number | null;
  windowHigh: number | null;
  points: ExchangeRatePoint[];
}

/**
 * Reads GET /api/exchange/rates/summary.
 *
 * Hand-written rather than regenerated into api/client.ts: that file is NSwag
 * output and editing it by hand would be undone by the next generation run.
 */
@Injectable({ providedIn: 'root' })
export class ExchangeRatesService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string
  ) {}

  getSummaries(days: number): Promise<ExchangeRateSummary[]> {
    return firstValueFrom(
      this.http.get<ExchangeRateSummary[]>(`${this.base()}/api/exchange/rates/summary`, {
        params: { days },
      })
    );
  }

  /** Display names for currency codes -- the summary carries codes only. */
  getCurrencies(): Promise<Currency[]> {
    return firstValueFrom(this.http.get<Currency[]>(`${this.base()}/api/exchange/currencies`));
  }

  /**
   * Asks the API to pull the live feed now. Returns how many new snapshots were
   * stored -- zero is normal when the feed has not moved since the last poll.
   */
  sync(): Promise<SyncResult> {
    return firstValueFrom(
      this.http.post<SyncResult>(`${this.base()}/api/exchange/rates/sync`, {})
    );
  }

  private base(): string {
    return this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
  }
}

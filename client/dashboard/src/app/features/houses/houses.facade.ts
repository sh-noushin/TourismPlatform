import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, Client } from '../../api/client';
import {
  DEFAULT_PAGE_SIZE,
  PageRequest,
  PagedResult,
  emptyPage,
  toPageParams
} from '../../shared/models/paging.models';

export interface HousesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  listingType?: number;
}

@Injectable({ providedIn: 'root' })
export class HousesFacade {
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly current = signal<any | null>(null);
  readonly saving = signal(false);

  constructor(
    private client: Client,
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string
  ) {}

  /**
   * Fetches a single page. Filtering and ordering happen in SQL, so the browser
   * never holds more than the ten rows it is showing -- which is the point of
   * paging, and the reason the page number has to round-trip.
   *
   * The generated NSwag client has no method for this endpoint, so it goes
   * through HttpClient directly; the same interceptors still apply.
   */
  private lastPageRequest: PageRequest | null = null;

  async loadPage(request: PageRequest = {}) {
    this.lastPageRequest = request;
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<any>>(`${this.apiBaseUrl}/api/houses/paged`, {
          params: toPageParams(request)
        })
      );
      const page = result ?? emptyPage(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.items.set(page.items ?? []);
      this.total.set(page.total ?? 0);
      return page;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading houses');
      this.items.set([]);
      this.total.set(0);
      return emptyPage(request.pageSize ?? DEFAULT_PAGE_SIZE);
    } finally {
      this.loading.set(false);
    }
  }

  async load(query: HousesQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.housesAll(query.listingType));
      // res is an array of HouseSummaryDto
      this.items.set(res ?? []);
      this.total.set(Array.isArray(res) ? res.length : 0);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading houses');
    } finally {
      this.loading.set(false);
    }
  }

  /** Re-reads the view the caller is on: the current page, or the full list. */
  private refresh() {
    return this.lastPageRequest ? this.loadPage(this.lastPageRequest) : this.load();
  }

  async get(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.housesGET(id));
      this.current.set(res ?? null);
      return res;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading house');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async save(id: string | null, payload: any) {
    this.saving.set(true);
    this.error.set(null);
    try {
      if (id) {
        await firstValueFrom(this.client.housesPUT(id, payload));
      } else {
        await firstValueFrom(this.client.housesPOST(payload));
      }
      await this.refresh();
      if (id) await this.get(id);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed saving house');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

  async delete(id: string) {
    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.client.housesDELETE(id));
      await this.refresh();
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed deleting house');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }
}

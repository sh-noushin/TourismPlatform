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

export interface ToursQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class ToursFacade {
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

  /** One page of tours, filtered and ordered by the database. */
  private lastPageRequest: PageRequest | null = null;

  async loadPage(request: PageRequest = {}) {
    this.lastPageRequest = request;
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<any>>(`${this.apiBaseUrl}/api/tours/paged`, {
          params: toPageParams(request)
        })
      );
      const page = result ?? emptyPage(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.items.set(page.items ?? []);
      this.total.set(page.total ?? 0);
      return page;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading tours');
      this.items.set([]);
      this.total.set(0);
      return emptyPage(request.pageSize ?? DEFAULT_PAGE_SIZE);
    } finally {
      this.loading.set(false);
    }
  }

  async load(query: ToursQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.toursAll());
      this.items.set(res ?? []);
      this.total.set(Array.isArray(res) ? res.length : 0);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading tours');
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
      const res = await firstValueFrom(this.client.toursGET(id));
      this.current.set(res ?? null);
      return res;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading tour');
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
        await firstValueFrom(this.client.toursPUT(id, payload));
      } else {
        await firstValueFrom(this.client.toursPOST(payload));
      }
      await this.refresh();
      if (id) await this.get(id);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed saving tour');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

  async delete(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.client.toursDELETE(id));
      await this.refresh();
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed deleting tour');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async unlinkPhoto(tourId: string, photoId: string) {
    this.error.set(null);
    try {
      await firstValueFrom(this.client.photos2(tourId, photoId));
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed removing photo');
      throw err;
    }
  }
}

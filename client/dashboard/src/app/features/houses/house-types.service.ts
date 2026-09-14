import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../api/client';
import {
  DEFAULT_PAGE_SIZE,
  PageRequest,
  PagedResult,
  emptyPage,
  toPageParams
} from '../../shared/models/paging.models';

export interface HouseTypeDto {
  id: string;
  name: string;
  /** English name; null when it has not been translated. */
  nameEn?: string | null;
}

@Injectable({ providedIn: 'root' })
export class HouseTypesService {
  readonly houseTypes = signal<HouseTypeDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Rows on the current page, and how many rows the filter matches overall. */
  readonly page = signal<PagedResult<HouseTypeDto>>(emptyPage<HouseTypeDto>());
  readonly total = signal(0);

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  /**
   * One page from the server. The unpaged `load()` below is still used by the
   * house form, which needs every type to fill its dropdown.
   */
  async loadPage(request: PageRequest = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<HouseTypeDto>>(`${this.apiBaseUrl}/api/house-types/paged`, {
          params: toPageParams(request)
        })
      );
      const page = result ?? emptyPage<HouseTypeDto>(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.page.set(page);
      this.total.set(page.total);
      return page;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load house types');
      const empty = emptyPage<HouseTypeDto>(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.page.set(empty);
      this.total.set(0);
      return empty;
    } finally {
      this.loading.set(false);
    }
  }

  async load(options?: { force?: boolean }) {
    if (!options?.force && this.houseTypes().length) return this.houseTypes();
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<HouseTypeDto[]>(`${this.apiBaseUrl}/api/house-types`));
      this.houseTypes.set(data ?? []);
      return this.houseTypes();
    } catch (err: any) {
      if (err instanceof HttpErrorResponse && [404, 204].includes(err.status)) {
        this.houseTypes.set([]);
        return [];
      }
      this.error.set(err?.message ?? 'Failed to load house types');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string) {
    return firstValueFrom(this.http.get<HouseTypeDto>(`${this.apiBaseUrl}/api/house-types/${id}`));
  }

  async create(name: string, nameEn?: string | null) {
    return firstValueFrom(
      this.http.post<HouseTypeDto>(`${this.apiBaseUrl}/api/house-types`, { name, nameEn: nameEn || null })
    );
  }

  async update(id: string, name: string, nameEn?: string | null) {
    return firstValueFrom(
      this.http.put<void>(`${this.apiBaseUrl}/api/house-types/${id}`, { name, nameEn: nameEn || null })
    );
  }

  async delete(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.apiBaseUrl}/api/house-types/${id}`));
  }
}

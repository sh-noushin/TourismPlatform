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

export interface TourCategoryDto {
  id: string;
  name: string;
  /** English name; null when it has not been translated. */
  nameEn?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TourCategoriesService {
  readonly tourCategories = signal<TourCategoryDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly page = signal<PagedResult<TourCategoryDto>>(emptyPage<TourCategoryDto>());
  readonly total = signal(0);

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  /** One page from the server; `load()` still serves the tour form's dropdown. */
  async loadPage(request: PageRequest = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<TourCategoryDto>>(`${this.apiBaseUrl}/api/tour-categories/paged`, {
          params: toPageParams(request)
        })
      );
      const page = result ?? emptyPage<TourCategoryDto>(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.page.set(page);
      this.total.set(page.total);
      return page;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load tour categories');
      const empty = emptyPage<TourCategoryDto>(request.pageSize ?? DEFAULT_PAGE_SIZE);
      this.page.set(empty);
      this.total.set(0);
      return empty;
    } finally {
      this.loading.set(false);
    }
  }

  async load(options?: { force?: boolean }) {
    if (!options?.force && this.tourCategories().length) return this.tourCategories();
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<TourCategoryDto[]>(`${this.apiBaseUrl}/api/tour-categories`));
      this.tourCategories.set(data ?? []);
      return this.tourCategories();
    } catch (err: any) {
      if (err instanceof HttpErrorResponse && [404, 204].includes(err.status)) {
        this.tourCategories.set([]);
        return [];
      }
      this.error.set(err?.message ?? 'Failed to load tour categories');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string) {
    return firstValueFrom(this.http.get<TourCategoryDto>(`${this.apiBaseUrl}/api/tour-categories/${id}`));
  }

  async create(name: string, nameEn?: string | null) {
    return firstValueFrom(
      this.http.post<TourCategoryDto>(`${this.apiBaseUrl}/api/tour-categories`, { name, nameEn: nameEn || null })
    );
  }

  async update(id: string, name: string, nameEn?: string | null) {
    return firstValueFrom(
      this.http.put<void>(`${this.apiBaseUrl}/api/tour-categories/${id}`, { name, nameEn: nameEn || null })
    );
  }

  async delete(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.apiBaseUrl}/api/tour-categories/${id}`));
  }
}

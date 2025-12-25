import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../api/client';

export interface TourCategoryDto {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TourCategoriesService {
  readonly tourCategories = signal<TourCategoryDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

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

  async create(name: string) {
    return firstValueFrom(this.http.post<TourCategoryDto>(`${this.apiBaseUrl}/api/tour-categories`, { name }));
  }

  async update(id: string, name: string) {
    return firstValueFrom(this.http.put<void>(`${this.apiBaseUrl}/api/tour-categories/${id}`, { name }));
  }

  async delete(id: string) {
    return firstValueFrom(this.http.delete<void>(`${this.apiBaseUrl}/api/tour-categories/${id}`));
  }
}

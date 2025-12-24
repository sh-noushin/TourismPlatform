import { Injectable, Inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../api/client';

export interface HouseTypeDto {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class HouseTypesService {
  readonly houseTypes = signal<HouseTypeDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly http: HttpClient, @Inject(API_BASE_URL) private readonly apiBaseUrl: string) {}

  async load() {
    if (this.houseTypes().length) return this.houseTypes();
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
}

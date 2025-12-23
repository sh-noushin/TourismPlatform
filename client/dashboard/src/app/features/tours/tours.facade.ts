import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Client } from '../../api/client';

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

  constructor(private client: Client) {}

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
}

import { Injectable, signal } from '@angular/core';
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
      const res = await this.client.toursAll({
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        search: query.search ?? undefined,
        sort: query.sort ?? undefined,
      });
      this.items.set(res.items ?? res);
      if ((res as any).total != null) this.total.set((res as any).total);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading tours');
    } finally {
      this.loading.set(false);
    }
  }
}

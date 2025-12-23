import { Injectable, signal } from '@angular/core';
import { Client } from '../../api/client';

export interface HousesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class HousesFacade {
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);

  constructor(private client: Client) {}

  async load(query: HousesQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      // assumes Client.housesAll exists; adapt if method name differs
      const res = await this.client.housesAll({
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20,
        search: query.search ?? undefined,
        sort: query.sort ?? undefined,
      });
      // map response structure depending on API
      this.items.set(res.items ?? res);
      if ((res as any).total != null) this.total.set((res as any).total);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading houses');
    } finally {
      this.loading.set(false);
    }
  }
}

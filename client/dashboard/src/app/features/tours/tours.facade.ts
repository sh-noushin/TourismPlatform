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
  readonly current = signal<any | null>(null);
  readonly saving = signal(false);

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
      await this.load();
      if (id) await this.get(id);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed saving tour');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }
}

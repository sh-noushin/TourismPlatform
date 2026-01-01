import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Client } from '../../api/client';

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

  constructor(private client: Client) {}

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
      // refresh list and current
      await this.load();
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
      await this.load();
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed deleting house');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }
}

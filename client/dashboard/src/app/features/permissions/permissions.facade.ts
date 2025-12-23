import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Client } from '../../api/client';

export interface PermissionsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionsFacade {
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly current = signal<any | null>(null);
  readonly saving = signal(false);

  constructor(private client: Client) {}

  async load(query: PermissionsQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.permissionDefinitionsAll());
      this.items.set(res ?? []);
      this.total.set(Array.isArray(res) ? res.length : 0);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading permissions');
    } finally {
      this.loading.set(false);
    }
  }

  async get(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.client.permissionDefinitionsGET(id));
      this.current.set(res ?? null);
      return res;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading permission');
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
        await firstValueFrom(this.client.permissionDefinitionsPUT(id, payload));
      } else {
        await firstValueFrom(this.client.permissionDefinitionsPOST(payload));
      }
      await this.load();
      if (id) await this.get(id);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed saving permission');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }
}

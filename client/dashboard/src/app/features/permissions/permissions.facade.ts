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
}

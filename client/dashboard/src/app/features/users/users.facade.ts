import { Injectable, signal } from '@angular/core';
import { Client } from '../../api/client';

export interface UsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  readonly items = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);

  constructor(private client: Client) {}

  async load(query: UsersQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    try {
      // No top-level users list method in Client; leave facade extensible.
      this.items.set([]);
      this.total.set(0);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading users');
    } finally {
      this.loading.set(false);
    }
  }
}

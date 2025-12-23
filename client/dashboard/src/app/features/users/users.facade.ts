import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

const USERS_API = '/api/superuser/users';

export interface UserSummaryDto {
  id: string;
  email: string;
  fullName?: string;
}

export interface UserDetailDto extends UserSummaryDto {
  displayName?: string;
  isSuperUser?: boolean;
}

export interface UserPayload {
  email: string;
  displayName: string;
  isSuperUser?: boolean;
}

export interface UsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  readonly items = signal<UserSummaryDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);
  readonly current = signal<UserDetailDto | null>(null);
  readonly saving = signal(false);

  constructor(private readonly http: HttpClient) {}

  async load(query: UsersQuery = {}) {
    this.loading.set(true);
    this.error.set(null);
    this.current.set(null);
    try {
      let params = new HttpParams();
      if (query.page !== undefined) params = params.set('page', query.page.toString());
      if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.sort) params = params.set('sort', query.sort);

      const response = await firstValueFrom(
        this.http.get<{ items: UserSummaryDto[]; total: number }>(USERS_API, { params })
      );
      this.items.set(response?.items ?? []);
      this.total.set(response?.total ?? response?.items?.length ?? 0);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading users');
    } finally {
      this.loading.set(false);
    }
  }

  async get(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.http.get<UserDetailDto>(`${USERS_API}/${encodeURIComponent(id)}`));
      this.current.set(response ?? null);
      return response;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading user');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async save(id: string | null, payload: UserPayload) {
    this.saving.set(true);
    this.error.set(null);
    try {
      if (id) {
        await firstValueFrom(this.http.put(`${USERS_API}/${encodeURIComponent(id)}`, payload));
      } else {
        await firstValueFrom(this.http.post(USERS_API, payload));
      }
      await this.load();
      if (id) {
        await this.get(id);
      }
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed saving user');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

}

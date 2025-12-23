import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, map, Observable, tap } from 'rxjs';

import { APP_CONFIG } from '../../../core/config/app-config';
import { PageResult } from '../../../shared/models/page.model';
import {
  CreateHouseRequest,
  HouseDetailDto,
  HouseSummaryDto,
  StageUploadResponse,
  UpdateHouseRequest
} from '../models';

@Injectable({ providedIn: 'root' })
export class HousesFacade {
  private readonly http = inject(HttpClient);
  private readonly app = inject(APP_CONFIG);
  readonly apiBaseUrl = this.app.apiBaseUrl;

  private readonly listSignal = signal<HouseSummaryDto[]>([]);
  private readonly totalCountSignal = signal(0);
  private readonly loadingSignal = signal(false);
  private readonly pageSignal = signal(1);
  private readonly pageSizeSignal = signal(10);
  private readonly sortKeySignal = signal<string | undefined>(undefined);
  private readonly searchSignal = signal('');

  readonly list = computed(() => this.listSignal());
  readonly totalCount = computed(() => this.totalCountSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly page = computed(() => this.pageSignal());
  readonly pageSize = computed(() => this.pageSizeSignal());
  readonly sortKey = computed(() => this.sortKeySignal());
  readonly searchTerm = computed(() => this.searchSignal());

  private buildParams() {
    let params = new HttpParams()
      .set('page', this.pageSignal().toString())
      .set('pageSize', this.pageSizeSignal().toString());

    const sortKey = this.sortKeySignal();
    if (sortKey) {
      params = params.set('sortBy', sortKey);
    }

    const search = this.searchSignal();
    if (search) {
      params = params.set('searchTerm', search);
    }

    return params;
  }

  private fetchList(): Observable<PageResult<HouseSummaryDto>> {
    this.loadingSignal.set(true);
    return this.http
      .get<PageResult<HouseSummaryDto>>(`${this.apiBaseUrl}/api/houses`, {
        params: this.buildParams()
      })
      .pipe(
        tap((page) => {
          this.listSignal.set(page.items);
          this.totalCountSignal.set(page.totalCount);
          this.pageSignal.set(page.page);
          this.pageSizeSignal.set(page.pageSize);
        }),
        finalize(() => this.loadingSignal.set(false))
      );
  }

  loadList(): Observable<HouseSummaryDto[]> {
    return this.fetchList().pipe(map((page) => page.items));
  }

  refresh(): Observable<HouseSummaryDto[]> {
    return this.loadList();
  }

  setPage(page: number, pageSize?: number): Observable<HouseSummaryDto[]> {
    this.pageSignal.set(page);
    if (typeof pageSize === 'number') {
      this.pageSizeSignal.set(pageSize);
    }
    return this.loadList();
  }

  setSort(key?: string): Observable<HouseSummaryDto[]> {
    this.sortKeySignal.set(key);
    this.pageSignal.set(1);
    return this.loadList();
  }

  setSearchTerm(term: string): Observable<HouseSummaryDto[]> {
    this.searchSignal.set(term.trim());
    this.pageSignal.set(1);
    return this.loadList();
  }

  getDetail(id: string): Observable<HouseDetailDto> {
    return this.http.get<HouseDetailDto>(`${this.app.apiBaseUrl}/api/houses/${id}`);
  }

  create(request: CreateHouseRequest): Observable<{ houseId: string }> {
    return this.http.post<{ houseId: string }>(`${this.app.apiBaseUrl}/api/houses`, request);
  }

  update(id: string, request: UpdateHouseRequest): Observable<void> {
    return this.http.put<void>(`${this.app.apiBaseUrl}/api/houses/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.app.apiBaseUrl}/api/houses/${id}`);
  }

  deletePhoto(houseId: string, photoId: string): Observable<void> {
    return this.http.delete<void>(`${this.app.apiBaseUrl}/api/houses/${houseId}/photos/${photoId}`);
  }

  stageUpload(file: File): Observable<StageUploadResponse> {
    const form = new FormData();
    form.append('File', file);
    form.append('TargetType', 'House');
    return this.http.post<StageUploadResponse>(`${this.app.apiBaseUrl}/api/photos/stage`, form);
  }

  buildTempFileUrl(relativePath: string) {
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const cleaned = relativePath.replace(/^\//, '');
    return `${base}/${cleaned}`;
  }

}

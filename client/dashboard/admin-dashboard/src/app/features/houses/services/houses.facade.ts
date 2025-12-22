import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import {
  CreateHouseRequest,
  HouseDetailDto,
  HouseSummaryDto,
  StageUploadResponse,
  UpdateHouseRequest,
  HouseCommitPhotoItem
} from '../models';

@Injectable({ providedIn: 'root' })
export class HousesFacade {
  private readonly http = inject(HttpClient);
  private readonly app = inject(APP_CONFIG);
  readonly apiBaseUrl = this.app.apiBaseUrl;

  private readonly listSignal = signal<HouseSummaryDto[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly pageSignal = signal(1);
  private readonly pageSizeSignal = signal(10);
  private readonly sortKeySignal = signal<string | undefined>(undefined);

  readonly list = computed(() => this.listSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly page = computed(() => this.pageSignal());
  readonly pageSize = computed(() => this.pageSizeSignal());
  readonly totalCount = computed(() => this.listSignal().length);
  readonly sortKey = computed(() => this.sortKeySignal());

  readonly paged = computed(() => {
    const start = (this.pageSignal() - 1) * this.pageSizeSignal();
    const end = start + this.pageSizeSignal();
    let rows = this.listSignal();
    const key = this.sortKeySignal();
    if (key) {
      rows = [...rows].sort((a: any, b: any) => String(a[key] ?? '').localeCompare(String(b[key] ?? '')));
    }
    return rows.slice(start, end);
  });

  loadList(): Observable<HouseSummaryDto[]> {
    this.loadingSignal.set(true);
    return this.http
      .get<HouseSummaryDto[]>(`${this.app.apiBaseUrl}/api/houses`)
      .pipe(tap((rows) => {
        this.listSignal.set(rows);
        this.loadingSignal.set(false);
      }));
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

  setPage(page: number, pageSize?: number) {
    this.pageSignal.set(page);
    if (pageSize) this.pageSizeSignal.set(pageSize);
  }

  setSort(key?: string) {
    this.sortKeySignal.set(key);
  }
}

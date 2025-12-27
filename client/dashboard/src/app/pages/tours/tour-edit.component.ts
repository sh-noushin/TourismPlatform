import { CommonModule } from '@angular/common';
import { Component, computed, Inject, OnDestroy, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import {
  API_BASE_URL,
  CreateTourRequest,
  CreateTourScheduleRequest,
  TourCommitPhotoItem,
  TourDetailDto,
  TourScheduleUpdateItem,
  UpdateTourRequest
} from '../../api/client';
import { ToursFacade } from '../../features/tours/tours.facade';
import { TourCategoriesService } from '../../features/tours/tour-categories.service';
import { SfDropdownComponent } from '../../shared/ui/sf-dropdown/sf-dropdown.component';
import { SfFileuploadComponent } from '../../shared/ui/sf-fileupload/sf-fileupload.component';
import { SfTourScheduleComponent, TourScheduleItem } from '../../shared/ui/sf-tour-schedule/sf-tour-schedule.component';
import { TranslateModule } from '@ngx-translate/core';

type ExistingPhotoVm = {
  kind: 'existing';
  photoId: string;
  label: string;
  sortOrder: number;
  url: string;
};

type StagedPhotoVm = {
  kind: 'staged';
  stagedUploadId: string;
  label: string;
  sortOrder: number;
  previewUrl?: string;
};

type TourPhotoVm = ExistingPhotoVm | StagedPhotoVm;

type TourForm = {
  name: string;
  description: string;
  tourCategoryName: string;
  photos: TourPhotoVm[];
  schedules: TourScheduleItem[];
};

@Component({
  standalone: true,
  selector: 'tour-edit',
  imports: [CommonModule, FormsModule, MatDialogModule, SfDropdownComponent, SfFileuploadComponent, SfTourScheduleComponent, TranslateModule],
  templateUrl: './tour-edit.component.html',
  styleUrls: ['./tour-edit.component.scss']
})
export class TourEditComponent implements OnDestroy {
  readonly form = signal<TourForm | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly loadingSignal = computed(() => this.loading());

  readonly deletedScheduleIds = signal<string[]>([]);

  readonly tourCategoryOptions = computed(() =>
    this.tourCategories.tourCategories().map((cat) => ({ label: cat.name, value: cat.name }))
  );

  readonly id: string | null;

  private cleanupScheduled = false;
  private cleanupPromise: Promise<void> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly facade: ToursFacade,
    public readonly tourCategories: TourCategoriesService,
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
    @Optional() private readonly dialogRef?: MatDialogRef<TourEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? this.route.snapshot.paramMap.get('id');
    void this.load();
    void this.tourCategories.load();
  }

  ngOnDestroy(): void {
    this.revokeStagedPreviewUrls();
    void this.enqueueCleanup();
  }

  updateField<K extends keyof TourForm>(key: K, value: TourForm[K]) {
    this.form.update((current) => (current ? { ...current, [key]: value } : current));
  }

  onSchedulesChange(schedules: TourScheduleItem[]) {
    this.form.update((current) => (current ? { ...current, schedules } : current));
  }

  onScheduleDeleted(schedule: TourScheduleItem) {
    if (schedule.id) {
      this.deletedScheduleIds.update((ids) => [...ids, schedule.id!]);
    }
  }

  async save(event?: Event) {
    event?.preventDefault();
    const current = this.form();
    if (!current) return;

    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    try {
      const payload = this.buildPayload(current);
      await this.facade.save(this.id, payload);
      this.saved.set(true);
      if (this.dialogRef) {
        this.dialogRef.close(true);
        return;
      }
      if (this.id) {
        await this.load();
      } else {
        this.form.set(this.createEmptyForm());
      }
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
      throw err;
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.dialogRef?.close(false);
  }

  async onFileSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    const existing = this.form()?.photos ?? [];
    const baseSort = existing.length > 0 ? Math.max(...existing.map((photo) => photo.sortOrder)) + 1 : 0;

    this.uploading.set(true);
    this.error.set(null);

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const formData = new FormData();
          formData.append('File', file);
          formData.append('TargetType', '1');
          const response = await firstValueFrom(
            this.http.post<{ stagedUploadId: string }>(`${this.apiBaseUrl}/api/photos/stage`, formData)
          );
          return {
            kind: 'staged' as const,
            stagedUploadId: response.stagedUploadId,
            label: file.name,
            sortOrder: baseSort + index,
            previewUrl: URL.createObjectURL(file)
          } as StagedPhotoVm;
        })
      );

      this.form.update((current) =>
        current ? { ...current, photos: [...current.photos, ...uploads] } : current
      );
    } catch (err: any) {
      this.error.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
    }
  }

  async removePhoto(index: number) {
    const current = this.form();
    if (!current) return;
    const target = current.photos[index];
    if (!target) return;

    if (target.kind === 'existing') {
      if (!this.id) return;
      try {
        await this.facade.unlinkPhoto(this.id, target.photoId);
      } catch (err: any) {
        this.error.set(err?.message ?? 'Failed removing photo');
        return;
      }
    } else {
      if (target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      await this.cleanupStagedUploads([target.stagedUploadId], 'remove');
    }

    this.form.update((currentValue) => {
      if (!currentValue) return currentValue;
      const photos = [...currentValue.photos];
      photos.splice(index, 1);
      return { ...currentValue, photos };
    });
  }

  trackPhoto = (_index: number, photo: TourPhotoVm) =>
    photo.kind === 'existing' ? `existing:${photo.photoId}` : `staged:${photo.stagedUploadId}`;

  private async load() {
    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.deletedScheduleIds.set([]);

    if (!this.id) {
      this.form.set(this.createEmptyForm());
      this.loading.set(false);
      return;
    }

    try {
      const detail = await this.facade.get(this.id);
      if (!detail) {
        this.error.set('Tour not found');
        this.form.set(null);
        return;
      }

      this.form.set({
        name: detail.name ?? '',
        description: detail.description ?? '',
        tourCategoryName: detail.tourCategoryName ?? '',
        photos: this.mapExistingPhotos(detail),
        schedules: this.mapExistingSchedules(detail)
      });
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading tour');
    } finally {
      this.loading.set(false);
    }
  }

  private createEmptyForm(): TourForm {
    return {
      name: '',
      description: '',
      tourCategoryName: '',
      photos: [],
      schedules: []
    };
  }

  private mapExistingPhotos(detail: TourDetailDto): ExistingPhotoVm[] {
    return (detail.photos ?? [])
      .map((photo) => ({
        kind: 'existing' as const,
        photoId: photo.photoId,
        label: photo.label ?? 'Photo',
        sortOrder: photo.sortOrder ?? 0,
        url: this.normalizeUrl(photo.permanentRelativePath)
      }))
      .filter((photo) => Boolean(photo.url))
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }

  private mapExistingSchedules(detail: TourDetailDto): TourScheduleItem[] {
    return (detail.schedules ?? [])
      .map((schedule) => ({
        id: schedule.tourScheduleId,
        startAtUtc: this.toLocalDateTimeString(schedule.startAtUtc),
        endAtUtc: this.toLocalDateTimeString(schedule.endAtUtc),
        capacity: schedule.capacity,
        isNew: false
      }))
      .sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime());
  }

  private toLocalDateTimeString(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private buildPayload(form: TourForm) {
    const staged = form.photos.filter((photo): photo is StagedPhotoVm => photo.kind === 'staged');
    const commitItems = staged.map((photo) => {
      const item = new TourCommitPhotoItem();
      item.stagedUploadId = photo.stagedUploadId;
      item.label = photo.label;
      item.sortOrder = photo.sortOrder;
      return item;
    });

    if (this.id) {
      // Update request
      const payload = new UpdateTourRequest();
      payload.name = form.name.trim();
      payload.description = form.description.trim() || undefined;
      payload.tourCategoryName = form.tourCategoryName.trim();
      payload.photos = commitItems.length > 0 ? commitItems : undefined;

      // Build schedule update items
      const scheduleItems = form.schedules.map((s) => {
        const schedule = new TourScheduleUpdateItem();
        schedule.id = s.isNew ? undefined : s.id;
        schedule.startAtUtc = new Date(s.startAtUtc);
        schedule.endAtUtc = new Date(s.endAtUtc);
        schedule.capacity = s.capacity;
        return schedule;
      });
      payload.schedules = scheduleItems.length > 0 ? scheduleItems : undefined;
      payload.deletedScheduleIds = this.deletedScheduleIds().length > 0 ? [...this.deletedScheduleIds()] : undefined;

      return payload;
    } else {
      // Create request
      const payload = new CreateTourRequest();
      payload.name = form.name.trim();
      payload.description = form.description.trim() || undefined;
      payload.tourCategoryName = form.tourCategoryName.trim();
      payload.photos = commitItems.length > 0 ? commitItems : undefined;

      // Build schedule create items (new schedules only)
      const newSchedules = form.schedules.map((s) => {
        const schedule = new CreateTourScheduleRequest();
        schedule.startAtUtc = new Date(s.startAtUtc);
        schedule.endAtUtc = new Date(s.endAtUtc);
        schedule.capacity = s.capacity;
        return schedule;
      });
      payload.schedules = newSchedules.length > 0 ? newSchedules : undefined;

      return payload;
    }
  }

  private normalizeUrl(relative?: string | null) {
    const value = (relative ?? '').trim();
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    const base = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
    const path = value.startsWith('/') ? value : `/${value}`;
    return `${base}${path}`;
  }

  private enqueueCleanup(): Promise<void> {
    if (this.cleanupScheduled || this.saved()) {
      return this.cleanupPromise ?? Promise.resolve();
    }

    this.cleanupScheduled = true;
    this.cleanupPromise = this.cleanupRemainingStagedPhotos();
    return this.cleanupPromise;
  }

  private async cleanupRemainingStagedPhotos() {
    const staged = this.getStagedUploadIds();
    if (staged.length === 0) return;
    await this.cleanupStagedUploads(staged, 'teardown');
  }

  private getStagedUploadIds() {
    const photos = this.form()?.photos ?? [];
    return photos.filter((photo): photo is StagedPhotoVm => photo.kind === 'staged').map((photo) => photo.stagedUploadId);
  }

  private async cleanupStagedUploads(ids: string[], reason: 'remove' | 'teardown') {
    if (ids.length === 0) return;
    try {
      await firstValueFrom(
        this.http.request<void>('DELETE', `${this.apiBaseUrl}/api/photos/stage`, {
          body: { stagedUploadIds: ids },
          headers: { 'Content-Type': 'application/json' }
        })
      );
    } catch (err) {
      console.warn('Failed to clean up staged uploads', { reason, ids, err });
    }
  }

  private revokeStagedPreviewUrls() {
    for (const photo of this.form()?.photos ?? []) {
      if (photo.kind === 'staged' && photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    }
  }
}

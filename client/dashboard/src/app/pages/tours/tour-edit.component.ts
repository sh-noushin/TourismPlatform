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
  TourCommitPhotoItem,
  TourDetailDto,
  UpdateTourRequest
} from '../../api/client';
import { ToursFacade } from '../../features/tours/tours.facade';

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
};

@Component({
  standalone: true,
  selector: 'tour-edit',
  imports: [CommonModule, FormsModule, MatDialogModule],
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

  readonly id: string | null;

  private cleanupScheduled = false;
  private cleanupPromise: Promise<void> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly facade: ToursFacade,
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
    @Optional() private readonly dialogRef?: MatDialogRef<TourEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? this.route.snapshot.paramMap.get('id');
    void this.load();
  }

  ngOnDestroy(): void {
    this.revokeStagedPreviewUrls();
    void this.enqueueCleanup();
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
        photos: this.mapExistingPhotos(detail)
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
      photos: []
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

  private buildPayload(form: TourForm) {
    const staged = form.photos.filter((photo): photo is StagedPhotoVm => photo.kind === 'staged');
    const commitItems = staged.map((photo) => {
      const item = new TourCommitPhotoItem();
      item.stagedUploadId = photo.stagedUploadId;
      item.label = photo.label;
      item.sortOrder = photo.sortOrder;
      return item;
    });

    const payload = this.id ? new UpdateTourRequest() : new CreateTourRequest();
    payload.name = form.name.trim();
    payload.description = form.description.trim() || undefined;
    payload.tourCategoryName = form.tourCategoryName.trim();
    payload.photos = commitItems.length > 0 ? commitItems : undefined;
    return payload;
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

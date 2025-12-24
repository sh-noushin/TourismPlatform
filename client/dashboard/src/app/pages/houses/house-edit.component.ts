import { Component, Inject, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL, HouseCommitPhotoItem } from '../../api/client';
import { HousesFacade } from '../../features/houses/houses.facade';
import { HouseTypesService } from '../../features/houses/house-types.service';

type ExistingPhotoVm = {
  kind: 'existing';
  id: string;
  url: string;
  label: string;
  sortOrder: number;
};

type StagedPhotoVm = {
  kind: 'staged';
  stagedUploadId: string;
  label: string;
  sortOrder: number;
  previewUrl?: string;
};

type HousePhotoVm = ExistingPhotoVm | StagedPhotoVm;

type HouseForm = {
  name: string;
  description: string;
  houseTypeName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;
  photos: HousePhotoVm[];
};

@Component({
  standalone: true,
  selector: 'house-edit',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './house-edit.component.html',
  styleUrls: ['./house-edit.component.scss']
})
export class HouseEditComponent {
  readonly form = signal<HouseForm | null>(null);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);
  readonly uploading = signal(false);

  // Keep removed existing photo IDs here (send on save)
  readonly deletedPhotoIds = signal<string[]>([]);

  readonly id: string | null;

  constructor(
    private readonly facade: HousesFacade,
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
    public readonly houseTypes: HouseTypesService,
    @Optional() private readonly route?: ActivatedRoute,
    @Optional() private readonly dialogRef?: MatDialogRef<HouseEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? this.route?.snapshot.paramMap.get('id') ?? null;
    void this.load();
    void this.houseTypes.load();
  }

  private normalizeUrl(url: string | undefined | null): string {
    const value = (url ?? '').trim();
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;

    const base = this.apiBaseUrl.endsWith('/') ? this.apiBaseUrl.slice(0, -1) : this.apiBaseUrl;
    const path = value.startsWith('/') ? value : `/${value}`;
    return `${base}${path}`;
  }

  private async load() {
    try {
      this.error.set(null);
      this.saved.set(false);
      this.deletedPhotoIds.set([]);

      if (!this.id) {
        this.form.set({
          name: '',
          description: '',
          houseTypeName: '',
          line1: '',
          line2: '',
          city: '',
          region: '',
          country: '',
          postalCode: '',
          photos: []
        });
        return;
      }

      const res: any = await this.facade.get(this.id);
      const address = res?.address ?? null;

      const rawPhotos = res?.photos ?? [];

      const existingPhotos: ExistingPhotoVm[] = Array.isArray(rawPhotos)
        ? rawPhotos.flatMap((p: any) => {
            const id = (p?.id ?? p?.photoId ?? p?.housePhotoId ?? '').toString();
            const url = this.normalizeUrl(p?.url ?? p?.publicUrl ?? p?.downloadUrl ?? p?.path);
            if (!id || !url) return [];

            return [
              {
                kind: 'existing',
                id,
                url,
                label: (p?.label ?? p?.fileName ?? 'Photo').toString(),
                sortOrder: Number(p?.sortOrder ?? 0)
              }
            ];
          })
        : [];

      this.form.set({
        name: res?.name ?? '',
        description: res?.description ?? '',
        houseTypeName: res?.houseTypeName ?? '',
        line1: address?.line1 ?? res?.line1 ?? '',
        line2: address?.line2 ?? res?.line2 ?? '',
        city: address?.city ?? res?.city ?? '',
        region: address?.region ?? res?.region ?? '',
        country: address?.country ?? res?.country ?? '',
        postalCode: address?.postalCode ?? res?.postalCode ?? '',
        photos: existingPhotos
      });
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading');
    }
  }

  async save(event?: Event) {
    event?.preventDefault();
    const form = this.form();
    if (!form) return;

    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);

    try {
      const stagedPhotosToCommit: HouseCommitPhotoItem[] = form.photos
        .filter((p): p is StagedPhotoVm => p.kind === 'staged')
        .map((p) => {
          const item = new HouseCommitPhotoItem();
          // These property names must match your generated client
          (item as any).stagedUploadId = p.stagedUploadId;
          (item as any).label = p.label;
          (item as any).sortOrder = p.sortOrder;
          return item;
        });

      const payload: any = {
        name: form.name,
        description: form.description || undefined,
        houseTypeName: form.houseTypeName,
        address: {
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          region: form.region || undefined,
          country: form.country,
          postalCode: form.postalCode || undefined
        },
        photos: stagedPhotosToCommit,
        deletedPhotoIds: this.deletedPhotoIds()
      };

      await this.facade.save(this.id, payload as any);

      this.saved.set(true);
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    const items = this.form()?.photos ?? [];
    for (const p of items) {
      if (p.kind === 'staged' && p.previewUrl) {
        URL.revokeObjectURL(p.previewUrl);
      }
    }
    this.dialogRef?.close(false);
  }

  updateField<K extends keyof HouseForm>(key: K, value: HouseForm[K]) {
    this.form.update((current) => (current ? { ...current, [key]: value } : current));
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.uploading.set(true);
    this.error.set(null);

    try {
      const currentPhotos = this.form()?.photos ?? [];
      const nextSort =
        currentPhotos.length > 0
          ? Math.max(...currentPhotos.map((p) => Number(p.sortOrder ?? 0))) + 1
          : 0;

      const uploads = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('TargetType', '0'); // House = 0

        const response = await firstValueFrom(
          this.http.post<{ stagedUploadId: string }>(`${this.apiBaseUrl}/api/photos/stage`, formData)
        );

        return {
          kind: 'staged',
          stagedUploadId: response.stagedUploadId,
          label: file.name,
          sortOrder: nextSort + index,
          previewUrl: URL.createObjectURL(file)
        } as StagedPhotoVm;
      });

      const newPhotos = await Promise.all(uploads);

      this.form.update((cur) => {
        if (!cur) return cur;
        return { ...cur, photos: [...cur.photos, ...newPhotos] };
      });
    } catch (err: any) {
      this.error.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removePhoto(index: number) {
    this.form.update((cur) => {
      if (!cur) return cur;

      const photos = [...cur.photos];
      const removed = photos[index];

      if (removed?.kind === 'staged' && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      if (removed?.kind === 'existing') {
        this.deletedPhotoIds.update((ids) => [...ids, removed.id]);
      }

      photos.splice(index, 1);
      return { ...cur, photos };
    });
  }

  trackPhoto = (_index: number, photo: HousePhotoVm) =>
    photo.kind === 'existing' ? `existing:${photo.id}` : `staged:${photo.stagedUploadId}`;
}

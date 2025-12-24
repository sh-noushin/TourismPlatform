import { Component, Inject, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api/client';
import { HousesFacade } from '../../features/houses/houses.facade';
import { HouseCommitPhotoItem } from '../../api/client';
import { HouseTypesService } from '../../features/houses/house-types.service';

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
  photos: HouseCommitPhotoItem[];
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

  private async load() {
    try {
      if (this.id) {
        const res = await this.facade.get(this.id);
        this.form.set({
          name: res?.name ?? '',
          description: res?.description ?? '',
          houseTypeName: res?.houseTypeName ?? '',
          line1: res?.line1 ?? '',
          line2: res?.line2 ?? '',
          city: res?.city ?? '',
          region: res?.region ?? '',
          country: res?.country ?? '',
          postalCode: res?.postalCode ?? '',
          photos: []
        });
      } else {
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
      }
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
      const payload = {
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
        photos: form.photos ?? []
      };
      await this.facade.save(this.id, payload);
      this.saved.set(true);
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
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
      const uploads = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('TargetType', '0'); // House = 0, assuming enum starts at 0

        const response = await this.http.post<{ stagedUploadId: string }>(`${this.apiBaseUrl}/api/photos/stage`, formData).toPromise();
        if (!response) throw new Error('Upload failed');

        return {
          stagedUploadId: response.stagedUploadId,
          label: file.name,
          sortOrder: this.form()?.photos.length ?? 0 + index
        } as HouseCommitPhotoItem;
      });

      const newPhotos = await Promise.all(uploads);
      this.form.update((current) => {
        if (!current) return current;
        return { ...current, photos: [...current.photos, ...newPhotos] };
      });
    } catch (err: any) {
      this.error.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
      input.value = ''; // reset input
    }
  }

  removePhoto(index: number) {
    this.form.update((current) => {
      if (!current) return current;
      const photos = [...current.photos];
      photos.splice(index, 1);
      return { ...current, photos };
    });
  }
}

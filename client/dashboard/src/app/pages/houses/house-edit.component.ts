import { Component, Inject, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api/client';
import { HousesFacade } from '../../features/houses/houses.facade';
import { HouseCommitPhotoItem } from '../../api/client';

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
  template: `
    <div class="edit-shell" (click)="$event.stopPropagation()">
      <h3>{{ id ? 'Edit house' : 'Create house' }}</h3>
      @if (form()) {
        <form class="form" (submit)="save($event)">
        <label>
          Name
          <input
            type="text"
            name="name"
            [value]="form()?.name"
            (input)="updateField('name', $any($event.target).value)"
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            [value]="form()?.description"
            (input)="updateField('description', $any($event.target).value)"
          ></textarea>
        </label>
        <label>
          Type
          <input
            type="text"
            name="houseTypeName"
            [value]="form()?.houseTypeName"
            (input)="updateField('houseTypeName', $any($event.target).value)"
            required
          />
        </label>
        <div class="grid">
          <label>
            Address line 1
            <input
              type="text"
              name="line1"
              [value]="form()?.line1"
              (input)="updateField('line1', $any($event.target).value)"
              required
            />
          </label>
          <label>
            Address line 2
            <input
              type="text"
              name="line2"
              [value]="form()?.line2"
              (input)="updateField('line2', $any($event.target).value)"
            />
          </label>
          <label>
            City
            <input
              type="text"
              name="city"
              [value]="form()?.city"
              (input)="updateField('city', $any($event.target).value)"
              required
            />
          </label>
          <label>
            Region
            <input
              type="text"
              name="region"
              [value]="form()?.region"
              (input)="updateField('region', $any($event.target).value)"
            />
          </label>
          <label>
            Country
            <input
              type="text"
              name="country"
              [value]="form()?.country"
              (input)="updateField('country', $any($event.target).value)"
              required
            />
          </label>
          <label>
            Postal code
            <input
              type="text"
              name="postalCode"
              [value]="form()?.postalCode"
              (input)="updateField('postalCode', $any($event.target).value)"
            />
          </label>
        </div>

        <label>
          Photos
          <input
            type="file"
            multiple
            accept="image/*"
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
          />
          @if (uploading()) {
            <p>Uploading...</p>
          }
        </label>

        <div class="photos">
          @for (photo of form()?.photos; track photo.stagedUploadId; let i = $index) {
            <div class="photo-item">
              <span>{{ photo.label }}</span>
              <button type="button" (click)="removePhoto(i)">Remove</button>
            </div>
          }
        </div>

        <div class="actions">
          <button type="button" class="btn ghost" (click)="cancel()" [disabled]="saving()">Cancel</button>
          <button type="submit" class="btn primary" [disabled]="saving()">
            {{ saving() ? 'Saving...' : (id ? 'Update' : 'Create') }}
          </button>
        </div>
        </form>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (saved()) {
        <p class="success">Saved.</p>
      }
    </div>
  `,
  styles: [`
    .edit-shell { display: flex; flex-direction: column; gap: 12px; min-width: 320px; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; }
    input, textarea { padding: 8px 10px; border-radius: 10px; border: 1px solid #d8dbe0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; }
    .btn { border-radius: 10px; padding: 10px 14px; border: 1px solid transparent; cursor: pointer; }
    .btn.ghost { background: #f1f5f9; border-color: #e2e8f0; }
    .btn.primary { background: #3b82f6; color: #fff; }
    .photos { display: flex; flex-direction: column; gap: 8px; }
    .photo-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border: 1px solid #d8dbe0; border-radius: 6px; }
    .error { color: #dc2626; }
    .success { color: #16a34a; }
  `]
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
    @Optional() private readonly route?: ActivatedRoute,
    @Optional() private readonly dialogRef?: MatDialogRef<HouseEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? this.route?.snapshot.paramMap.get('id') ?? null;
    void this.load();
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

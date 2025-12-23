import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SfCardComponent } from '../../../../shared/ui/sf-card/sf-card.component';
import { SfEmptyStateComponent } from '../../../../shared/ui/sf-empty-state/sf-empty-state.component';
import { SfFormFieldComponent } from '../../../../shared/ui/sf-form-field/sf-form-field.component';
import { SfPageHeaderComponent } from '../../../../shared/ui/sf-page-header/sf-page-header.component';
import { SfButtonComponent } from '../../../../shared/ui/sf-button/sf-button.component';
import { ConfirmService } from '../../../../shared/ui/confirm.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { HousesFacade } from '../../services/houses.facade';
import { HouseCommitPhotoItem, HouseDetailDto } from '../../models';

@Component({
  selector: 'app-houses-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SfCardComponent,
    SfPageHeaderComponent,
    SfFormFieldComponent,
    SfButtonComponent,
    SfEmptyStateComponent
  ],
  templateUrl: './houses-edit.component.html',
  styleUrl: './houses-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousesEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly facade = inject(HousesFacade);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly id = signal<string | null>(null);
  readonly loading = signal(false);
  readonly existingPhotos = signal<HouseDetailDto['photos']>([]);
  readonly staged = signal<Array<HouseCommitPhotoItem & { previewUrl: string }>>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    houseTypeName: ['', Validators.required],
    address: this.fb.nonNullable.group({
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      region: [''],
      country: ['', Validators.required],
      postalCode: ['']
    })
  });

  readonly isEdit = computed(() => !!this.id());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id.set(id);
      this.loading.set(true);
      this.facade.getDetail(id).subscribe((detail) => {
        this.loading.set(false);
        this.form.patchValue({
          name: detail.name,
          description: detail.description ?? '',
          houseTypeName: detail.houseTypeName ?? '',
          address: {
            line1: detail.line1 ?? '',
            line2: detail.line2 ?? '',
            city: detail.city ?? '',
            region: detail.region ?? '',
            country: detail.country ?? '',
            postalCode: detail.postalCode ?? ''
          }
        });
        this.existingPhotos.set(detail.photos);
      });
    }
  }

  uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const current = this.staged();
    let index = current.length;
    Array.from(files).forEach((file) => {
      this.facade.stageUpload(file).subscribe((res) => {
        const previewUrl = this.facade.buildTempFileUrl(res.tempRelativePath);
        this.staged.update((rows) => [
          ...rows,
          {
            stagedUploadId: res.stagedUploadId,
            label: file.name.replace(/\.[^.]+$/, ''),
            sortOrder: index++,
            previewUrl
          }
        ]);
      });
    });
  }

  onFileInputChange(event: Event) {
    // use any to avoid template casting issues across browsers
    const input = event.target as any;
    this.uploadFiles((input && input.files) ? (input.files as FileList) : null);
  }

  updateStagedLabel(i: number, value: string) {
    this.staged.update((rows) => {
      const next = [...rows];
      next[i] = { ...next[i], label: value };
      return next;
    });
  }

  updateStagedSort(i: number, value: string) {
    const sort = Number(value);
    this.staged.update((rows) => {
      const next = [...rows];
      next[i] = { ...next[i], sortOrder: Number.isFinite(sort) ? sort : next[i].sortOrder };
      return next;
    });
  }

  removeStaged(idx: number) {
    this.staged.update((rows) => rows.filter((_, i) => i !== idx));
  }

  protected removeExisting(photoId: string) {
    const houseId = this.id();
    if (!houseId) {
      return;
    }
    this.confirm
      .confirm({
        title: 'Remove photo',
        description: 'The photo will be removed from the house and cannot be restored.'
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.facade.deletePhoto(houseId, photoId).subscribe({
          next: () => {
            this.toast.show('Photo removed', 'success');
            this.existingPhotos.update((rows) => rows.filter((p) => p.photoId !== photoId));
          },
          error: () => {
            this.toast.show('Unable to remove photo', 'error');
          }
        });
      });
  }

  save() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const dto = this.form.getRawValue();
    const photos = this.staged().map(({ stagedUploadId, label, sortOrder }) => ({ stagedUploadId, label, sortOrder }));
    const payload = { ...dto, photos };
    const id = this.id();
    if (id) {
      this.facade.update(id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.show('House updated', 'success');
          this.router.navigateByUrl('/admin/houses');
        },
        error: () => {
          this.loading.set(false);
          this.toast.show('Unable to save house', 'error');
        }
      });
    } else {
      this.facade.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.show('House created', 'success');
          this.router.navigateByUrl('/admin/houses');
        },
        error: () => {
          this.loading.set(false);
          this.toast.show('Unable to save house', 'error');
        }
      });
    }
  }

  protected goBack() {
    this.router.navigateByUrl('/admin/houses');
  }
}

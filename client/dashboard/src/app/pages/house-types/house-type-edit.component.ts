import { ChangeDetectionStrategy, Component, computed, Inject, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HouseTypesService } from '../../features/houses/house-types.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'house-type-edit',
  templateUrl: './house-type-edit.component.html',
  styleUrls: ['./house-type-edit.component.scss'],
  imports: [CommonModule, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HouseTypeEditComponent {
  readonly name = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly title = computed(() =>
    this.id ? this.translate.instant('TYPE_DIALOG.EDIT_TITLE') : this.translate.instant('TYPE_DIALOG.CREATE_TITLE')
  );

  readonly id: string | null;

  constructor(
    private readonly houseTypes: HouseTypesService,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<HouseTypeEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? null;
    void this.initialize();
  }

  async save(event?: Event) {
    event?.preventDefault();

    const trimmed = this.name().trim();
    if (!trimmed) {
      this.error.set(this.translate.instant('TYPE_DIALOG.NAME_REQUIRED'));
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      if (this.id) {
        await this.houseTypes.update(this.id, trimmed);
      } else {
        await this.houseTypes.create(trimmed);
      }
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? this.translate.instant('TYPE_DIALOG.SAVE_FAILED'));
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.dialogRef?.close(false);
  }

  private async initialize() {
    if (!this.id) return;

    const existing = this.houseTypes.houseTypes().find((type) => type.id === this.id);
    if (existing) {
      this.name.set(existing.name);
      return;
    }

    try {
      const type = await this.houseTypes.getById(this.id);
      this.name.set(type.name);
    } catch (err: any) {
      this.error.set(err?.message ?? this.translate.instant('TYPE_DIALOG.LOAD_FAILED'));
    }
  }
}

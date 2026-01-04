import { ChangeDetectionStrategy, Component, computed, Inject, Optional, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TourCategoriesService } from '../../features/tours/tour-categories.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'tour-category-edit',
  templateUrl: './tour-category-edit.component.html',
  styleUrls: ['./tour-category-edit.component.scss'],
  imports: [CommonModule, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourCategoryEditComponent {
  readonly name = signal('');
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly title = computed(() =>
    this.id ? this.translate.instant('CATEGORY_DIALOG.EDIT_TITLE') : this.translate.instant('CATEGORY_DIALOG.CREATE_TITLE')
  );

  readonly id: string | null;

  constructor(
    private readonly tourCategories: TourCategoriesService,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<TourCategoryEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: { id?: string | null }
  ) {
    this.id = this.data?.id ?? null;
    void this.initialize();
  }

  async save(event?: Event) {
    event?.preventDefault();

    const trimmed = this.name().trim();
    if (!trimmed) {
      this.error.set(this.translate.instant('CATEGORY_DIALOG.NAME_REQUIRED'));
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      if (this.id) {
        await this.tourCategories.update(this.id, trimmed);
      } else {
        await this.tourCategories.create(trimmed);
      }
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? this.translate.instant('CATEGORY_DIALOG.SAVE_FAILED'));
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.dialogRef?.close(false);
  }

  private async initialize() {
    if (!this.id) return;

    const existing = this.tourCategories.tourCategories().find((cat) => cat.id === this.id);
    if (existing) {
      this.name.set(existing.name);
      return;
    }

    try {
      const category = await this.tourCategories.getById(this.id);
      this.name.set(category.name);
    } catch (err: any) {
      this.error.set(err?.message ?? this.translate.instant('CATEGORY_DIALOG.LOAD_FAILED'));
    }
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Client, PublicCallToActionDto, UpsertPublicCallToActionRequest } from '../../api/client';

type DialogData =
  | { mode: 'create'; locale: 'fa' | 'en' }
  | { mode: 'edit'; locale: string; id: string; existing?: PublicCallToActionDto };

@Component({
  standalone: true,
  selector: 'public-cta-edit',
  templateUrl: './public-cta-edit.component.html',
  styleUrls: ['./public-cta-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslateModule]
})
export class PublicCtaEditComponent {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly mode: 'create' | 'edit';
  readonly locale: string;
  readonly id = signal('');

  readonly text = signal('');
  readonly url = signal('');
  readonly order = signal<number>(0);
  readonly isActive = signal(true);

  constructor(
    private readonly client: Client,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<PublicCtaEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: DialogData
  ) {
    this.mode = this.data?.mode ?? 'create';
    this.locale = (this.data as any)?.locale ?? 'en';

    if (this.mode === 'edit') {
      const existing = (this.data as any)?.existing as PublicCallToActionDto | undefined;
      if (existing) {
        this.id.set(existing.id);
        this.text.set(existing.text ?? '');
        this.url.set(existing.url ?? '');
        this.order.set(Number(existing.sortOrder ?? 0));
        this.isActive.set(!!existing.isActive);
      }
      this.id.set((this.data as any).id);
    }
  }

  title(): string {
    return this.mode === 'create'
      ? this.translate.instant('COMMON.NEW')
      : this.translate.instant('COMMON.EDIT');
  }

  cancel(): void {
    this.dialogRef?.close(false);
  }

  async save(event?: Event): Promise<void> {
    event?.preventDefault();

    this.saving.set(true);
    this.error.set(null);

    try {
      const normalizedLocale = (this.locale || 'en').trim();
      const id = this.id().trim();
      if (!id) {
        this.error.set('ID is required');
        return;
      }

      const req = new UpsertPublicCallToActionRequest({
        text: this.text().trim(),
        url: this.url().trim(),
        order: Number(this.order() ?? 0),
        isActive: !!this.isActive()
      });

      await firstValueFrom(this.client.ctas(normalizedLocale, id, req));
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }
}

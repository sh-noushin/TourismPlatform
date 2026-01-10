import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Client, PublicLearnMorePageDto, UpsertPublicLearnMorePageRequest } from '../../api/client';

type DialogData = { locale: 'fa' | 'en'; existing: PublicLearnMorePageDto | null };

@Component({
  standalone: true,
  selector: 'public-learn-more-edit',
  templateUrl: './public-learn-more-edit.component.html',
  styleUrls: ['./public-learn-more-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslateModule]
})
export class PublicLearnMoreEditComponent {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly locale: string;

  readonly title = signal('');
  readonly heading = signal('');
  readonly body = signal('');
  readonly imageUrl = signal('');
  readonly primaryButtonText = signal('');
  readonly primaryButtonUrl = signal('');
  readonly isActive = signal(true);

  constructor(
    private readonly client: Client,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<PublicLearnMoreEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: DialogData
  ) {
    this.locale = this.data?.locale ?? 'en';

    const existing = this.data?.existing ?? null;
    if (existing) {
      this.title.set(existing.title ?? '');
      this.heading.set(existing.heading ?? '');
      this.body.set(existing.body ?? '');
      this.imageUrl.set(existing.imageUrl ?? '');
      this.primaryButtonText.set(existing.primaryButtonText ?? '');
      this.primaryButtonUrl.set(existing.primaryButtonUrl ?? '');
      this.isActive.set(!!existing.isActive);
    }
  }

  dialogTitle(): string {
    return this.data?.existing ? this.translate.instant('COMMON.EDIT') : this.translate.instant('COMMON.NEW');
  }

  cancel(): void {
    this.dialogRef?.close(false);
  }

  async save(event?: Event): Promise<void> {
    event?.preventDefault();

    this.saving.set(true);
    this.error.set(null);

    try {
      const req = new UpsertPublicLearnMorePageRequest({
        title: this.title().trim(),
        heading: this.heading().trim(),
        body: this.body().trim(),
        imageUrl: this.imageUrl().trim() || undefined,
        primaryButtonText: this.primaryButtonText().trim() || undefined,
        primaryButtonUrl: this.primaryButtonUrl().trim() || undefined,
        isActive: !!this.isActive()
      });

      await firstValueFrom(this.client.learnMorePUT(this.locale, req));
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }
}

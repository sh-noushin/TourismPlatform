import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { Client, PublicContactInfoDto, UpsertPublicContactInfoRequest } from '../../api/client';

type DialogData = { locale: 'fa' | 'en'; existing: PublicContactInfoDto | null };

@Component({
  standalone: true,
  selector: 'public-contact-info-edit',
  templateUrl: './public-contact-info-edit.component.html',
  styleUrls: ['./public-contact-info-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslateModule]
})
export class PublicContactInfoEditComponent {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly locale: string;

  readonly title = signal('');
  readonly description = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly address = signal('');
  readonly isActive = signal(true);

  constructor(
    private readonly client: Client,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<PublicContactInfoEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: DialogData
  ) {
    this.locale = this.data?.locale ?? 'en';

    const existing = this.data?.existing ?? null;
    if (existing) {
      this.title.set(existing.title ?? '');
      this.description.set(existing.description ?? '');
      this.email.set(existing.email ?? '');
      this.phone.set(existing.phone ?? '');
      this.address.set(existing.address ?? '');
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
      const req = new UpsertPublicContactInfoRequest({
        title: this.title().trim(),
        description: this.description().trim(),
        email: this.email().trim() || undefined,
        phone: this.phone().trim() || undefined,
        address: this.address().trim() || undefined,
        isActive: !!this.isActive()
      });

      await firstValueFrom(this.client.contactInfoPUT(this.locale, req));
      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }
}

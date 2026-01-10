import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import {
  Client,
  CreatePublicSectionRequest,
  PublicSectionCtaRequest,
  PublicSectionDto,
  UpsertPublicSectionRequest
} from '../../api/client';

type DialogData =
  | { mode: 'create'; locale: 'fa' | 'en' }
  | { mode: 'edit'; locale: string; id: string; existing?: PublicSectionDto };

@Component({
  standalone: true,
  selector: 'public-section-edit',
  templateUrl: './public-section-edit.component.html',
  styleUrls: ['./public-section-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslateModule]
})
export class PublicSectionEditComponent {
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly mode: 'create' | 'edit';
  readonly locale: string;
  readonly id = signal('');

  readonly heading = signal('');
  readonly tagline = signal('');
  readonly body = signal('');
  readonly imageUrl = signal('');
  readonly order = signal<number>(0);
  readonly isActive = signal(true);

  readonly primaryCtaText = signal('');
  readonly primaryCtaUrl = signal('');
  readonly secondaryCtaText = signal('');
  readonly secondaryCtaUrl = signal('');

  constructor(
    private readonly client: Client,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<PublicSectionEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: DialogData
  ) {
    this.mode = this.data?.mode ?? 'create';
    this.locale = (this.data as any)?.locale ?? 'en';

    if (this.mode === 'edit') {
      const existing = (this.data as any)?.existing as PublicSectionDto | undefined;
      if (existing) {
        this.hydrate(existing);
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

      if (this.mode === 'create') {
        const newId = this.id().trim();
        if (!newId) {
          this.error.set('ID is required');
          return;
        }

        const req = new CreatePublicSectionRequest({
          id: newId,
          heading: this.heading().trim(),
          tagline: this.tagline().trim() || undefined,
          body: this.body().trim(),
          imageUrl: this.imageUrl().trim() || undefined,
          order: Number(this.order() ?? 0),
          isActive: !!this.isActive(),
          primaryCta: this.makeCta(this.primaryCtaText(), this.primaryCtaUrl()),
          secondaryCta: this.makeCta(this.secondaryCtaText(), this.secondaryCtaUrl())
        });

        await firstValueFrom(this.client.sectionsPOST(normalizedLocale, req));
      } else {
        const req = new UpsertPublicSectionRequest({
          heading: this.heading().trim(),
          tagline: this.tagline().trim() || undefined,
          body: this.body().trim(),
          imageUrl: this.imageUrl().trim() || undefined,
          order: Number(this.order() ?? 0),
          isActive: !!this.isActive(),
          primaryCta: this.makeCta(this.primaryCtaText(), this.primaryCtaUrl()),
          secondaryCta: this.makeCta(this.secondaryCtaText(), this.secondaryCtaUrl())
        });

        await firstValueFrom(this.client.sectionsPUT(normalizedLocale, this.id(), req));
      }

      this.dialogRef?.close(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  private hydrate(existing: PublicSectionDto): void {
    this.id.set(existing.id);
    this.heading.set(existing.heading ?? '');
    this.tagline.set(existing.tagline ?? '');
    this.body.set(existing.body ?? '');
    this.imageUrl.set(existing.imageUrl ?? '');
    this.order.set(Number(existing.order ?? 0));
    this.isActive.set(!!existing.isActive);

    this.primaryCtaText.set(existing.primaryCta?.text ?? '');
    this.primaryCtaUrl.set(existing.primaryCta?.url ?? '');
    this.secondaryCtaText.set(existing.secondaryCta?.text ?? '');
    this.secondaryCtaUrl.set(existing.secondaryCta?.url ?? '');
  }

  private makeCta(text: string, url: string): PublicSectionCtaRequest | undefined {
    const t = (text ?? '').trim();
    const u = (url ?? '').trim();
    if (!t && !u) return undefined;
    return new PublicSectionCtaRequest({ text: t, url: u });
  }
}

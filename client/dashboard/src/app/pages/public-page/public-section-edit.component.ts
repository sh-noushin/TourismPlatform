import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import {
  Client,
  CreatePublicSectionRequest,
  PublicSectionDto,
  SECTION_TYPE_LIST,
  SECTION_TYPE_VALUES,
  SectionType,
  UpsertPublicSectionRequest
} from '../../api/client';

type DialogData =
  | { mode: 'create'; locale: 'fa' | 'en'; availableTypes: SectionType[] }
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
  readonly availableTypes = signal<SectionType[]>(SECTION_TYPE_LIST.slice());
  readonly sectionType = signal<SectionType>(SECTION_TYPE_VALUES[0]);
  readonly header = signal('');
  readonly content = signal('');

  constructor(
    private readonly client: Client,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<PublicSectionEditComponent, boolean>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data?: DialogData
  ) {
    this.mode = this.data?.mode ?? 'create';
    this.locale = (this.data as any)?.locale ?? 'en';
    this.availableTypes.set(SECTION_TYPE_LIST.slice());

    const raw = this.data as any;
    if (this.mode === 'create') {
      const available = (raw?.availableTypes as SectionType[]) ?? SECTION_TYPE_LIST;
      const source = available.length ? [...available] : SECTION_TYPE_LIST.slice();
      this.availableTypes.set(source);
      this.sectionType.set(source[0] ?? SECTION_TYPE_LIST[0]);
    } else {
      const existing = raw?.existing as PublicSectionDto | undefined;
      if (existing) {
        this.hydrate(existing);
      }
      this.id.set(raw?.id ?? '');
      if (!existing) {
        this.sectionType.set(this.availableTypes()[0] ?? SECTION_TYPE_LIST[0]);
      }
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
      const payload = {
        sectionType: this.sectionType(),
        header: this.header().trim(),
        content: this.content().trim()
      };

      if (this.mode === 'create') {
        const newId = this.id().trim();
        if (!newId) {
          this.error.set('ID is required');
          return;
        }

        const req = new CreatePublicSectionRequest({ id: newId, ...payload });

        await firstValueFrom(this.client.sectionsPOST(normalizedLocale, req));
      } else {
        const req = new UpsertPublicSectionRequest(payload);

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
    this.sectionType.set(existing.sectionType);
    this.header.set(existing.header ?? '');
    this.content.set(existing.content ?? '');
  }

  sectionTypeOptionLabel(type: SectionType) {
    const key = `PUBLIC_PAGE_SECTIONS_PAGE.TYPE_${type.toUpperCase()}`;
    const translation = this.translate.instant(key);
    return translation === key ? type : translation;
  }
}

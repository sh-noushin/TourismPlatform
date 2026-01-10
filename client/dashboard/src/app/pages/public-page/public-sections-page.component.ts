import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';

import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn } from '../../shared/models/table.models';

import { Client, PublicSectionDto } from '../../api/client';
import { PublicSectionEditComponent } from './public-section-edit.component';

@Component({
  standalone: true,
  selector: 'public-sections-page',
  templateUrl: './public-sections-page.component.html',
  styleUrls: ['./public-sections-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule, SfCardComponent, SfPageHeaderComponent, SfTableComponent, SfButtonComponent]
})
export class PublicSectionsPageComponent implements OnDestroy {
  readonly lang = signal<'fa' | 'en'>('fa');
  private readonly langSub: Subscription;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sections = signal<PublicSectionDto[]>([]);

  readonly columns = computed<SfTableColumn[]>(() => {
    this.lang();
    return [
      { key: 'id', header: 'ID', field: 'id', sortable: true, align: 'start' },
      { key: 'heading', header: 'Heading', field: 'heading', sortable: false },
      { key: 'order', header: 'Order', field: 'order', sortable: true },
      { key: 'isActive', header: 'Active', field: 'isActive', sortable: false }
    ];
  });

  readonly actions = computed(() => {
    this.lang();
    return [{ label: this.translate.instant('COMMON.EDIT'), type: 'edit', icon: 'edit' }];
  });

  constructor(
    private readonly client: Client,
    private readonly dialog: MatDialog,
    private readonly translate: TranslateService
  ) {
    const currentLang = (this.translate.currentLang as 'fa' | 'en') || (this.translate.getDefaultLang() as 'fa' | 'en') || 'fa';
    this.lang.set(currentLang === 'en' ? 'en' : 'fa');
    this.langSub = this.translate.onLangChange.subscribe(({ lang }) => this.lang.set(lang === 'en' ? 'en' : 'fa'));
    void this.load();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  async load(force = false): Promise<void> {
    void force;
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.client.sectionsAll(this.lang()));
      const sorted = [...(data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.sections.set(sorted);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading sections');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(PublicSectionEditComponent, {
      panelClass: 'public-page-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(720px, calc(100vw - 32px))',
      data: { mode: 'create', locale: this.lang() }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) void this.load(true);
    });
  }

  openEdit(row: PublicSectionDto): void {
    const ref = this.dialog.open(PublicSectionEditComponent, {
      panelClass: 'public-page-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(720px, calc(100vw - 32px))',
      data: { mode: 'edit', locale: row.locale, id: row.id, existing: row }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) void this.load(true);
    });
  }

  onRowAction(event: { action: any; row: PublicSectionDto }) {
    if (event?.action?.type === 'edit') {
      this.openEdit(event.row);
    }
  }
}

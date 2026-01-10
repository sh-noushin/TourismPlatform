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

import { Client, PublicCallToActionDto } from '../../api/client';
import { PublicCtaEditComponent } from './public-cta-edit.component';

@Component({
  standalone: true,
  selector: 'public-ctas-page',
  templateUrl: './public-ctas-page.component.html',
  styleUrls: ['./public-ctas-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule, SfCardComponent, SfPageHeaderComponent, SfTableComponent, SfButtonComponent]
})
export class PublicCtasPageComponent implements OnDestroy {
  readonly lang = signal<'fa' | 'en'>('fa');
  private readonly langSub: Subscription;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly ctas = signal<PublicCallToActionDto[]>([]);

  readonly columns = computed<SfTableColumn[]>(() => {
    this.lang();
    return [
      { key: 'id', header: 'ID', field: 'id', sortable: true, align: 'start' },
      { key: 'text', header: 'Text', field: 'text' },
      { key: 'url', header: 'URL', field: 'url' },
      { key: 'sortOrder', header: 'Order', field: 'sortOrder', sortable: true },
      { key: 'isActive', header: 'Active', field: 'isActive' }
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
      const data = await firstValueFrom(this.client.ctasAll(this.lang()));
      const sorted = [...(data ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      this.ctas.set(sorted);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading call to actions');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    const ref = this.dialog.open(PublicCtaEditComponent, {
      panelClass: 'public-page-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(640px, calc(100vw - 32px))',
      data: { mode: 'create', locale: this.lang() }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) void this.load(true);
    });
  }

  openEdit(row: PublicCallToActionDto): void {
    const ref = this.dialog.open(PublicCtaEditComponent, {
      panelClass: 'public-page-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(640px, calc(100vw - 32px))',
      data: { mode: 'edit', locale: row.locale, id: row.id, existing: row }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) void this.load(true);
    });
  }

  onRowAction(event: { action: any; row: PublicCallToActionDto }) {
    if (event?.action?.type === 'edit') {
      this.openEdit(event.row);
    }
  }
}

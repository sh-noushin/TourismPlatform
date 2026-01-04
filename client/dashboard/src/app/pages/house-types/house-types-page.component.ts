import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { HouseTypesService, HouseTypeDto } from '../../features/houses/house-types.service';
import { HouseTypeEditComponent } from './house-type-edit.component';
import { ConfirmService } from '../../shared/ui/sf-dialog/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'house-types-page',
  templateUrl: './house-types-page.component.html',
  styleUrls: ['./house-types-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SfCardComponent,
    SfPageHeaderComponent,
    SfSearchbarComponent,
    SfTableComponent,
    SfButtonComponent,
    MatDialogModule,
    TranslateModule
  ]
})
export class HouseTypesPageComponent implements OnDestroy {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.houseTypes.loading());
  readonly errorSignal = computed(() => this.houseTypes.error());
  readonly lang = signal<'fa' | 'en'>('fa');
  private readonly langSub: Subscription;

  readonly columns = computed<SfTableColumn[]>(() => {
    this.lang();
    return [
      { key: 'name', header: this.translate.instant('HOUSE_TYPES.TABLE.NAME'), field: 'name', sortable: true, align: 'start' }
    ];
  });

  readonly displayedTypes = computed(() => {
    const locale = this.lang();
    const filter = this.filterSignal().toLowerCase();
    const items = filter
      ? this.houseTypes.houseTypes().filter((type) =>
          [type.name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filter))
        )
      : this.houseTypes.houseTypes();

    const sort = this.sortSignal();
    if (!sort) return items;

    const key = sort.field as keyof HouseTypeDto;
    const localeCode = locale === 'fa' ? 'fa' : 'en';
    return [...items].sort((a, b) => {
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue, localeCode, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, localeCode, { numeric: true, sensitivity: 'base' });
    });
  });

  readonly actions = computed(() => {
    this.lang();
    return [
      { label: this.translate.instant('COMMON.EDIT'), type: 'edit', icon: 'edit' },
      { label: this.translate.instant('COMMON.DELETE'), type: 'delete', icon: 'delete' }
    ];
  });

  constructor(
    private readonly houseTypes: HouseTypesService,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService,
    private readonly translate: TranslateService
  ) {
    const currentLang = (this.translate.currentLang as 'fa' | 'en') || (this.translate.getDefaultLang() as 'fa' | 'en') || 'fa';
    this.lang.set(currentLang);
    this.langSub = this.translate.onLangChange.subscribe(({ lang }) => {
      this.lang.set(lang === 'en' ? 'en' : 'fa');
    });
    void this.houseTypes.load();
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  setFilter(value: string) {
    this.filterSignal.set(value);
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
  }

  onRowAction(event: { action: any; row: HouseTypeDto }) {
    const { action, row } = event;
    if (action?.type === 'edit') {
      this.openDialog(row.id);
    } else if (action?.type === 'delete') {
      this.delete(row.id);
    }
  }

  private async delete(id: string) {
    const confirmed = await this.confirm.confirm({
      title: this.translate.instant('CONFIRM_DIALOG.TITLE'),
      message: this.translate.instant('HOUSE_TYPES_PAGE.DELETE_CONFIRMATION'),
      confirmLabel: this.translate.instant('CONFIRM_DIALOG.CONFIRM'),
      cancelLabel: this.translate.instant('CONFIRM_DIALOG.CANCEL')
    });
    if (!confirmed) return;
    try {
      await this.houseTypes.delete(id);
      await this.houseTypes.load({ force: true });
    } catch {}
  }

  openDialog(id?: string | null) {
    const ref = this.dialog.open(HouseTypeEditComponent, {
      panelClass: 'house-type-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(520px, calc(100vw - 32px))',
      data: { id: id ?? null }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        void this.houseTypes.load({ force: true });
      }
    });
  }
}

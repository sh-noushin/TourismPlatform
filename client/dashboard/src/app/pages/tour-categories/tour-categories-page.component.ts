import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTablePaging, SfTableSort } from '../../shared/models/table.models';
import { DEFAULT_PAGE_SIZE, toSortTerm } from '../../shared/models/paging.models';
import { TourCategoriesService, TourCategoryDto } from '../../features/tours/tour-categories.service';
import { TourCategoryEditComponent } from './tour-category-edit.component';
import { ConfirmService } from '../../shared/ui/sf-dialog/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'tour-categories-page',
  templateUrl: './tour-categories-page.component.html',
  styleUrls: ['./tour-categories-page.component.scss'],
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
export class TourCategoriesPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.tourCategories.loading());
  readonly errorSignal = computed(() => this.tourCategories.error());

  readonly columns: SfTableColumn[] = [{ key: 'name', header: 'Name', headerKey: 'TABLE_HEADERS.NAME', field: 'name', sortable: true }];

  /**
   * The server decides which rows these are: searching and sorting run in SQL
   * over the whole table, not over the ten rows currently in the browser.
   */
  readonly rows = computed(() => this.tourCategories.page().items);
  readonly pageIndex = signal(0);

  readonly paging = computed<SfTablePaging>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: DEFAULT_PAGE_SIZE,
    total: this.tourCategories.total()
  }));

  readonly actions = [
    { label: '', type: 'edit' },
    { label: '', type: 'delete' }
  ];

  constructor(
    private readonly tourCategories: TourCategoriesService,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService,
    private readonly translate: TranslateService
  ) {
    void this.fetch();
  }

  /** Every change of page, sort or search comes back through here. */
  private fetch() {
    return this.tourCategories.loadPage({
      page: this.pageIndex() + 1,
      pageSize: DEFAULT_PAGE_SIZE,
      search: this.filterSignal(),
      sort: toSortTerm(this.sortSignal())
    });
  }

  // A new search or ordering re-shuffles the whole result set, so staying on
  // page 4 would show an arbitrary slice of it -- or nothing at all.
  setFilter(value: string) {
    this.filterSignal.set(value);
    this.pageIndex.set(0);
    void this.fetch();
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
    this.pageIndex.set(0);
    void this.fetch();
  }

  onPageChange(paging: SfTablePaging) {
    this.pageIndex.set(paging.pageIndex);
    void this.fetch();
  }

  onRowAction(event: { action: any; row: TourCategoryDto }) {
    const { action, row } = event;
    if (action?.type === 'edit') {
      this.openDialog(row.id);
    } else if (action?.type === 'delete') {
      void this.delete(row.id);
    }
  }

  private async delete(id: string) {
    const confirmed = await this.confirm.confirm({
      title: this.translate.instant('CONFIRM_DIALOG.TITLE'),
      message: this.translate.instant('TOUR_CATEGORIES_PAGE.DELETE_CONFIRMATION'),
      confirmLabel: this.translate.instant('CONFIRM_DIALOG.CONFIRM'),
      cancelLabel: this.translate.instant('CONFIRM_DIALOG.CANCEL')
    });
    if (!confirmed) return;
    try {
      await this.tourCategories.delete(id);
      await this.fetch();
    } catch {}
  }

  openDialog(id?: string | null) {
    const ref = this.dialog.open(TourCategoryEditComponent, {
      panelClass: 'tour-category-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(520px, calc(100vw - 32px))',
      data: { id: id ?? null }
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        void this.fetch();
      }
    });
  }
}

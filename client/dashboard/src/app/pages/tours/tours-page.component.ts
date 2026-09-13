import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourSummaryDto } from '../../api/client';
import { ToursFacade } from '../../features/tours/tours.facade';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTablePaging, SfTableRowAction, SfTableSort } from '../../shared/models/table.models';
import { DEFAULT_PAGE_SIZE, toSortTerm } from '../../shared/models/paging.models';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmService } from '../../shared/ui/sf-dialog/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TourEditComponent } from './tour-edit.component';

type TourRow = TourSummaryDto & { photoCount: number };

@Component({
  standalone: true,
  selector: 'tours-page',
  templateUrl: './tours-page.component.html',
  styleUrls: ['./tours-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToursPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.tours.loading());

  readonly columns: SfTableColumn[] = [
    { key: 'name', header: 'Name', headerKey: 'TABLE_HEADERS.NAME', field: 'name', sortable: true },
    { key: 'description', header: 'Description', headerKey: 'TABLE_HEADERS.DESCRIPTION', field: 'description', sortable: true },
    { key: 'year', header: 'Year', headerKey: 'TABLE_HEADERS.YEAR', field: 'year', sortable: true }
  ];

  /** The server's page, with the two fields the table needs derived per row. */
  readonly rows = computed(() =>
    this.tours.items().map((tour) => ({
      ...tour,
      photoCount: Array.isArray(tour.photos) ? tour.photos.length : 0,
      year: tour.year ?? undefined
    }))
  );

  readonly pageIndex = signal(0);

  readonly paging = computed<SfTablePaging>(() => ({
    pageIndex: this.pageIndex(),
    pageSize: DEFAULT_PAGE_SIZE,
    total: this.tours.total()
  }));

  readonly actions: SfTableRowAction[] = [
    { label: 'Edit', labelKey: 'TABLE_ACTIONS.EDIT', type: 'edit', icon: 'edit' },
    { label: 'Delete', labelKey: 'TABLE_ACTIONS.DELETE', type: 'delete', icon: 'delete', color: 'warn' }
  ];

  constructor(
    public readonly tours: ToursFacade,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService,
    private readonly translate: TranslateService
  ) {
    void this.fetch();
  }

  private fetch() {
    return this.tours.loadPage({
      page: this.pageIndex() + 1,
      pageSize: DEFAULT_PAGE_SIZE,
      search: this.filterSignal(),
      sort: toSortTerm(this.sortSignal())
    });
  }

  onRowAction(event: { action: any; row: TourRow }) {
    const { action, row } = event;
    if (action?.type === 'edit') {
      this.openDialog(row.tourId);
      return;
    }
    if (action?.type === 'delete') {
      this.confirmDelete(row);
    }
  }

  createTour() {
    this.openDialog();
  }

  private async confirmDelete(row: TourRow) {
    const confirmed = await this.confirm.confirm({
      title: this.translate.instant('CONFIRM_DIALOG.TITLE'),
      message: this.translate.instant('TOURS_PAGE.DELETE_CONFIRMATION', { name: row.name ?? '' }),
      confirmLabel: this.translate.instant('CONFIRM_DIALOG.CONFIRM'),
      cancelLabel: this.translate.instant('CONFIRM_DIALOG.CANCEL')
    });
    if (!confirmed) return;
    try {
      await this.tours.delete(row.tourId);
    } catch {
      // error message already surfaced by ToursFacade
    }
  }

  private openDialog(id?: string) {
    const ref = this.dialog.open(TourEditComponent, {
      panelClass: 'tour-edit-dialog',
      autoFocus: false,
      maxWidth: 'none',
      width: 'min(960px, calc(100vw - 32px))',
      data: { id: id ?? null }
    });
    ref.afterClosed().subscribe((saved) => {
      if (saved) {
        void this.fetch();
      }
    });
  }

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
}

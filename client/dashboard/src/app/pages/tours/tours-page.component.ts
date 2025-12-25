import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourSummaryDto } from '../../api/client';
import { ToursFacade } from '../../features/tours/tours.facade';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableRowAction, SfTableSort } from '../../shared/models/table.models';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmService } from '../../shared/ui/sf-dialog/confirm.service';
import { TourEditComponent } from './tour-edit.component';

type TourRow = TourSummaryDto & { photoCount: number };

@Component({
  standalone: true,
  selector: 'tours-page',
  templateUrl: './tours-page.component.html',
  styleUrls: ['./tours-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToursPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.tours.loading());

  readonly columns: SfTableColumn[] = [
    { key: 'name', header: 'Name', field: 'name', sortable: true },
    { key: 'description', header: 'Description', field: 'description' },
    { key: 'year', header: 'Year', field: 'year', align: 'end', sortable: true }
  ];

  readonly displayedTours = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const list = filter
      ? this.tours.items().filter((tour) =>
          [tour.name, tour.description, tour.tourCategoryName, tour.year?.toString()]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(filter))
        )
      : this.tours.items();

    const sort = this.sortSignal();
    const unsorted = sort
      ? [...list].sort((a, b) => {
          const key = sort.field as keyof TourSummaryDto;
          const aValue = (a[key] ?? '').toString().toLowerCase();
          const bValue = (b[key] ?? '').toString().toLowerCase();
          return sort.direction === 'asc'
            ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
            : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
        })
      : list;
    return unsorted.map((tour) => ({
      ...tour,
      photoCount: Array.isArray(tour.photos) ? tour.photos.length : 0,
      year: tour.year ?? undefined
    }));
  });

  readonly actions: SfTableRowAction[] = [
    { label: 'Edit', type: 'edit', icon: 'edit' },
    { label: 'Delete', type: 'delete', icon: 'delete', color: 'warn' }
  ];

  constructor(
    public readonly tours: ToursFacade,
    private readonly dialog: MatDialog,
    private readonly confirm: ConfirmService
  ) {
    this.tours.load();
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
      title: 'Delete tour',
      message: `Delete ${row.name}?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
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
        this.tours.load();
      }
    });
  }

  setFilter(value: string) {
    this.filterSignal.set(value);
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
  }

  // data is loaded via `ToursFacade.load()` called in constructor
}

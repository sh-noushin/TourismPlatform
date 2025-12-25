import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { TourCategoriesService, TourCategoryDto } from '../../features/tours/tour-categories.service';
import { TourCategoryEditComponent } from './tour-category-edit.component';

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
    TourCategoryEditComponent
  ]
})
export class TourCategoriesPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.tourCategories.loading());
  readonly errorSignal = computed(() => this.tourCategories.error());

  readonly columns: SfTableColumn[] = [{ key: 'name', header: 'Name', field: 'name', sortable: true }];

  readonly displayedCategories = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const items = filter
      ? this.tourCategories.tourCategories().filter((c) =>
          [c.name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filter))
        )
      : this.tourCategories.tourCategories();

    const sort = this.sortSignal();
    if (!sort) return items;

    const key = sort.field as keyof TourCategoryDto;
    return [...items].sort((a, b) => {
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  readonly actions = [
    { label: '', type: 'edit' },
    { label: '', type: 'delete' }
  ];

  constructor(private readonly tourCategories: TourCategoriesService, private readonly dialog: MatDialog) {
    void this.tourCategories.load();
  }

  setFilter(value: string) {
    this.filterSignal.set(value);
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
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
    if (!confirm('Delete this tour category?')) return;
    try {
      await this.tourCategories.delete(id);
      await this.tourCategories.load({ force: true });
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
        void this.tourCategories.load({ force: true });
      }
    });
  }
}

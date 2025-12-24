import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
    HouseTypeEditComponent
  ]
})
export class HouseTypesPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);
  readonly loadingSignal = computed(() => this.houseTypes.loading());
  readonly errorSignal = computed(() => this.houseTypes.error());

  readonly columns: SfTableColumn[] = [
    { key: 'name', header: 'Name', field: 'name', sortable: true },
    { key: 'id', header: 'Id', field: 'id', sortable: true }
  ];

  readonly displayedTypes = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const items = filter
      ? this.houseTypes.houseTypes().filter((type) =>
          [type.name, type.id]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filter))
        )
      : this.houseTypes.houseTypes();

    const sort = this.sortSignal();
    if (!sort) return items;

    const key = sort.field as keyof HouseTypeDto;
    return [...items].sort((a, b) => {
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  readonly actions = [{ label: 'Edit', type: 'edit', icon: 'edit' }];

  constructor(private readonly houseTypes: HouseTypesService, private readonly dialog: MatDialog) {
    void this.houseTypes.load();
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
    }
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

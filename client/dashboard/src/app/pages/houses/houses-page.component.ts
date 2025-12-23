import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseSummaryDto } from '../../api/client';
import { HousesFacade } from '../../features/houses/houses.facade';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'houses-page',
  templateUrl: './houses-page.component.html',
  styleUrls: ['./houses-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousesPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly loadingSignal = computed(() => this.houses.loading());
  readonly columns: SfTableColumn[] = [
    { key: 'name', header: 'Name', field: 'name', sortable: true },
    { key: 'type', header: 'Type', field: 'houseTypeName', sortable: true },
    { key: 'city', header: 'City', field: 'city', sortable: true },
    { key: 'country', header: 'Country', field: 'country', sortable: true }
  ];

  readonly displayedHouses = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const list = filter
      ? this.houses.items().filter((house) =>
          [house.name, house.city, house.country, house.houseTypeName]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(filter))
        )
      : this.houses.items();

    const sort = this.sortSignal();
    if (!sort) return list;
    const key = sort.field as keyof HouseSummaryDto;
    return [...list].sort((a, b) => {
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  constructor(private readonly houses: HousesFacade) {
    this.houses.load();
  }

  setFilter(value: string) {
    this.filterSignal.set(value);
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
  }

  // data is loaded via `HousesFacade.load()` called in constructor
}

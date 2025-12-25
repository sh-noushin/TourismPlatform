import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { ExchangeRateDto } from '../../api/client';
import { ExchangeFacade } from '../../features/exchange/exchange.facade';

@Component({
  standalone: true,
  selector: 'exchange-page',
  template: `
    <section class="exchange-page">
      <div class="exchange-page__header">
        <sf-page-header title="Exchange" subtitle="Live currency rates"></sf-page-header>
        <div class="exchange-page__filters">
          <sf-searchbar placeholder="Search currency code" (valueChange)="filter.set($event)"></sf-searchbar>
        </div>
      </div>

      @if (facade.error()) {
        <div class="exchange-page__error">{{ facade.error() }}</div>
      }

      <sf-card>
        <sf-table
          [columns]="columns"
          [data]="displayed()"
          [loading]="facade.loading()"
          (sortChange)="onSortChange($event)"
        ></sf-table>
      </sf-card>
    </section>
  `,
  styleUrls: ['./exchange-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangePageComponent {
  readonly filter = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly columns: SfTableColumn[] = [
    { key: 'base', header: 'Base', field: 'baseCurrencyCode', sortable: true },
    { key: 'quote', header: 'Quote', field: 'quoteCurrencyCode', sortable: true },
    { key: 'rate', header: 'Rate', field: 'rate', sortable: true },
    { key: 'captured', header: 'Captured (UTC)', field: 'capturedAtUtc', sortable: true }
  ];

  readonly displayed = computed(() => {
    const q = this.filter().toLowerCase();
    const list = q
      ? this.facade
          .rates()
          .filter((r) => [r.baseCurrencyCode, r.quoteCurrencyCode].some((v) => v?.toLowerCase().includes(q)))
      : this.facade.rates();

    const sort = this.sortSignal();
    if (!sort) return list;

    const field = sort.field as keyof ExchangeRateDto;
    return [...list].sort((a, b) => {
      const aV = (a[field] ?? '').toString().toLowerCase();
      const bV = (b[field] ?? '').toString().toLowerCase();
      return sort.direction === 'asc' ? aV.localeCompare(bV, undefined, { numeric: true }) : bV.localeCompare(aV, undefined, { numeric: true });
    });
  });

  constructor(public readonly facade: ExchangeFacade) {
    this.facade.loadRates();
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
  }
}

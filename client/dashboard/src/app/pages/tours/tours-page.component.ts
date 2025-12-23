import { ChangeDetectionStrategy, Component, computed, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Client, TourSummaryDto } from '../../api/client';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'tours-page',
  templateUrl: './tours-page.component.html',
  styleUrls: ['./tours-page.component.scss'],
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToursPageComponent {
  readonly toursSignal = signal<TourSummaryDto[]>([]);
  readonly loadingSignal = signal(true);
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly columns: SfTableColumn[] = [
    { key: 'name', header: 'Name', field: 'name', sortable: true },
    { key: 'category', header: 'Category', field: 'tourCategoryName', sortable: true }
  ];

  readonly displayedTours = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const list = filter
      ? this.toursSignal().filter((tour) =>
          [tour.name, tour.tourCategoryName]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(filter))
        )
      : this.toursSignal();

    const sort = this.sortSignal();
    if (!sort) {
      return list;
    }

    const key = sort.field as keyof TourSummaryDto;
    return [...list].sort((a, b) => {
      const aValue = (a[key] ?? '').toString().toLowerCase();
      const bValue = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  constructor(
    private readonly client: Client,
    private readonly toast: ToastService,
    private readonly destroyRef: DestroyRef
  ) {
    this.loadTours();
  }

  setFilter(value: string) {
    this.filterSignal.set(value);
  }

  onSortChange(sort: SfTableSort) {
    this.sortSignal.set(sort);
  }

  private loadTours() {
    this.loadingSignal.set(true);
    this.client.toursAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingSignal.set(false))
      )
      .subscribe({
        next: (data) => this.toursSignal.set(data ?? []),
        error: () => this.toast.show('Unable to load tours', 'danger')
      });
  }
}

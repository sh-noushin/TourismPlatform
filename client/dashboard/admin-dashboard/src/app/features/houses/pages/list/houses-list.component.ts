import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { SfCardComponent } from '../../../../shared/ui/sf-card/sf-card.component';
import { SfEmptyStateComponent } from '../../../../shared/ui/sf-empty-state/sf-empty-state.component';
import { SfFormFieldComponent } from '../../../../shared/ui/sf-form-field/sf-form-field.component';
import { SfPageHeaderComponent } from '../../../../shared/ui/sf-page-header/sf-page-header.component';
import { SfTableComponent } from '../../../../shared/ui/sf-table/sf-table.component';
import { SfButtonComponent } from '../../../../shared/ui/sf-button/sf-button.component';
import { ConfirmService } from '../../../../shared/ui/confirm.service';
import { ToastService } from '../../../../core/ui/toast.service';
import { TableAction, TableColumn } from '../../../../shared/models/table.model';
import { HousesFacade } from '../../../houses/services/houses.facade';

@Component({
  selector: 'app-houses-list',
  standalone: true,
  imports: [
    SfCardComponent,
    SfPageHeaderComponent,
    SfFormFieldComponent,
    SfTableComponent,
    SfButtonComponent,
    SfEmptyStateComponent
  ],
  templateUrl: './houses-list.component.html',
  styleUrl: './houses-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousesListComponent implements OnInit {
  protected readonly facade = inject(HousesFacade);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly searchTerm = signal('');

  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'houseTypeName', label: 'Type', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'country', label: 'Country', sortable: true }
  ];

  protected readonly actions: TableAction[] = [
    { label: 'Edit', action: (row) => this.router.navigateByUrl(`/admin/houses/${row.houseId}`) },
    { label: 'Delete', type: 'danger', action: (row) => this.delete(row.houseId) }
  ];

  ngOnInit(): void {
    this.facade.loadList().subscribe();
  }

  protected onPageChange(ev: { page: number; pageSize: number }) {
    this.facade.setPage(ev.page, ev.pageSize).subscribe();
  }

  protected onSortChange(key: string) {
    this.facade.setSort(key).subscribe();
  }

  protected createNew() {
    this.router.navigateByUrl('/admin/houses/new');
  }

  private delete(id: string) {
    this.confirm.confirm({
      title: 'Delete house',
      description: 'This action cannot be undone and will remove the property permanently.'
    }).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      this.facade.delete(id).subscribe({
        next: () => {
          this.toast.show('House deleted', 'success');
          this.facade.refresh().subscribe();
        },
        error: () => {
          this.toast.show('Unable to delete house', 'error');
        }
      });
    });
  }

  protected applyFilters() {
    this.facade.setSearchTerm(this.searchTerm()).subscribe();
  }

  protected clearFilters() {
    if (!this.searchTerm()) {
      return;
    }
    this.searchTerm.set('');
    this.facade.setSearchTerm('').subscribe();
  }
}

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SfTableComponent } from '../../../../shared/ui/sf-table/sf-table.component';
import { SfButtonComponent } from '../../../../shared/ui/sf-button/sf-button.component';
import { TableAction, TableColumn } from '../../../../shared/models/table.model';
import { HousesFacade } from '../../../houses/services/houses.facade';

@Component({
  selector: 'app-houses-list',
  standalone: true,
  imports: [SfTableComponent, SfButtonComponent],
  templateUrl: './houses-list.component.html',
  styleUrl: './houses-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousesListComponent implements OnInit {
  protected readonly facade = inject(HousesFacade);
  private readonly router = inject(Router);

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
    this.facade.setPage(ev.page, ev.pageSize);
  }

  protected onSortChange(key: string) {
    this.facade.setSort(key);
  }

  protected createNew() {
    this.router.navigateByUrl('/admin/houses/new');
  }

  private delete(id: string) {
    this.facade.delete(id).subscribe(() => this.facade.loadList().subscribe());
  }
}

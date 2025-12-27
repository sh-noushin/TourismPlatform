import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { UserSummaryDto, UsersFacade } from '../../features/users/users.facade';
import { TabService } from '../../core/tab/tab.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'users-page',
  templateUrl: './users-page.component.html',
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly loadingSignal = computed(() => this.users.loading());

  readonly columns: SfTableColumn[] = [
    { key: 'email', header: 'Email', headerKey: 'TABLE_HEADERS.EMAIL', field: 'email', sortable: true },
    { key: 'name', header: 'Name', headerKey: 'TABLE_HEADERS.NAME', field: 'fullName', sortable: true }
  ];

  readonly displayedUsers = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const list = filter ? this.users.items().filter(u => [u.email, u.fullName].filter(Boolean).some(v => v?.toLowerCase().includes(filter))) : this.users.items();
    const sort = this.sortSignal();
    if (!sort) return list;
    const key = sort.field as keyof UserSummaryDto;
    return [...list].sort((a,b) => {
      const aV = (a[key] ?? '').toString().toLowerCase();
      const bV = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
    });
  });

  readonly actions = [{ label: 'Edit', labelKey: 'TABLE_ACTIONS.EDIT', type: 'edit', icon: 'edit' }];

  constructor(public readonly users: UsersFacade, private readonly tabs: TabService, private readonly router: Router) {
    this.users.load();
  }

  setFilter(value: string) { this.filterSignal.set(value); }
  onSortChange(sort: SfTableSort) { this.sortSignal.set(sort); }

  onRowAction(event: { action: any; row: any }) {
    const { action, row } = event;
    if (action?.type === 'edit') {
      const path = `/admin/users/${row.id}/edit`;
      this.tabs.openOrActivate(path, `User ${row.id}`);
      this.router.navigateByUrl(path);
    }
  }

  createUser() {
    const path = '/admin/users/new';
    this.tabs.openOrActivate(path, 'New user');
    this.router.navigateByUrl(path);
  }
}

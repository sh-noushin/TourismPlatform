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

@Component({
  standalone: true,
  selector: 'users-page',
  template: `
  <section class="users-page">
    <div class="users-page__header">
        <sf-page-header title="Users" subtitle="Platform users">
        <sf-button sfPageHeaderActions variant="ghost" type="button" (click)="createUser()">New user</sf-button>
      </sf-page-header>
      <div class="users-page__filters">
        <sf-searchbar placeholder="Search users" (valueChange)="setFilter($event)"></sf-searchbar>
      </div>
    </div>

    @if (users.error()) {
      <div class="users-page__error">{{ users.error() }}</div>
    }

    <sf-card>
      <sf-table [columns]="columns" [data]="displayedUsers()" [loading]="loadingSignal()" [actions]="actions" (rowAction)="onRowAction($event)" (sortChange)="onSortChange($event)"></sf-table>
    </sf-card>
  </section>
  `,
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly loadingSignal = computed(() => this.users.loading());

  readonly columns: SfTableColumn[] = [
    { key: 'email', header: 'Email', field: 'email', sortable: true },
    { key: 'name', header: 'Name', field: 'fullName', sortable: true }
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

  readonly actions = [{ label: 'Edit', type: 'edit', icon: 'edit' }];

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

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfPageHeaderComponent } from '../../shared/ui/sf-page-header/sf-page-header.component';
import { SfSearchbarComponent } from '../../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTableComponent } from '../../shared/ui/sf-table/sf-table.component';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfTableColumn, SfTableSort } from '../../shared/models/table.models';
import { PermissionsFacade } from '../../features/permissions/permissions.facade';
import { TabService } from '../../core/tab/tab.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'permissions-page',
  template: `
  <section class="permissions-page">
    <div class="permissions-page__header">
      <sf-page-header title="Permissions" subtitle="Manage permissions">
        <sf-button sfPageHeaderActions variant="ghost" type="button">New permission</sf-button>
      </sf-page-header>
      <div class="permissions-page__filters">
        <sf-searchbar placeholder="Search permissions" (valueChange)="setFilter($event)"></sf-searchbar>
      </div>
    </div>

    <sf-card>
      <sf-table [columns]="columns" [data]="displayed()" [loading]="loadingSignal()" [actions]="actions" (rowAction)="onRowAction($event)"></sf-table>
    </sf-card>
  </section>
  `,
  imports: [CommonModule, SfCardComponent, SfPageHeaderComponent, SfSearchbarComponent, SfTableComponent, SfButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsPageComponent {
  readonly filterSignal = signal('');
  readonly sortSignal = signal<SfTableSort | null>(null);

  readonly loadingSignal = computed(() => this.facade.loading());

  readonly columns: SfTableColumn[] = [
    { key: 'code', header: 'Code', field: 'code', sortable: true },
    { key: 'description', header: 'Description', field: 'description' }
  ];

  readonly displayed = computed(() => {
    const filter = this.filterSignal().toLowerCase();
    const list = filter ? this.facade.items().filter(p => [p.code, p.description].filter(Boolean).some(v => v?.toLowerCase().includes(filter))) : this.facade.items();
    const sort = this.sortSignal();
    if (!sort) return list;
    const key = sort.field as keyof any;
    return [...list].sort((a,b) => {
      const aV = (a[key] ?? '').toString().toLowerCase();
      const bV = (b[key] ?? '').toString().toLowerCase();
      return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
    });
  });

  readonly actions = [{ label: 'Edit', type: 'edit', icon: 'edit' }];

  constructor(private readonly facade: PermissionsFacade, private readonly tabs: TabService, private readonly router: Router) {
    this.facade.load();
  }

  setFilter(v: string) { this.filterSignal.set(v); }
  onSortChange(s: SfTableSort) { this.sortSignal.set(s); }

  onRowAction(event: { action: any; row: any }) {
    const { action, row } = event;
    if (action?.type === 'edit') {
      const path = `/admin/permissions/${row.id}/edit`;
      this.tabs.openOrActivate(path, `Permission ${row.id}`);
      this.router.navigateByUrl(path);
    }
  }
}

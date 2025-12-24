import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SfButtonComponent } from '../shared/ui/sf-button/sf-button.component';
import { SfCardComponent } from '../shared/ui/sf-card/sf-card.component';
import { SfDrawerComponent } from '../shared/ui/sf-drawer/sf-drawer.component';
import { SfSearchbarComponent } from '../shared/ui/sf-searchbar/sf-searchbar.component';
import { SfTabsComponent } from '../shared/ui/sf-tabs/sf-tabs.component';
import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { TabService } from '../core/tab/tab.service';
import { AuthFacade } from '../core/auth/auth.facade';

const OVERVIEW_STATS = [
  { label: 'Visitors', value: '10k', meta: 'Active this week', trend: '+24%' },
  { label: 'Bookings', value: '3.2k', meta: 'Confirmed this week', trend: '+11%' },
  { label: 'Tours', value: '128', meta: 'Published experiences', trend: '+2 new' },
  { label: 'Permissions', value: '42', meta: 'Controlled definitions', trend: '+3 pending' }
];

@Component({
  standalone: true,
  selector: 'dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SfButtonComponent,
    SfCardComponent,
    SfDrawerComponent,
    SfSearchbarComponent,
    SfTabsComponent,
    HasPermissionDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardShellComponent {
  readonly drawerOpen = signal(false);
  readonly overviewStats = OVERVIEW_STATS;
  readonly searchTerm = signal('');

  constructor(
    public readonly auth: AuthFacade,
    private readonly tabs: TabService,
    private readonly router: Router
  ) {}

  toggleDrawer() {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch {}
    this.tabs.closeAll();
    await this.router.navigateByUrl('/login');
  }
}

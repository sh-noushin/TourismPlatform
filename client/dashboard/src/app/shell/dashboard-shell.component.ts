import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SfButtonComponent } from '../shared/ui/sf-button/sf-button.component';
import { SfTabsComponent } from '../shared/ui/sf-tabs/sf-tabs.component';
import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { TabService } from '../core/tab/tab.service';
import { AuthFacade } from '../core/auth/auth.facade';
import { UserMenuComponent } from '../shared/ui/user-menu/user-menu.component';
import { ToastService } from '../shared/ui/toast/toast.service';

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
    SfTabsComponent,
    HasPermissionDirective,
    UserMenuComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardShellComponent {
  readonly userName = computed(() => {
    const email = this.auth.userEmail();
    if (!email) return 'User';
    const handle = email.split('@')[0] ?? email;
    return handle.replace(/[\.\_\-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  });
  readonly displayName = this.userName;
  readonly roleLabel = computed(() => {
    if (this.auth.isSuperUser()) return 'Super Admin';
    const roles = Array.from(this.auth.roles());
    return roles[0] ?? 'Operator';
  });
  readonly userInitials = computed(() => {
    const name = this.userName();
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.map((p) => p[0]).join('').slice(0, 2);
    return (letters || name.slice(0, 2) || 'U').toUpperCase();
  });

  readonly sidebarOpen = signal(true);

  readonly menuItems = [
    { label: 'Houses', path: '/admin/houses', permission: 'Houses.View' },
    { label: 'Tours', path: '/admin/tours', permission: 'Tours.View' },
    { label: 'Exchanges', path: '/admin/exchange', permission: 'Exchange.View' },
    { label: 'Permissions', path: '/admin/permissions', permission: 'Users.Manage' }
  ];

  readonly quickActions = [
    { label: 'New house', path: '/admin/houses/new', permission: 'Houses.View' },
    { label: 'New tour', path: '/admin/tours/new', permission: 'Tours.View' },
    { label: 'New exchange', path: '/admin/exchange', permission: 'Exchange.View' },
    { label: 'New permission', path: '/admin/permissions/new', permission: 'Users.Manage' }
  ];

  constructor(
    public readonly auth: AuthFacade,
    private readonly tabs: TabService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  openNav(path: string, title: string) {
    const fullPath = this.ensureAdminPath(path);
    this.tabs.openOrActivate(fullPath, title);
    void this.router.navigateByUrl(fullPath);
  }

  private ensureAdminPath(path: string) {
    return path.startsWith('/admin') ? path : `/admin/${path}`;
  }

  canAccess(permission: string) {
    try {
      return this.auth.hasPermission(permission)();
    } catch {
      return false;
    }
  }

  onChangePassword() {
    this.toast.show('Change password flow is not wired yet. Please use your identity provider.', 'info');
  }

  toggleSidebar() {
    this.sidebarOpen.update((open) => !open);
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch {}
    this.tabs.closeAll();
    await this.router.navigateByUrl('/login');
  }
}

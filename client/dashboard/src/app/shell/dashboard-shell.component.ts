import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { TabService, TabItem } from '../core/tab/tab.service';
import { AuthFacade } from '../core/auth/auth.facade';

type MenuItem = {
  label: string;
  basePath: string;
  short: string;
};

@Component({
  standalone: true,
  selector: 'dashboard-shell',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  readonly sidebarCollapsed = signal(false);
  readonly userMenuOpen = signal(false);

  readonly menuItems: MenuItem[] = [
    { label: 'Houses', basePath: '/admin/houses', short: 'H' },
    { label: 'Tours', basePath: '/admin/tours', short: 'T' },
    { label: 'Exchanges', basePath: '/admin/exchange', short: 'E' },
    { label: 'Permissions', basePath: '/admin/permissions', short: 'P' },
  ];

  readonly displayName = computed(() => {
    const a: any = this.auth as any;
    const name =
      a.userName?.() ??
      a.currentUser?.()?.userName ??
      a.currentUser?.()?.name ??
      null;

    if (name && String(name).trim().length) return String(name).trim();

    const email = this.auth.userEmail?.() ?? null;
    if (!email) return 'User';
    return this.prettyNameFromEmail(String(email));
  });

  readonly initials = computed(() => {
    const name = (this.displayName() ?? 'User').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? (parts[1]?.[0] ?? '') : '';
    return (a + b).toUpperCase();
  });

  readonly activeTab = computed<TabItem | null>(() => this.tabs.getActiveTab());

  constructor(
    public readonly tabs: TabService,
    private readonly router: Router,
    private readonly auth: AuthFacade
  ) {
    if (this.tabs.tabs().length === 0) {
      const first = this.menuItems[0];
      const tab = this.tabs.openNewTab(first.basePath, first.label, true);
      void this.router.navigateByUrl(tab.path);
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  openMenu(item: MenuItem) {
    const title = this.nextTitle(item.label);
    const tab = this.tabs.openNewTab(item.basePath, title, false);
    void this.router.navigateByUrl(tab.path);
  }

  activate(tab: TabItem) {
    this.tabs.activateTab(tab.id);
    void this.router.navigateByUrl(tab.path);
  }

  close(tab: TabItem, ev?: Event) {
    ev?.stopPropagation();
    ev?.preventDefault();

    const next = this.tabs.closeTab(tab.id);
    if (next) void this.router.navigateByUrl(next.path);
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.userMenuOpen.set(false);
  }

  changePassword() {
    this.closeUserMenu();
    const tab = this.tabs.openNewTab('/admin/change-password', 'Change password', false);
    void this.router.navigateByUrl(tab.path);
  }

  async logout() {
    this.closeUserMenu();
    try {
      await this.auth.logout();
    } catch {}
    this.tabs.closeAll();
    await this.router.navigateByUrl('/login');
  }

  private nextTitle(base: string) {
    const count = this.tabs.tabs().filter(t => (t.title ?? '').startsWith(base)).length;
    return count ? `${base} (${count + 1})` : base;
  }

  private prettyNameFromEmail(email: string) {
    const left = (email.split('@')[0] ?? 'User').trim();
    const words = left
      .replace(/[._-]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return words.join(' ') || 'User';
  }
}

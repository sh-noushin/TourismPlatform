import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { AuthFacade } from '../core/auth/auth.facade';
import { TabService, TabItem } from '../core/tab/tab.service';

type MenuItem = {
  label: string;
  basePath: string;
  icon: string;
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
    { label: 'Houses', basePath: '/admin/houses', icon: '🏠' },
    { label: 'Tours', basePath: '/admin/tours', icon: '🧭' },
    { label: 'Exchanges', basePath: '/admin/exchange', icon: '💱' },
    { label: 'Permissions', basePath: '/admin/permissions', icon: '🔐' },
  ];

  // SOURCE OF TRUTH: AuthFacade.userName()
  readonly displayName = computed(() => {
    const name = (this.auth.userName?.() ?? '').trim();
    if (name) return name;

    const email = (this.auth.userEmail?.() ?? '').trim();
    if (email) return this.prettyNameFromEmail(email);

    if (this.auth.isSuperUser?.()) return 'Super Admin';
    return 'User';
  });

  readonly initials = computed(() => {
    const name = this.displayName().trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? (parts[1]?.[0] ?? '') : '';
    return (a + b).toUpperCase();
  });

  constructor(
    public readonly auth: AuthFacade,
    public readonly tabs: TabService,
    private readonly router: Router
  ) {
    if (this.tabs.tabs().length === 0) {
      const t = this.tabs.openNewTab('/admin/houses', 'Houses', true);
      void this.router.navigateByUrl(t.path);
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

    this.tabs.closeTab(tab.id);

    const activeId = this.tabs.activeTabId();
    if (!activeId) return;

    const activeTab = this.tabs.tabs().find((t: TabItem) => t.id === activeId) ?? null;
    if (!activeTab) return;

    void this.router.navigateByUrl(activeTab.path);
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
    const count = this.tabs
      .tabs()
      .filter((t: TabItem) => (t.title ?? '').startsWith(base))
      .length;

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

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { AuthFacade } from '../core/auth/auth.facade';
import { TabService, TabItem } from '../core/tab/tab.service';

type SubMenuItem = {
  label: string;
  path: string;
};

type MenuItem = {
  label: string;
  basePath: string; // used as group id for expand/collapse
  icon: string;
  subItems?: SubMenuItem[];
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
  readonly expandedMenu = signal<string | null>(null);

  readonly menuItems: MenuItem[] = [
    {
      label: 'House management',
      basePath: '/admin/house-management',
      icon: '🏠',
      subItems: [
        { label: 'Houses', path: '/admin/houses' },
        { label: 'House types', path: '/admin/house-types' }
      ]
    },
    {
      label: 'Tours management',
      basePath: '/admin/tours-management',
      icon: '🧭',
      subItems: [
        { label: 'Category', path: '/admin/tour-categories' },
        { label: 'Tours', path: '/admin/tours' }
      ]
    },
    { label: 'Exchanges', basePath: '/admin/exchange', icon: '💱' },
    {
      label: 'Permission management',
      basePath: '/admin/permissions',
      icon: '🔐',
      subItems: [
        { label: 'Roles', path: '/admin/roles' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Permissions', path: '/admin/permissions' }
      ]
    },
  ];

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
    // default tab: houses
    if (this.tabs.tabs().length === 0) {
      const t = this.tabs.openNewTab('/admin/houses', 'Houses', true);
      void this.router.navigateByUrl(t.path);
    }

    // auto-expand House management if active tab is one of its sub routes
    const active = this.activeTabPath();
    const houseGroup = this.menuItems.find(m => m.basePath === '/admin/house-management');
    if (houseGroup?.subItems?.some(s => this.normalize(s.path) === active)) {
      this.expandedMenu.set(houseGroup.basePath);
    }

    const tourGroup = this.menuItems.find(m => m.basePath === '/admin/tours-management');
    if (tourGroup?.subItems?.some(s => this.normalize(s.path) === active)) {
      this.expandedMenu.set(tourGroup.basePath);
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  openMenu(item: MenuItem) {
    if (item.subItems?.length) {
      this.expandedMenu.update((current) => (current === item.basePath ? null : item.basePath));
      return;
    }

    this.openTab(item.basePath, item.label);
  }

  openSubMenuItem(item: MenuItem, sub: SubMenuItem) {
    this.expandedMenu.set(item.basePath);
    this.openTab(sub.path, sub.label);
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

  private openTab(path: string, label: string) {
    const title = this.nextTitle(label);
    const tab = this.tabs.openNewTab(path, title, false);
    void this.router.navigateByUrl(tab.path);
  }

  isMenuActive(item: MenuItem) {
    const active = this.activeTabPath();
    if (item.subItems?.length) {
      return item.subItems.some((sub) => this.normalize(sub.path) === active);
    }
    return this.normalize(item.basePath) === active;
  }

  isSubMenuItemActive(sub: SubMenuItem) {
    return this.normalize(sub.path) === this.activeTabPath();
  }

  private activeTabPath() {
    const active = this.tabs.getActiveTab();
    return this.normalize(active?.path ?? '');
  }

  private normalize(path: string) {
    return (path.split('?')[0] ?? '').replace(/\/$/, '');
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

import { ElementRef, ViewChild, HostListener } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AuthFacade } from '../core/auth/auth.facade';
import { TabService, TabItem } from '../core/tab/tab.service';
import { ChangePasswordPageComponent } from '../pages/change-password/change-password-page.component';

type SubMenuItem = {
  label: string;
  path: string;
};

type MenuItem = {
  label: string;
  basePath: string;
  icon: string;
  subItems?: SubMenuItem[];
};

@Component({
  standalone: true,
  selector: 'dashboard-shell',
  imports: [CommonModule, RouterOutlet, MatDialogModule],
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent {
  @ViewChild('userMenuBtn', { read: ElementRef }) userMenuBtnRef!: ElementRef<HTMLElement>;
  @ViewChild('userMenu', { read: ElementRef }) userMenuRef!: ElementRef<HTMLElement>;
  readonly sidebarCollapsed = signal(false);
  readonly userMenuOpen = signal(false);
  readonly expandedMenu = signal<string | null>(null);

  readonly menuItems: MenuItem[] = [
    {
      label: 'مدیریت املاک',
      basePath: '/admin/house-management',
      icon: '🏠',
      subItems: [
        { label: 'املاک', path: '/admin/houses' },
        { label: 'انواع املاک', path: '/admin/house-types' }
      ]
    },
    {
      label: 'مدیریت تورها',
      basePath: '/admin/tours-management',
      icon: '🧳',
      subItems: [
        { label: 'دسته‌بندی‌ها', path: '/admin/tour-categories' },
        { label: 'تورها', path: '/admin/tours' }
      ]
    },
    { label: 'صرافی', basePath: '/admin/exchange', icon: '💱' },
    {
      label: 'مدیریت دسترسی‌ها',
      basePath: '/admin/permissions',
      icon: '🔐',
      subItems: [
        { label: 'نقش‌ها', path: '/admin/roles' },
        { label: 'کاربران', path: '/admin/users' },
        { label: 'دسترسی‌ها', path: '/admin/permissions' }
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
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {
    if (this.tabs.tabs().length === 0) {
      const t = this.tabs.openNewTab('/admin/houses', 'املاک', true);
      void this.router.navigateByUrl(t.path);
    }

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
      this.expandedMenu.update(current => (current === item.basePath ? null : item.basePath));
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

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (!this.userMenuOpen()) return;
    const btn = this.userMenuBtnRef?.nativeElement;
    const menu = this.userMenuRef?.nativeElement;
    const path = (event.composedPath && event.composedPath()) || [];
    if (btn && path.includes(btn)) return;
    if (menu && path.includes(menu)) return;
    this.closeUserMenu();
  }

  changePassword() {
  this.closeUserMenu();

  this.dialog.open(ChangePasswordPageComponent, {
    panelClass: 'change-password-dialog',
    backdropClass: 'change-password-backdrop', 
    autoFocus: false,
    maxWidth: 'min(520px, calc(100vw - 32px))',
    width: 'min(520px, 100%)'
  });
}


  async logout(event?: MouseEvent) {
    event?.stopPropagation();
    event?.preventDefault();

    this.closeUserMenu();

    try {
      await this.auth.logout();
    } catch {}

    try {
      this.tabs.closeAll();
    } catch {}

    // Guaranteed redirect (avoids guards/tabs navigating back)
    window.location.replace('/login');
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
      return item.subItems.some(sub => this.normalize(sub.path) === active);
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

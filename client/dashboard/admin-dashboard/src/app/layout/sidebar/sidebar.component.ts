import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';
import { hasPermissionOrSuperUser } from '../../core/auth/permission.util';
import { NAV_ITEMS, NavItem } from '../nav-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();

  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => this.canDisplay(item))
  );

  constructor(private readonly authFacade: AuthFacade) {}

  protected onNavigate() {
    this.navigate.emit();
  }

  private canDisplay(item: NavItem) {
    if (item.superUserOnly && !this.authFacade.isSuperUser()) {
      return false;
    }
    if (item.requiredPermission) {
      return hasPermissionOrSuperUser(this.authFacade, item.requiredPermission);
    }
    return true;
  }
}

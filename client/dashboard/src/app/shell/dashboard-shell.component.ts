import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SfButtonComponent } from '../shared/ui/sf-button/sf-button.component';
import { SfDrawerComponent } from '../shared/ui/sf-drawer/sf-drawer.component';

@Component({
  standalone: true,
  selector: 'dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, SfButtonComponent, SfDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardShellComponent {
  readonly drawerOpen = signal(false);

  toggleDrawer() {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }
}

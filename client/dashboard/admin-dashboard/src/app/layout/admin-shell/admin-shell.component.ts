import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminShellComponent implements OnInit {
  protected readonly isMobile = signal(false);
  protected readonly sidebarOpen = signal(true);

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 960px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.isMobile.set(state.matches);
        this.sidebarOpen.set(!state.matches);
      });
  }

  protected toggleSidebar() {
    this.sidebarOpen.update((open) => !open);
  }

  protected handleNavigation() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }
}

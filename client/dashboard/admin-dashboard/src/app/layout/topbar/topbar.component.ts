import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    protected readonly authFacade: AuthFacade,
    private readonly router: Router
  ) {}

  protected logout() {
    this.authFacade.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }

  protected emitToggle() {
    this.menuToggle.emit();
  }

  protected userInitial() {
    const email = this.authFacade.user()?.email;
    return email?.charAt(0).toUpperCase() ?? '?';
  }
}

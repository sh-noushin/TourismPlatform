import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate() {
    if (this.authFacade.isAuthenticated()) {
      return true;
    }
    return this.router.parseUrl('/login');
  }

  canActivateChild() {
    return this.canActivate();
  }
}
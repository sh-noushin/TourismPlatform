import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

import { AuthFacade } from './auth.facade';
import { isSuperUser } from './permission.util';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot) {
    const roles = this.authFacade.roles();
    const allowed = isSuperUser(roles) || roles.includes('Admin');
    if (allowed) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}
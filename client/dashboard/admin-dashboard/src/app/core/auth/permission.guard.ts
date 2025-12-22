import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AuthFacade } from './auth.facade';
import { hasPermissionOrSuperUser } from './permission.util';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot) {
    const requirement = route.data?.['permission'];
    if (!requirement || hasPermissionOrSuperUser(this.authFacade, requirement)) {
      return true;
    }
    return this.router.parseUrl('/admin');
  }
}
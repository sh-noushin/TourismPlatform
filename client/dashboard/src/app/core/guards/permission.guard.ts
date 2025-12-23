import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private readonly auth: AuthFacade, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required = route.data['permission'] as string | undefined;
    if (!required) return true;
    if (this.auth.isSuperUser()) return true;
    const ok = this.auth.permissions().has(required);
    if (!ok) this.router.navigate(['/']);
    return ok;
  }
}

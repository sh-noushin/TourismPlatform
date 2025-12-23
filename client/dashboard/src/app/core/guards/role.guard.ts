import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private readonly auth: AuthFacade, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required = route.data['roles'] as string[] | undefined;
    if (!required || required.length === 0) return true;
    const roles = this.auth.roles();
    const ok = required.some((r) => roles.has(r));
    if (!ok) this.router.navigate(['/']);
    return ok;
  }
}

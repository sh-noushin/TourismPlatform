import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { AuthService, AuthResponse } from './auth.service';
import { decodeJwt, extractPermissions, extractRoles, getExpiration, isSuperUser as hasSuperUserRole } from './jwt.util';
import { tokenStore } from './token.store';

export interface AuthUser {
  id?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly accessToken = signal<string | null>(tokenStore.getAccessToken());
  private readonly refreshToken = signal<string | null>(tokenStore.getRefreshToken());
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly rolesSignal = signal<string[]>([]);
  private readonly permissionsSignal = signal<string[]>([]);

  readonly user = computed(() => this.userSignal());
  readonly roles = computed(() => this.rolesSignal());
  readonly permissions = computed(() => this.permissionsSignal());
  readonly isAuthenticated = computed(() => Boolean(this.accessToken()));
  readonly isSuperUser = computed(() => hasSuperUserRole(this.rolesSignal()));

  getAccessToken(): string | null {
    return this.accessToken();
  }

  constructor(private readonly authService: AuthService) {
    this.hydrateFromAccessToken(this.accessToken());
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.authService.login(email, password).pipe(
      tap((tokens) => this.applyTokens(tokens))
    );
  }

  logout(): Observable<void> {
    const refresh = this.refreshToken();
    this.clearSession();
    if (!refresh) {
      return of(void 0);
    }
    return this.authService.logout(refresh);
  }

  logoutAll(): Observable<void> {
    this.clearSession();
    return this.authService.logoutAll();
  }

  refreshIfNeeded(): Observable<AuthResponse | null> {
    const refresh = this.refreshToken();
    if (!refresh) {
      return of(null);
    }

    const expiry = getExpiration(decodeJwt(this.accessToken()));
    if (expiry && expiry - Date.now() > 60_000) {
      return of(null);
    }

    return this.authService.refresh(refresh).pipe(
      tap((tokens) => this.applyTokens(tokens))
    );
  }

  private applyTokens(tokens: AuthResponse) {
    tokenStore.setTokens(tokens.accessToken, tokens.refreshToken);
    this.accessToken.set(tokens.accessToken);
    this.refreshToken.set(tokens.refreshToken);
    this.hydrateFromAccessToken(tokens.accessToken);
  }

  private hydrateFromAccessToken(token: string | null) {
    if (!token) {
      this.userSignal.set(null);
      this.rolesSignal.set([]);
      this.permissionsSignal.set([]);
      return;
    }

    const payload = decodeJwt(token);
    this.userSignal.set({
      id: payload?.sub,
      email: typeof payload?.email === 'string' ? payload.email : undefined
    });
    this.rolesSignal.set(extractRoles(payload));
    this.permissionsSignal.set(extractPermissions(payload));
  }

  private clearSession() {
    tokenStore.clear();
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.userSignal.set(null);
    this.rolesSignal.set([]);
    this.permissionsSignal.set([]);
  }
}

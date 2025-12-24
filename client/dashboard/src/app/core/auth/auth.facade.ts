import { Injectable, computed, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenStore } from './token.store';
import { decodeJwt, extractPermissions, extractRoles } from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());
  readonly userEmail = signal<string | null>(null);
  readonly roles = signal<Set<string>>(new Set());
  readonly permissions = signal<Set<string>>(new Set());
  readonly isSuperUser = computed(() => {
    const roles = this.roles();
    return roles.has('SuperUser') || roles.has('SuperAdmin') || roles.has('Admin');
  });

  constructor(private readonly authService: AuthService) {
    this.initFromStorage();
  }

  initFromStorage() {
    const a = TokenStore.getAccess();
    const r = TokenStore.getRefresh();
    this.accessToken.set(a);
    this.refreshToken.set(r);
    this.syncFromToken(a);
  }

  private syncFromToken(token: string | null) {
    if (!token) {
      this.userEmail.set(null);
      this.roles.set(new Set());
      this.permissions.set(new Set());
      return;
    }
    const payload = decodeJwt(token);
    this.userEmail.set(payload?.sub ?? payload?.email ?? null);
    this.roles.set(extractRoles(payload));
    this.permissions.set(extractPermissions(payload));
  }

  hasPermission(code: string) {
    return computed(() => this.isSuperUser() || this.permissions().has(code));
  }

  async login(email: string, password: string) {
    const resp = await this.authService.login(email, password);
    // Auth token shape depends on backend; attempt to read accessToken/refreshToken
    const access = (resp as any).accessToken ?? (resp as any).token ?? null;
    const refresh = (resp as any).refreshToken ?? null;
    TokenStore.setAccess(access);
    TokenStore.setRefresh(refresh);
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    this.syncFromToken(access);
    return resp;
  }

  async refresh() {
    const current = this.refreshToken();
    if (!current) throw new Error('No refresh token');
    const resp = await this.authService.refresh(current);
    const access = (resp as any).accessToken ?? (resp as any).token ?? null;
    const refresh = (resp as any).refreshToken ?? current;
    TokenStore.setAccess(access);
    TokenStore.setRefresh(refresh);
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
    this.syncFromToken(access);
    return resp;
  }

  async logout() {
    const refresh = this.refreshToken();
    try {
      await this.authService.logout(refresh ?? undefined);
    } catch {}
    TokenStore.clear();
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.syncFromToken(null);
  }
}

import { Injectable, computed, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TokenStore } from './token.store';
import { decodeJwt, extractPermissions, extractRoles } from './jwt.util';

type JwtPayload = Record<string, unknown> | null;

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  readonly accessToken = signal<string | null>(null);
  readonly refreshToken = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.accessToken());

  readonly userName = signal<string>('User');

  readonly userEmail = signal<string | null>(null);

  readonly roles = signal<Set<string>>(new Set());
  readonly permissions = signal<Set<string>>(new Set());

  readonly isSuperUser = computed(() => {
    const r = this.roles();
    return r.has('SuperUser') || r.has('SuperAdmin') || r.has('Admin');
  });

  constructor(private readonly authService: AuthService) {
    this.initFromStorage();
  }

  initFromStorage() {
    const access = TokenStore.getAccess();
    const refresh = TokenStore.getRefresh();

    this.accessToken.set(access);
    this.refreshToken.set(refresh);

    this.syncFromToken(access, null);
  }

  hasPermission(code: string) {
    return computed(() => this.isSuperUser() || this.permissions().has(code));
  }

  async login(identifier: string, password: string) {
    const resp = await this.authService.login(identifier, password);

    const access = (resp as any).accessToken ?? (resp as any).token ?? null;
    const refresh = (resp as any).refreshToken ?? null;

    TokenStore.setAccess(access);
    TokenStore.setRefresh(refresh);

    this.accessToken.set(access);
    this.refreshToken.set(refresh);

    this.syncFromToken(access, identifier);

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

    this.syncFromToken(access, null);

    return resp;
  }

  async logout() {
    const refresh = this.refreshToken();
    try {
      await this.authService.logout(refresh ?? undefined);
    } catch {}

    this.clearSession();
  }

  /**
   * Drops the session without talking to the server.
   *
   * The interceptor needs this: once a refresh has failed there is nothing to
   * log out with, and calling logout() there fired another request that 401'd,
   * which re-entered the interceptor and started the cycle again -- the reason
   * a stale tab sat on "syncing..." forever instead of returning to login.
   */
  clearSession() {
    TokenStore.clear();
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.resetUserContext();
  }

  private resetUserContext() {
    this.userName.set('User');
    this.userEmail.set(null);
    this.roles.set(new Set());
    this.permissions.set(new Set());
  }

  private syncFromToken(token: string | null, fallbackIdentifier: string | null) {
    if (!token) {
      this.resetUserContext();
      return;
    }

    const payload = decodeJwt(token) as JwtPayload;

    this.roles.set(extractRoles(payload as any));
    this.permissions.set(extractPermissions(payload as any));

    // "emailaddress" is the short name of the ASP.NET claim URI this API issues.
    const emailCandidate =
      this.firstString(payload, ['email', 'emailaddress', 'upn']) ??
      (this.firstString(payload, ['sub'])?.includes('@') ? this.firstString(payload, ['sub']) : null);

    this.userEmail.set(emailCandidate && emailCandidate.includes('@') ? emailCandidate : null);

    const nameCandidate =
      this.firstString(payload, [
        'preferred_username',
        'username',
        'unique_name',
        'name',
        'given_name',
      ]) ??
      this.firstString(payload, ['sub']) ??
      null;

    const finalName = this.normalizeUserName(nameCandidate, fallbackIdentifier, this.userEmail());
    this.userName.set(finalName);
  }

  /**
   * Reads a claim by short name, matching the long form too.
   *
   * ASP.NET Identity issues claims under their XML schema URIs
   * ("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"),
   * so looking only for "email" found nothing and every user displayed as the
   * literal fallback "User". Comparing the last path segment handles both.
   */
  private firstString(payload: JwtPayload, keys: string[]): string | null {
    if (!payload) return null;

    const wanted = keys.map(k => k.toLowerCase());

    for (const k of keys) {
      const v = payload[k];
      if (typeof v === 'string' && v.trim().length) return v.trim();
    }

    for (const [key, value] of Object.entries(payload)) {
      const shortName = key.split('/').pop()?.toLowerCase() ?? '';
      if (wanted.includes(shortName) && typeof value === 'string' && value.trim().length) {
        return value.trim();
      }
    }

    return null;
  }

  private normalizeUserName(tokenName: string | null, fallbackIdentifier: string | null, email: string | null): string {
    let raw = (tokenName ?? '').trim();
    if (!raw) raw = (fallbackIdentifier ?? '').trim();
    if (!raw && email) raw = email.trim();

    if (!raw) return 'User';

    if (raw.includes('@')) raw = raw.split('@')[0] ?? raw;

    // keep "superadmin" as-is; just clean separators
    raw = raw.replace(/[._-]+/g, ' ').trim();

    return raw || 'User';
  }
}

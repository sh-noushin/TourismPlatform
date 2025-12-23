export const ACCESS_TOKEN_KEY = 'dashboard_access_token';
export const REFRESH_TOKEN_KEY = 'dashboard_refresh_token';

export const TokenStore = {
  getAccess(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setAccess(token: string | null) {
    try {
      if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
      else localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {}
  },
  getRefresh(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setRefresh(token: string | null) {
    try {
      if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
      else localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  }
};

const ACCESS_TOKEN_KEY = 'tourism:access-token';
const REFRESH_TOKEN_KEY = 'tourism:refresh-token';

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const tokenStore = {
  getAccessToken(): string | null {
    const storage = getStorage();
    return storage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  },
  getRefreshToken(): string | null {
    const storage = getStorage();
    return storage?.getItem(REFRESH_TOKEN_KEY) ?? null;
  },
  setTokens(accessToken: string, refreshToken: string) {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear() {
    const storage = getStorage();
    storage?.removeItem(ACCESS_TOKEN_KEY);
    storage?.removeItem(REFRESH_TOKEN_KEY);
  }
};

export interface JwtPayload {
  sub?: string;
  email?: string;
  roles?: string | string[];
  perm?: string | string[];
  exp?: number;
  [key: string]: unknown;
}

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  const raw = atob(padded);
  try {
    return decodeURIComponent(
      raw
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
  } catch {
    return raw;
  }
};

export const decodeJwt = (token: string | null): JwtPayload | null => {
  if (!token) return null;
  const segments = token.split('.');
  if (segments.length < 2) return null;
  try {
    return JSON.parse(decodeBase64Url(segments[1]));
  } catch {
    return null;
  }
};

const ensureArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const normalizeClaimValue = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
};

export const extractRoles = (payload: JwtPayload | null): string[] => {
  if (!payload) return [];
  const claimKeys = [
    'roles',
    'role',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
  ];
  const rawRoles = claimKeys.flatMap((key) => normalizeClaimValue(payload[key]));
  return [...new Set(rawRoles)];
};

export const extractPermissions = (payload: JwtPayload | null): string[] => {
  const perms = payload?.perm;
  return ensureArray(perms).map(String);
};

export const getExpiration = (payload: JwtPayload | null): number | null => {
  if (!payload?.exp) return null;
  return payload.exp * 1000;
};

export const isSuperUser = (roles: string[]) => roles.includes('SuperUser');

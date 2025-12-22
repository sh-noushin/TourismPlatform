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

export const extractRoles = (payload: JwtPayload | null): string[] => {
  const roles = payload?.roles ?? (payload ? payload['role'] : undefined);
  if (!roles) return [];
  return Array.isArray(roles)
    ? (roles as string[])
    : [String(roles)];
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

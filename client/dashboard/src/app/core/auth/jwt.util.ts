function base64UrlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4;
  if (pad === 2) input += '==';
  else if (pad === 3) input += '=';
  try {
    return decodeURIComponent(
      atob(input)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return null;
  }
}

export function decodeJwt(token?: string | null): any | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = base64UrlDecode(parts[1]);
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function extractRoles(payload: any): Set<string> {
  if (!payload) return new Set();
  let roles: string[] | string | undefined = payload.roles ?? payload.role ?? payload['role'] ?? undefined;
  if (!roles) return new Set();
  if (typeof roles === 'string') roles = [roles];
  return new Set((roles as string[]).filter(Boolean));
}

export function extractPermissions(payload: any): Set<string> {
  if (!payload) return new Set();
  const perm = payload.perm ?? payload.permissions ?? payload.permission ?? [];
  if (!perm) return new Set();
  if (typeof perm === 'string') return new Set([perm]);
  return new Set((perm as string[]).filter(Boolean));
}

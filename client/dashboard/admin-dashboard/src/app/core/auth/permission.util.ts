import { AuthFacade } from './auth.facade';

export const hasPermission = (permissions: string[], required: string) => {
  if (!required) return false;
  return permissions.includes(required);
};

export const isSuperUser = (roles: string[]) => roles.includes('SuperUser');

export const hasPermissionOrSuperUser = (authFacade: AuthFacade, required: string | string[]) => {
  const availablePermissions = authFacade.permissions();
  const roles = authFacade.roles();
  if (isSuperUser(roles)) {
    return true;
  }
  const targets = Array.isArray(required) ? required : [required];
  return targets.some((permission) => hasPermission(availablePermissions, permission));
};
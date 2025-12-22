export interface NavItem {
  label: string;
  route: string;
  icon?: string;
  requiredPermission?: string;
  superUserOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', route: '', icon: 'dashboard' },
  { label: 'Houses', route: 'houses', icon: 'home', requiredPermission: 'houses.manage' },
  { label: 'Tours', route: 'tours', icon: 'travel_explore', requiredPermission: 'tours.manage' },
  { label: 'Users', route: 'users', icon: 'group', requiredPermission: 'users.manage', superUserOnly: true },
  { label: 'Permissions', route: 'permissions', icon: 'lock', superUserOnly: true }
];

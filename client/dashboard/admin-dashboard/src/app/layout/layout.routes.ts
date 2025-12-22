import { Routes } from '@angular/router';

import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AuthGuard } from '../core/auth/auth.guard';
import { RoleGuard } from '../core/auth/role.guard';
import { OverviewComponent } from './overview/overview.component';

export const layoutRoutes: Routes = [
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: '', component: OverviewComponent },
      {
        path: 'houses',
        loadChildren: () => import('../features/houses/houses.routes').then(m => m.routes)
      },
      {
        path: 'tours',
        loadChildren: () => import('../features/tours/tours.routes').then(m => m.routes)
      },
      {
        path: 'users',
        loadChildren: () => import('../features/users/users.routes').then(m => m.routes)
      },
      {
        path: 'permissions',
        loadChildren: () => import('../features/permissions/permissions.routes').then(m => m.routes)
      }
    ]
  }
];

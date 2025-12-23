import { Routes } from '@angular/router';
import { DashboardShellComponent } from './shell/dashboard-shell.component';
import { LoginPageComponent } from './pages/login/login-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      { path: '', redirectTo: 'houses', pathMatch: 'full' },
      { path: 'houses', loadComponent: () => import('./pages/houses/houses-page.component').then(m => m.HousesPageComponent) },
      { path: 'houses/new', loadComponent: () => import('./pages/houses/house-edit.component').then(m => m.HouseEditComponent) },
      { path: 'houses/:id/edit', loadComponent: () => import('./pages/houses/house-edit.component').then(m => m.HouseEditComponent) },
      { path: 'tours', loadComponent: () => import('./pages/tours/tours-page.component').then(m => m.ToursPageComponent) },
      { path: 'tours/new', loadComponent: () => import('./pages/tours/tour-edit.component').then(m => m.TourEditComponent) },
      { path: 'tours/:id/edit', loadComponent: () => import('./pages/tours/tour-edit.component').then(m => m.TourEditComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/users-page.component').then(m => m.UsersPageComponent) },
      { path: 'users/:id/edit', loadComponent: () => import('./pages/users/user-edit.component').then(m => m.UserEditComponent) },
      { path: 'permissions', loadComponent: () => import('./pages/permissions/permissions-page.component').then(m => m.PermissionsPageComponent) },
      { path: 'permissions/:id/edit', loadComponent: () => import('./pages/permissions/permission-edit.component').then(m => m.PermissionEditComponent) }
    ]
  }
];

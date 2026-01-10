import { Routes } from '@angular/router';
import { DashboardShellComponent } from './shell/dashboard-shell.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  {
    path: 'admin',
    component: DashboardShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'houses', pathMatch: 'full' },
      { path: 'houses', loadComponent: () => import('./pages/houses/houses-page.component').then(m => m.HousesPageComponent) },
      { path: 'houses/new', loadComponent: () => import('./pages/houses/house-edit.component').then(m => m.HouseEditComponent) },
      { path: 'houses/:id/edit', loadComponent: () => import('./pages/houses/house-edit.component').then(m => m.HouseEditComponent) },
      { path: 'house-types', loadComponent: () => import('./pages/house-types/house-types-page.component').then(m => m.HouseTypesPageComponent) },
      { path: 'tour-categories', loadComponent: () => import('./pages/tour-categories/tour-categories-page.component').then(m => m.TourCategoriesPageComponent) },
      { path: 'tours', loadComponent: () => import('./pages/tours/tours-page.component').then(m => m.ToursPageComponent) },
      { path: 'tours/new', loadComponent: () => import('./pages/tours/tour-edit.component').then(m => m.TourEditComponent) },
      { path: 'tours/:id/edit', loadComponent: () => import('./pages/tours/tour-edit.component').then(m => m.TourEditComponent) },
      { path: 'exchange', loadComponent: () => import('./pages/exchange/exchange-page.component').then(m => m.ExchangePageComponent) },
      { path: 'public-page/sections', loadComponent: () => import('./pages/public-page/public-sections-page.component').then(m => m.PublicSectionsPageComponent) },
      { path: 'public-page/ctas', loadComponent: () => import('./pages/public-page/public-ctas-page.component').then(m => m.PublicCtasPageComponent) },
      { path: 'public-page/contact-info', loadComponent: () => import('./pages/public-page/public-contact-info-page.component').then(m => m.PublicContactInfoPageComponent) },
      { path: 'public-page/learn-more', loadComponent: () => import('./pages/public-page/public-learn-more-page.component').then(m => m.PublicLearnMorePageComponent) },
      { path: 'roles', loadComponent: () => import('./pages/roles/roles-page.component').then(m => m.RolesPageComponent) },
      { path: 'users', loadComponent: () => import('./pages/users/users-page.component').then(m => m.UsersPageComponent) },
      { path: 'users/new', loadComponent: () => import('./pages/users/user-edit.component').then(m => m.UserEditComponent) },
      { path: 'users/:id/edit', loadComponent: () => import('./pages/users/user-edit.component').then(m => m.UserEditComponent) },
      { path: 'permissions', loadComponent: () => import('./pages/permissions/permissions-page.component').then(m => m.PermissionsPageComponent) },
      { path: 'permissions/new', loadComponent: () => import('./pages/permissions/permission-edit.component').then(m => m.PermissionEditComponent) },
      { path: 'permissions/:id/edit', loadComponent: () => import('./pages/permissions/permission-edit.component').then(m => m.PermissionEditComponent) },
      { path: 'claims', loadComponent: () => import('./pages/claims/claims-page.component').then(m => m.ClaimsPageComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

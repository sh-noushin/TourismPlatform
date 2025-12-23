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
      { path: 'tours', loadComponent: () => import('./pages/tours/tours-page.component').then(m => m.ToursPageComponent) }
    ]
  }
];

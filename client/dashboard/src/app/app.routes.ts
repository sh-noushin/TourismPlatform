import { Routes } from '@angular/router';
import { DashboardShellComponent } from './shell/dashboard-shell.component';
import { HousesPageComponent } from './pages/houses/houses-page.component';
import { ToursPageComponent } from './pages/tours/tours-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  {
    path: '',
    component: DashboardShellComponent,
    children: [
      { path: '', redirectTo: 'houses', pathMatch: 'full' },
      { path: 'houses', component: HousesPageComponent },
      { path: 'tours', component: ToursPageComponent }
    ]
  }
];

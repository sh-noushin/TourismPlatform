import { Routes } from '@angular/router';

import { layoutRoutes } from './layout/layout.routes';

export const routes: Routes = [
  ...layoutRoutes,
  { path: '', pathMatch: 'full', redirectTo: 'admin' },
  { path: '**', redirectTo: 'admin' }
];

import { Routes } from '@angular/router';

import { AdminShellComponent } from './admin-shell/admin-shell.component';

export const layoutRoutes: Routes = [
  {
    path: 'admin',
    component: AdminShellComponent,
    children: []
  }
];

import { inject } from '@angular/core';
import { Routes, CanActivateFn, Router } from '@angular/router';

import { layoutRoutes } from './layout/layout.routes';
import { AuthFacade } from './core/auth/auth.facade';

const startGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  return router.parseUrl(auth.isAuthenticated() ? '/admin' : '/login');
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [startGuard], children: [] },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
  },
  ...layoutRoutes,
  { path: '**', redirectTo: '' }
];

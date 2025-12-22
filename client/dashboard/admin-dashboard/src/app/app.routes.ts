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
  // Auth feature routes (e.g., /login)
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
  },
  // Admin shell and children
  ...layoutRoutes,
  // Conditional start redirect
  { path: '', pathMatch: 'full', canActivate: [startGuard], children: [] },
  // Fallback
  { path: '**', redirectTo: '' }
];

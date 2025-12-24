import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_BASE_URL, Client } from './api/client';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { RefreshInterceptor } from './core/interceptors/refresh.interceptor';
import { CorrelationIdInterceptor } from './core/interceptors/correlation-id.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { RouteReuseStrategy } from '@angular/router';
import { TabRouteReuseStrategy } from './core/tab/route-reuse.strategy';

const rawDashboardApiBase = (globalThis as any).__DASHBOARD_API_BASE_URL ?? 'https://localhost:7110/';
const dashboardApiBase = rawDashboardApiBase.replace(/\/+$/, ''); // avoid double slashes when building API URLs

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // HTTP interceptors: correlation id -> auth header -> refresh/retry -> error normalization
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: TabRouteReuseStrategy },
    {
      provide: API_BASE_URL,
      useValue: dashboardApiBase
    },
    Client
  ]
};

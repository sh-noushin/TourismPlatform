import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
  withXhr
} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

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

// Bump when translation files change. The JSON filenames are stable, so this is
// what forces a cached copy to be replaced.
const TRANSLATIONS_VERSION = '13';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en'
      })
    ),
    // The suffix carries a build stamp so a new deployment always fetches fresh
    // translations. Without it the filenames never change: a browser that
    // cached a copy before the no-cache header existed keeps serving it to the
    // XHR (a hard reload does not cover later XHRs), and any key added since
    // then silently falls back to the default language.
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: `.json?v=${TRANSLATIONS_VERSION}`
    }),
    // Order matters, and it is the reverse of how it reads: a response travels
    // back through the interceptors bottom-up, so the LAST one registered sees
    // the error first. ErrorInterceptor used to sit last and normalised every
    // HttpErrorResponse into a plain object before RefreshInterceptor saw it --
    // so `err instanceof HttpErrorResponse` was false there, no refresh was
    // ever attempted, and an expired token surfaced as a raw 401 toast.
    // Refresh must be the innermost: it gets first sight of the 401, retries,
    // and only a genuine failure reaches the error normaliser above it.
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: TabRouteReuseStrategy },
    {
      provide: API_BASE_URL,
      useValue: dashboardApiBase
    },
    Client
  ]
};

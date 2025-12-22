import { Provider } from '@angular/core';

import { API_BASE_URL } from './config/env.tokens';
import { appConfigProvider } from './config/app-config';
import { CorrelationIdInterceptor } from './http/correlation-id.interceptor';
import { ErrorInterceptor } from './http/error.interceptor';
import { RefreshInterceptor } from './http/refresh.interceptor';
import { AuthInterceptor } from './http/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const coreProviders: Provider[] = [
  { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  appConfigProvider,
  { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
];

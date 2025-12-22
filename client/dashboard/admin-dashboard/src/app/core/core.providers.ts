import { Provider } from '@angular/core';

import { API_BASE_URL } from './config/env.tokens';
import { appConfigProvider } from './config/app-config';
import { environment } from '../../environments/environment';

export const coreProviders: Provider[] = [
  { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  appConfigProvider
];

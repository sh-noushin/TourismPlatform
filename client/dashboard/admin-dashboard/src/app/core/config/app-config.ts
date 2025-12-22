import { inject, InjectionToken, Provider } from '@angular/core';

import { API_BASE_URL } from './env.tokens';

export interface AppConfig {
  apiBaseUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const appConfigProvider: Provider = {
  provide: APP_CONFIG,
  useFactory: () => ({ apiBaseUrl: inject(API_BASE_URL) })
};

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfig, APP_CONFIG } from '../config/app-config';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) private readonly config: AppConfig
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/api/auth/login`, {
      email,
      password
    });
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/api/auth/refresh`, {
      refreshToken
    });
  }

  logout(refreshToken: string | null): Observable<void> {
    return this.http.post<void>(`${this.config.apiBaseUrl}/api/auth/logout`, {
      refreshToken
    });
  }

  logoutAll(): Observable<void> {
    return this.http.post<void>(`${this.config.apiBaseUrl}/api/auth/logout-all`, {});
  }
}

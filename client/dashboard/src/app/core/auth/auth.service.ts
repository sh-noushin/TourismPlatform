import { Injectable } from '@angular/core';
import { Client, LoginRequest, LoginResponse, RefreshRequest } from '../../api/client';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly client: Client) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const req: LoginRequest = { email, password } as any;
    return firstValueFrom(this.client.login(req));
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const req: RefreshRequest = { refreshToken } as any;
    return firstValueFrom(this.client.refresh(req));
  }

  async logout(refreshToken?: string): Promise<void> {
    const body = { refreshToken } as any;
    return firstValueFrom(this.client.logout(body));
  }
}

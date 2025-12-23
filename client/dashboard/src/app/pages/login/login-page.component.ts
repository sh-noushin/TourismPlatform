import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';

@Component({
  standalone: true,
  selector: 'app-login-page',
  template: `
  <div class="login-shell">
    <h2>Sign in</h2>
    <form (submit)="onSubmit($event)">
      <label>
        Email
        <input type="email" [value]="email()" (input)="email.set($any($event.target).value)" required />
      </label>
      <label>
        Password
        <input type="password" [value]="password()" (input)="password.set($any($event.target).value)" required />
      </label>
      <button type="submit" [disabled]="loading()">Sign in</button>
      @if (error) {
        <div class="error">{{ error }}</div>
      }
    </form>
  </div>
  `
})
export class LoginPageComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  error: string | null = null;

  constructor(private readonly auth: AuthFacade, private readonly router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading.set(true);
    this.error = null;
    try {
      await this.auth.login(this.email(), this.password());
      // after login go to root/dashboard
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.error = err?.message ?? 'Login failed';
    } finally {
      this.loading.set(false);
    }
  }
}

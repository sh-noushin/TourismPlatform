import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { TabService } from '../../core/tab/tab.service';

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
  private returnUrl: string | null = null;

  constructor(private readonly auth: AuthFacade, private readonly router: Router, private readonly route: ActivatedRoute, private readonly tabs: TabService) {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;
  }

  get formValid() {
    return this.email().length > 3 && this.password().length >= 6;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.formValid) {
      this.error = 'Please provide a valid email and password (min 6 chars).';
      return;
    }
    this.loading.set(true);
    this.error = null;
    try {
      await this.auth.login(this.email(), this.password());
      // after login go to returnUrl or default admin landing
      const navTo = this.returnUrl ?? '/admin/houses';
      await this.router.navigateByUrl(navTo);
      // open pinned tab for the houses landing
      try {
        this.tabs.openOrActivate(navTo, 'Houses', true);
      } catch {}
    } catch (err: any) {
      this.error = err?.message ?? 'Login failed';
    } finally {
      this.loading.set(false);
    }
  }
}

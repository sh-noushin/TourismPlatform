import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { TabService } from '../../core/tab/tab.service';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'app-login-page',
  template: `
  <section class="login-page">
    <div class="login-page__glow"></div>
    <div class="login-page__grid">
      <sf-card class="login-page__form-card">
        <div class="login-page__brand">
          <span class="login-page__brand-mark"></span>
          <div>
            <p class="login-page__brand-label">ThriveStudios</p>
            <p class="login-page__brand-note">Admin console</p>
          </div>
        </div>
        <h1>Login</h1>
        <form class="login-form" (submit)="onSubmit($event)">
          <label class="login-form__field">
            <span>Email</span>
            <input
              type="email"
              [value]="email()"
              (input)="email.set($any($event.target).value)"
              autocomplete="username"
              required
            />
          </label>
          <label class="login-form__field">
            <span>Password</span>
            <input
              type="password"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              autocomplete="current-password"
              required
            />
          </label>
          <div class="login-form__actions">
            <sf-button variant="primary" [loading]="loading()" buttonType="submit">Login</sf-button>
            <button type="button" class="login-form__forgot" (click)="onForgot()">Forgot password?</button>
          </div>
        </form>
        @if (error()) {
          <p class="login-form__error">{{ error() }}</p>
        }
      </sf-card>

      
    </div>
  </section>
  `,
  styleUrls: ['./login-page.component.scss'],
  imports: [SfCardComponent, SfButtonComponent]
})
export class LoginPageComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
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
      this.error.set('Please provide a valid email and password (min 6 chars).');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
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
      this.error.set(err?.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }

  onForgot() {
    this.error.set('Please contact support to reset your password.');
  }
}

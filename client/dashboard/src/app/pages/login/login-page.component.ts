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
        <div class="card-icon">
          <div class="card-icon__inner">🔒</div>
        </div>
        <div class="login-page__brand">
          <div>
            <p class="login-page__brand-label">Login</p>
          </div>
        </div>

        <form class="login-form" (submit)="onSubmit($event)">
          <label class="login-form__field">
              <span>Email *</span>
            <input
              type="email"
              placeholder="Enter your Email"
              [value]="email()"
              (input)="email.set($any($event.target).value)"
              autocomplete="email"
              required
            />
          </label>

          <label class="login-form__field">
              <span>Password *</span>
            <input
              type="password"
              placeholder="Enter your Password"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              autocomplete="current-password"
              required
            />
          </label>

          <label class="login-form__field checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          <div class="login-form__actions">
            <sf-button class="login-btn" variant="primary" [loading]="loading()" buttonType="button">LOGIN</sf-button>
          </div>

          <div class="login-form__links">
            <a class="left-link">Don't have an account?</a>
            <a class="right-link" (click)="onForgot()">Forgot password?</a>
          </div>

          <p *ngIf="error()" class="login-form__error">{{ error() }}</p>


        </form>
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
      const navTo = this.returnUrl ?? '/admin';
      await this.router.navigateByUrl(navTo);
      try {
        this.tabs.openOrActivate(navTo, 'Dashboard', true);
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

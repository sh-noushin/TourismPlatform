import { Component, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { TabService } from '../../core/tab/tab.service';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [SfButtonComponent],
  template: `
  <section class="login-shell">
    <div class="login-card">
     <div class="avatar" aria-hidden="true">
  <svg class="avatar__svg" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.2"></circle>
    <path d="M4.5 20c1.8-4.2 13.2-4.2 15 0"></path>
  </svg>
</div>


      <form class="login-form" (submit)="onSubmit($event)">
        <div class="field">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5C20 16 16.42 14 12 14Z"
              />
            </svg>
          </span>

          <input
            type="email"
            name="username"
            autocomplete="username"
            placeholder="Username"
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            required
          />
        </div>

        <div class="field">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4Z"
              />
            </svg>
          </span>

          <input
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="Password"
            [value]="password()"
            (input)="password.set($any($event.target).value)"
            required
          />
        </div>

        <div class="row">
             <a class="forgot" href="#" (click)="onForgot($event)">Forgot Password?</a>
        </div>

        <sf-button
          class="login-btn"
          type="submit"
          text="LOGIN"
          height="54px"
          width="100%"
          color="#7b8b9b"
          textColor="#ffffff"
          [loading]="loading()"
          [disabled]="!formValid() || loading()"
        ></sf-button>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
      </form>
    </div>
  </section>
  `,
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly rememberMe = signal(false);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly formValid = computed(() => this.email().includes('@') && this.password().length >= 6);

  private returnUrl: string | null = null;

  constructor(
    private readonly auth: AuthFacade,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly tabs: TabService
  ) {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (!this.formValid()) {
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

  onForgot(e: Event) {
    e.preventDefault();
    this.error.set('Please contact support to reset your password.');
  }
}

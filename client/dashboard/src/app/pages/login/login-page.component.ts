import { Component, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { TabService } from '../../core/tab/tab.service';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [SfButtonComponent, TranslateModule],
  templateUrl: './login-page.component.html',
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
    private readonly tabs: TabService,
    private readonly translate: TranslateService
  ) {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (!this.formValid()) {
      this.error.set(this.translate.instant('LOGIN_PAGE.ERROR_INVALID'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.login(this.email(), this.password());

      const navTo = this.returnUrl ?? '/admin';
      await this.router.navigateByUrl(navTo);

    } catch (err: any) {
      this.error.set(err?.message ?? this.translate.instant('LOGIN_PAGE.ERROR_LOGIN_FAILED'));
    } finally {
      this.loading.set(false);
    }
  }

  onForgot(e: Event) {
    e.preventDefault();
    this.error.set(this.translate.instant('LOGIN_PAGE.ERROR_CONTACT_SUPPORT'));
  }
}

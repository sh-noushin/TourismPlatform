import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AuthFacade } from '../../core/auth/auth.facade';
import { TabService } from '../../core/tab/tab.service';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [SfButtonComponent, TranslateModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnDestroy {
  readonly email = signal('');
  readonly password = signal('');
  readonly rememberMe = signal(false);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly formValid = computed(() => this.email().includes('@') && this.password().length >= 6);

  readonly langMenuOpen = signal(false);

  // store whatever translate emits, normalize it for UI + direction
  readonly currentLangRaw = signal<string>('fa');
  readonly langKey = computed<'en' | 'fa'>(() => this.normalizeLang(this.currentLangRaw()));

  private returnUrl: string | null = null;
  private readonly langSub: Subscription;

  constructor(
    private readonly auth: AuthFacade,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly tabs: TabService,
    private readonly translate: TranslateService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;

    const initial = this.pickInitialLang();
    this.currentLangRaw.set(initial);
    this.translate.use(initial);
    this.applyDir(initial);
    this.persistLang(initial);

    this.langSub = this.translate.onLangChange.subscribe(({ lang }) => {
      const normalized = this.normalizeLang(lang);
      this.currentLangRaw.set(normalized);
      this.applyDir(normalized);
      this.persistLang(normalized);
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
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

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.langMenuOpen.update(v => !v);
  }

  setLang(lang: 'en' | 'fa') {
    const normalized = this.normalizeLang(lang);
    this.translate.use(normalized);
    this.currentLangRaw.set(normalized);
    this.applyDir(normalized);
    this.persistLang(normalized);
    this.langMenuOpen.set(false);
  }

  private applyDir(lang: 'en' | 'fa') {
    const dir = lang === 'fa' ? 'rtl' : 'ltr';
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
    this.document.body?.setAttribute('dir', dir);
  }

  private persistLang(lang: 'en' | 'fa') {
    try {
      localStorage.setItem('lang', lang);
    } catch {}
  }

  private pickInitialLang(): 'en' | 'fa' {
    const stored = this.safeReadLocalStorage('lang');
    if (stored) return this.normalizeLang(stored);

    const current = this.translate.currentLang;
    if (current) return this.normalizeLang(current);

    const def = this.translate.getDefaultLang?.();
    if (def) return this.normalizeLang(def);

    const browser = this.translate.getBrowserLang?.();
    if (browser) return this.normalizeLang(browser);

    return 'fa';
  }

  private safeReadLocalStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private normalizeLang(value: unknown): 'en' | 'fa' {
    const v = String(value ?? '').trim().toLowerCase();
    if (v.startsWith('fa')) return 'fa';
    if (v.startsWith('en')) return 'en';
    return 'fa';
  }
}

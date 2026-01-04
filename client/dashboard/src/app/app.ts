import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SfToastContainerComponent } from './shared/ui/toast/sf-toast-container.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, SfToastContainerComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('dashboard');
  readonly currentLang = signal<'en' | 'fa'>('fa');
  readonly langMenuOpen = signal(false);

  constructor(private readonly translate: TranslateService) {
    translate.addLangs(['en', 'fa']);
    // Default to Farsi
    translate.setDefaultLang('fa');
    translate.use('fa');
    this.currentLang.set('fa');
    this.updateDirection('fa');

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.langMenuOpen() && !(e.target as HTMLElement).closest('.lang-selector')) {
        this.langMenuOpen.set(false);
      }
    });
  }

  setLang(lang: 'en' | 'fa') {
    this.translate.use(lang);
    this.currentLang.set(lang);
    this.updateDirection(lang);
    this.langMenuOpen.set(false);
  }

  private updateDirection(lang: 'en' | 'fa') {
    const dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.body?.setAttribute('dir', dir);
  }

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.langMenuOpen.set(!this.langMenuOpen());
  }
}

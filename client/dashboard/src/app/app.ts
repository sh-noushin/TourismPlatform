import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SfToastContainerComponent } from './shared/ui/toast/sf-toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SfToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('dashboard');

  constructor(translate: TranslateService) {
    translate.addLangs(['en', 'fa']);
    translate.setDefaultLang('en');
    const browser = translate.getBrowserLang() ?? 'en';
    const normalized = browser?.toLowerCase().startsWith('fa') ? 'fa' : 'en';
    translate.use(normalized);
  }
}

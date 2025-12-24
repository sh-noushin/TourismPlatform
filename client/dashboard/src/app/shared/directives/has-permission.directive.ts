import { Directive, Input, TemplateRef, ViewContainerRef, effect, signal } from '@angular/core';
import { AuthFacade } from '../../core/auth/auth.facade';

@Directive({
  selector: '[has-permission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly code = signal<string>('');
  private hasView = false;

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef, private auth: AuthFacade) {
    effect(() => {
      const code = this.code();
      if (!code) {
        if (this.hasView) {
          this.vcr.clear();
          this.hasView = false;
        }
        return;
      }

      const allowed = this.auth.isSuperUser() || this.auth.permissions().has(code);
      if (allowed && !this.hasView) {
        this.vcr.createEmbeddedView(this.tpl);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.vcr.clear();
        this.hasView = false;
      }
    });
  }

  @Input('has-permission') set hasPermission(code: string) {
    this.code.set(code);
  }
}

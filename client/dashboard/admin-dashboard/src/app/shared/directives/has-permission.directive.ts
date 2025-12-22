import { Directive, Input, TemplateRef, ViewContainerRef, effect, signal } from '@angular/core';

import { AuthFacade } from '../../core/auth/auth.facade';
import { hasPermissionOrSuperUser } from '../../core/auth/permission.util';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private readonly requirement = signal<string[]>([]);
  private hasView = false;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly authFacade: AuthFacade
  ) {
    effect(() => {
      const required = this.requirement();
      const allowed = required.length > 0 && hasPermissionOrSuperUser(this.authFacade, required);
      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
        return;
      }
      if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  @Input() set appHasPermission(value: string | string[]) {
    const normalized = Array.isArray(value) ? value : [value];
    this.requirement.set(normalized.filter(Boolean));
  }
}
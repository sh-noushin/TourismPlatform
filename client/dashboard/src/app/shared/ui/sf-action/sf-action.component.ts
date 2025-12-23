import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  standalone: true,
  selector: 'sf-action',
  template: `
    @if (permission) {
      <ng-container [has-permission]="permission">
        <button type="button" class="sf-action-button" (click)="onClick()" [disabled]="disabled">{{ label }}</button>
      </ng-container>
    } @else {
      <button type="button" class="sf-action-button" (click)="onClick()" [disabled]="disabled">{{ label }}</button>
    }
  `,
  imports: [CommonModule, HasPermissionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfActionComponent {
  @Input() label = '';
  @Input() permission?: string;
  @Input() disabled = false;
  @Output() actionClick = new EventEmitter<void>();

  onClick() {
    this.actionClick.emit();
  }
}

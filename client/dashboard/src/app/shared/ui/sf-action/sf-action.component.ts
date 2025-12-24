import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  standalone: true,
  selector: 'sf-action',
  template: `
    @if (permission) {
      <ng-container [has-permission]="permission">
        <button
          type="button"
          class="sf-action-button"
          [ngClass]="variantClass"
          [attr.title]="label || variant"
          (click)="onClick()"
          [disabled]="disabled"
        >
          <span class="icon" [innerHTML]="iconSvg" aria-hidden="true"></span>
        </button>
      </ng-container>
    } @else {
      <button
        type="button"
        class="sf-action-button"
        [ngClass]="variantClass"
        [attr.title]="label || variant"
        (click)="onClick()"
        [disabled]="disabled"
      >
        <span class="icon" [innerHTML]="iconSvg" aria-hidden="true"></span>
      </button>
    }
  `,
  imports: [CommonModule, HasPermissionDirective],
  styleUrls: ['./sf-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfActionComponent {
  @Input() label = '';
  @Input() permission?: string;
  @Input() disabled = false;
  @Input() icon = '';
  @Input() variant: 'edit' | 'delete' | 'default' = 'default';
  @Output() actionClick = new EventEmitter<void>();

  get variantClass() {
    return {
      'sf-action--edit': this.variant === 'edit',
      'sf-action--delete': this.variant === 'delete'
    };
  }

  get iconSvg() {
    if (this.variant === 'edit') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>`;
    }
    if (this.variant === 'delete') {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M9 10v7"/><path d="M15 10v7"/><path d="M5 6l1 14h12l1-14"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
    </svg>`;
  }

  onClick() {
    this.actionClick.emit();
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
          mat-icon-button
          [ngClass]="variantClass"
          [attr.title]="label || variant"
          [attr.aria-label]="label || variant"
          (click)="onClick()"
          [color]="buttonColor"
          [disabled]="disabled"
        >
          <mat-icon>{{ icon || iconName }}</mat-icon>
        </button>
      </ng-container>
    } @else {
      <button
        type="button"
        class="sf-action-button"
        mat-icon-button
        [ngClass]="variantClass"
        [attr.title]="label || variant"
        [attr.aria-label]="label || variant"
        (click)="onClick()"
        [color]="buttonColor"
        [disabled]="disabled"
      >
        <mat-icon>{{ icon || iconName }}</mat-icon>
      </button>
    }
  `,
  imports: [CommonModule, MatButtonModule, MatIconModule, HasPermissionDirective],
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

  get iconName() {
    if (this.variant === 'edit') {
      return 'edit';
    }
    if (this.variant === 'delete') {
      return 'delete';
    }
    return 'more_horiz';
  }

  get buttonColor(): 'primary' | 'warn' | undefined {
    if (this.variant === 'edit') {
      return 'primary';
    }
    if (this.variant === 'delete') {
      return 'warn';
    }
    return undefined;
  }

  onClick() {
    this.actionClick.emit();
  }
}

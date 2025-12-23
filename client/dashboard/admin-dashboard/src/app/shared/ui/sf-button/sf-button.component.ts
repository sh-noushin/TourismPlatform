import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type SfButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type SfButtonSize = 'sm' | 'md' | 'lg';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'sf-button',
  templateUrl: './sf-button.component.html',
  styleUrl: './sf-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: SfButtonVariant = 'primary';
  @Input() size: SfButtonSize = 'md';
  @Input() loading = false;
  @Input() disabled = false;

  @HostBinding('class')
  get hostClass() {
    const states = [
      'sf-button-host',
      `sf-button-host--${this.variant}`,
      `sf-button-host--${this.size}`
    ];
    if (this.loading) {
      states.push('sf-button-host--loading');
    }
    return states.join(' ');
  }

  @HostBinding('attr.aria-busy')
  get ariaBusy() {
    return this.loading ? 'true' : null;
  }

  get isDisabled() {
    return this.disabled || this.loading;
  }
}

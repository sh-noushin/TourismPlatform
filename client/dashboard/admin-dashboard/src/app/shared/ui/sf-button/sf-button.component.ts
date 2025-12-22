import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

type SfButtonVariant = 'solid' | 'outline' | 'ghost';
type SfButtonSize = 'sm' | 'md';

@Component({
  standalone: true,
  selector: 'sf-button',
  templateUrl: './sf-button.component.html',
  styleUrl: './sf-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: SfButtonVariant = 'solid';
  @Input() size: SfButtonSize = 'md';
  @Input() disabled = false;

  @HostBinding('class')
  get hostClass() {
    return `sf-button-host sf-button-host--${this.variant} sf-button-host--${this.size}`;
  }
}

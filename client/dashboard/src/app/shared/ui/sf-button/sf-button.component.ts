import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { signal } from '@angular/core';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  standalone: true,
  selector: 'sf-button',
  templateUrl: './sf-button.component.html',
  styleUrls: ['./sf-button.component.scss'],
  imports: [MatButtonModule, MatProgressSpinnerModule, HasPermissionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfButtonComponent {
  @Input() text?: string;
  @Input() color = '#2f80ed';
  @Input() textColor = '#ffffff';
  @Input() width?: string;
  @Input() height?: string;
  @Input() permission?: string;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';

  readonly loadingSignal = signal(false);
  readonly disabledSignal = signal(false);

  @Input()
  set loading(value: boolean) {
    this.loadingSignal.set(value);
  }

  @Input()
  set disabled(value: boolean) {
    this.disabledSignal.set(value);
  }

  get isLoading() {
    return this.loadingSignal();
  }

  get isDisabled() {
    return this.disabledSignal() || this.loadingSignal();
  }
}

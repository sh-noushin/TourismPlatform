import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sf-button',
  templateUrl: './sf-button.component.html',
  styleUrls: ['./sf-button.component.scss'],
  imports: [MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'outline' = 'primary';

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

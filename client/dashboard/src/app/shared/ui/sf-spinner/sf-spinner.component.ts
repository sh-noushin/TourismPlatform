import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sf-spinner',
  templateUrl: './sf-spinner.component.html',
  styleUrls: ['./sf-spinner.component.scss'],
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfSpinnerComponent {
  readonly diameterSignal = signal(40);

  @Input()
  set size(value: number | string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.diameterSignal.set(parsed);
  }
}

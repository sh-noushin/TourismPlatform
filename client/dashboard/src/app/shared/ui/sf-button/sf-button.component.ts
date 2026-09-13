import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'sf-button',
  templateUrl: './sf-button.component.html',
  styleUrls: ['./sf-button.component.scss'],
  imports: [MatButtonModule, MatProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SfButtonComponent {
  readonly buttonClick = output<MouseEvent>();
  readonly lastClick = signal<MouseEvent | null>(null);

  handleClick(e: MouseEvent) {
    this.lastClick.set(e);
    this.buttonClick.emit(e);
  }

  readonly text = input<string>('');
  // Defaults point at the design tokens rather than a literal hex, so a palette
  // change reaches every button that does not override them.
  readonly color = input<string>('var(--color-primary)');
  readonly textColor = input<string>('var(--color-text-on-accent)');
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly type = input<'button' | 'submit' | 'reset'>('button');
}

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
  // signal-style output
  readonly buttonClick = output<MouseEvent>();

  
  handleClick(e: MouseEvent) {
    this.buttonClick.emit(e);
  }

  readonly text = input<string>('');
  readonly color = input<string>('#2f80ed');
  readonly textColor = input<string>('#ffffff');
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
}

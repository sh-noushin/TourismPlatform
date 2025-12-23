import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-dialog',
  imports: [CommonModule],
  templateUrl: './sf-dialog.component.html',
  styleUrl: './sf-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfDialogComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}

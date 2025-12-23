import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-page-header',
  imports: [CommonModule],
  templateUrl: './sf-page-header.component.html',
  styleUrl: './sf-page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfPageHeaderComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}

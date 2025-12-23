import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-page-header',
  templateUrl: './sf-page-header.component.html',
  styleUrls: ['./sf-page-header.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfPageHeaderComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
}

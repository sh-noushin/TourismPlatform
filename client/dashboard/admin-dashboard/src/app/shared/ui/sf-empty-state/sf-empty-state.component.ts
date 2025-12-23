import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-empty-state',
  imports: [CommonModule],
  templateUrl: './sf-empty-state.component.html',
  styleUrl: './sf-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfEmptyStateComponent {
  @Input() title = 'No results yet';
  @Input() description?: string;
  @Input() icon?: string;
}

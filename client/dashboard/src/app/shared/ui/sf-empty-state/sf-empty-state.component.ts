import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'sf-empty-state',
  templateUrl: './sf-empty-state.component.html',
  styleUrls: ['./sf-empty-state.component.scss'],
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfEmptyStateComponent {
  @Input() title = 'No records yet';
  @Input() description?: string;
  @Input() icon = 'inbox';
}

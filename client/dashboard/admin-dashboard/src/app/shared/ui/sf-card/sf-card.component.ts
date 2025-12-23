import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-card',
  imports: [CommonModule],
  templateUrl: './sf-card.component.html',
  styleUrl: './sf-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfCardComponent {}

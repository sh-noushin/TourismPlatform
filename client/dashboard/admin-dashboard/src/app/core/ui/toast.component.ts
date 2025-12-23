import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  selector: 'sf-toast',
  imports: [CommonModule, SfButtonComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  constructor(public readonly toast: ToastService) {}
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  selector: 'sf-toast-container',
  templateUrl: './sf-toast-container.component.html',
  styleUrls: ['./sf-toast-container.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfToastContainerComponent {
  constructor(public readonly toastService: ToastService) {}

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }
}

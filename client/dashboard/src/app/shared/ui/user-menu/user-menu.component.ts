import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'user-menu',
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuComponent {
  @Input() name = 'User';
  @Input() role = 'Operator';
  @Input() initials = 'U';
  @Output() changePassword = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  readonly open = signal(false);

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.open.update((v) => !v);
  }

  onChangePassword(event: MouseEvent) {
    event.stopPropagation();
    this.changePassword.emit();
    this.open.set(false);
  }

  onLogout(event: MouseEvent) {
    event.stopPropagation();
    this.logout.emit();
    this.open.set(false);
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    this.open.set(false);
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sf-drawer',
  templateUrl: './sf-drawer.component.html',
  styleUrls: ['./sf-drawer.component.scss'],
  imports: [MatSidenavModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfDrawerComponent {
  readonly openSignal = signal(false);

  @Input()
  set open(value: boolean) {
    this.openSignal.set(value);
  }

  @Output() openChange = new EventEmitter<boolean>();

  onOpenedChange(value: boolean) {
    this.openSignal.set(value);
    this.openChange.emit(value);
  }
}

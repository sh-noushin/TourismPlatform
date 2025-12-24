import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'sf-searchbar',
  templateUrl: './sf-searchbar.component.html',
  styleUrls: ['./sf-searchbar.component.scss'],
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfSearchbarComponent implements OnDestroy {
  @Input() placeholder = 'Search';
  @Input() debounceTime = 250;

  @Output() valueChange = new EventEmitter<string>();

  readonly valueSignal = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  onInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const value = target?.value ?? '';
    this.valueSignal.set(value);
    this.scheduleEmit(value);
  }

  clear() {
    this.valueSignal.set('');
    this.emitValue('');
  }

  ngOnDestroy() {
    this.timer && clearTimeout(this.timer);
  }

  private scheduleEmit(value: string) {
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => this.emitValue(value), this.debounceTime);
  }

  private emitValue(value: string) {
    this.valueChange.emit(value.trim());
  }
}

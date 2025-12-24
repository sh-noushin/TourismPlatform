import { ChangeDetectionStrategy, Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { input, output, signal } from '@angular/core';

export interface SfDropdownItem {
  label: string;
  value: string;
  hint?: string;
}

@Component({
  standalone: true,
  selector: 'sf-dropdown',
  templateUrl: './sf-dropdown.component.html',
  styleUrls: ['./sf-dropdown.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfDropdownComponent {
  readonly items = input<SfDropdownItem[]>([]);
  readonly value = input<string | null>(null);
  readonly placeholder = input<string>('Select');
  readonly disabled = input<boolean>(false);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  readonly selectionChange = output<string>();
  readonly isOpen = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  toggle() {
    if (this.disabled()) return;
    this.isOpen.update((current) => !current);
  }

  select(item: SfDropdownItem) {
    if (this.disabled()) return;
    if (this.value() === item.value) {
      this.isOpen.set(false);
      return;
    }

    this.selectionChange.emit(item.value);
    this.isOpen.set(false);
  }

  trackItem(_: number, item: SfDropdownItem) {
    return item.value;
  }

  get selectedLabel(): string {
    const match = this.items().find((item) => item.value === this.value());
    return match?.label ?? '';
  }

  get hasSelection(): boolean {
    return this.items().some((item) => item.value === this.value());
  }

  @HostListener('document:click', ['$event'])
  closeOnOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  closeOnEscape(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Escape') {
      this.isOpen.set(false);
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

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

  toggle(event?: MouseEvent) {
    event?.stopPropagation(); // prevents document click from interfering
    if (this.disabled()) return;

    this.isOpen.update((current) => !current);
  }

  select(item: SfDropdownItem, event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.disabled()) return;

    // collapse immediately
    this.close();

    // emit only if changed
    if (this.value() !== item.value) {
      this.selectionChange.emit(item.value);
    }
  }

  close() {
    this.isOpen.set(false);
  }

  trackItem(_: number, item: SfDropdownItem) {
    return item.value;
  }

  get selectedLabel(): string {
    const match = this.items().find((i) => i.value === this.value());
    return match?.label ?? '';
  }

  get hasSelection(): boolean {
    return this.items().some((i) => i.value === this.value());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}

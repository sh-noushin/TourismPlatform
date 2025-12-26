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
    if (this.value() == null || this.value() === '') return this.placeholder();
    const match = this.items().find((i) => i.value === this.value());
    return match?.label ?? this.placeholder();
  }

  get hasSelection(): boolean {
    return true;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    const path = (event.composedPath && event.composedPath()) || [];
    if (!path.includes(this.elementRef.nativeElement)) {
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

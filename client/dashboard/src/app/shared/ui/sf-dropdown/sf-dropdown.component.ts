import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  OnDestroy,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

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
export class SfDropdownComponent implements OnDestroy {
  readonly items = input<SfDropdownItem[]>([]);
  readonly value = input<string | null>(null);
  readonly placeholder = input<string>('Select');
  readonly disabled = input<boolean>(false);
  readonly name = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  readonly selectionChange = output<string>();
  readonly isOpen = signal(false);

  private readonly direction = signal<'ltr' | 'rtl'>('ltr');
  private readonly observer: MutationObserver;

  @HostBinding('attr.dir')
  get hostDir() {
    return this.direction();
  }

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const root = this.document.documentElement;
    this.direction.set(root.dir === 'rtl' ? 'rtl' : 'ltr');
    this.observer = new MutationObserver(() => {
      const dir = root.dir === 'rtl' ? 'rtl' : 'ltr';
      this.direction.set(dir);
    });
    this.observer.observe(root, { attributes: true, attributeFilter: ['dir'] });
  }

  toggle(event?: MouseEvent) {
    event?.stopPropagation();
    if (this.disabled()) return;
    this.isOpen.update((current) => !current);
  }

  select(item: SfDropdownItem, event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.disabled()) return;

    this.close();

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

  ngOnDestroy() {
    this.observer.disconnect();
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

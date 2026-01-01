import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BidiModule, Direction, Directionality } from '@angular/cdk/bidi';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, BidiModule],
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
  readonly dir = signal<Direction>('ltr');
  private dirSub: Subscription | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly directionality: Directionality,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.dir.set(this.directionality.value ?? 'ltr');
    this.dirSub = this.directionality.change?.subscribe((value) => {
      this.dir.set(value ?? 'ltr');
      this.cdr.markForCheck();
    }) ?? null;
  }

  ngOnDestroy() {
    this.dirSub?.unsubscribe();
  }

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

  @HostBinding('attr.dir')
  get hostDir() {
    return this.dir();
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

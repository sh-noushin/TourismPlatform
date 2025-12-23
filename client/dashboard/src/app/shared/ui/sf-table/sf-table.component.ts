import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfEmptyStateComponent } from '../sf-empty-state/sf-empty-state.component';
import { SfSpinnerComponent } from '../sf-spinner/sf-spinner.component';
import {
  SfTableColumn,
  SfTablePaging,
  SfTableRowAction,
  SfTableSort
} from '../../models/table.models';

@Component({
  standalone: true,
  selector: 'sf-table',
  templateUrl: './sf-table.component.html',
  styleUrls: ['./sf-table.component.scss'],
  imports: [CommonModule, SfEmptyStateComponent, SfSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfTableComponent {
  readonly columnsSignal = signal<SfTableColumn[]>([]);
  readonly dataSignal = signal<any[]>([]);
  readonly loadingSignal = signal(false);
  readonly pagingSignal = signal<SfTablePaging | null>(null);
  readonly actionsSignal = signal<SfTableRowAction[]>([]);
  readonly sortSignal = signal<SfTableSort | null>(null);

  @Input()
  set columns(value: SfTableColumn[]) {
    this.columnsSignal.set(value ?? []);
  }

  @Input()
  set data(value: any[]) {
    this.dataSignal.set(value ?? []);
  }

  @Input()
  set loading(value: boolean) {
    this.loadingSignal.set(value);
  }

  @Input()
  set paging(value: SfTablePaging | null) {
    this.pagingSignal.set(value);
  }

  @Input()
  set actions(value: SfTableRowAction[]) {
    this.actionsSignal.set(value ?? []);
  }

  @Input()
  set sort(value: SfTableSort | null) {
    this.sortSignal.set(value);
  }

  @Output() pageChange = new EventEmitter<SfTablePaging>();
  @Output() sortChange = new EventEmitter<SfTableSort>();
  @Output() rowAction = new EventEmitter<{ action: SfTableRowAction; row: any }>();

  totalPages() {
    const paging = this.pagingSignal();
    if (!paging || paging.pageSize === 0) return 1;
    return Math.max(1, Math.ceil(paging.total / paging.pageSize));
  }

  currentPage() {
    const paging = this.pagingSignal();
    return paging ? paging.pageIndex + 1 : 1;
  }

  isFirstPage() {
    const paging = this.pagingSignal();
    return !paging || paging.pageIndex === 0;
  }

  isLastPage() {
    const paging = this.pagingSignal();
    if (!paging) return true;
    return paging.pageIndex >= this.totalPages() - 1;
  }

  navigatePage(direction: 'prev' | 'next') {
    const paging = this.pagingSignal();
    if (!paging) return;
    const maxIndex = Math.max(0, this.totalPages() - 1);
    const nextIndex = direction === 'next'
      ? Math.min(maxIndex, paging.pageIndex + 1)
      : Math.max(0, paging.pageIndex - 1);

    if (nextIndex === paging.pageIndex) return;

    const next = { ...paging, pageIndex: nextIndex };
    this.pagingSignal.set(next);
    this.pageChange.emit(next);
  }

  toggleSort(column: SfTableColumn) {
    if (!column.sortable || !column.field) return;
    const current = this.sortSignal();
    const isSameField = current?.field === column.field;
    const nextDirection = isSameField && current?.direction === 'asc' ? 'desc' : 'asc';
    const next: SfTableSort = { field: column.field as string, direction: nextDirection };
    this.sortSignal.set(next);
    this.sortChange.emit(next);
  }

  emitRowAction(action: SfTableRowAction, row: any) {
    this.rowAction.emit({ action, row });
  }

  resolveValue(row: any, field?: keyof any | string) {
    if (!field) return '';
    const path = field.toString().split('.');
    return path.reduce((value, key) => (value ? value[key] : ''), row) ?? '';
  }

  isSorting(column: SfTableColumn) {
    const sort = this.sortSignal();
    return !!(sort && sort.field === column.field);
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TableAction, TableColumn } from '../../models/table.model';
import { SfButtonComponent } from '../sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'sf-table',
  imports: [SfButtonComponent],
  templateUrl: './sf-table.component.html',
  styleUrl: './sf-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() sortKey?: string;
  @Input() actions: TableAction[] = [];

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() action = new EventEmitter<{ action: TableAction; row: any }>();

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  changePage(direction: -1 | 1) {
    const next = this.page + direction;
    if (next < 1 || next > this.totalPages) {
      return;
    }
    this.pageChange.emit({ page: next, pageSize: this.pageSize });
  }

  emitSort(key: string | keyof any) {
    this.sortChange.emit(String(key));
  }

  triggerAction(action: TableAction, row: any) {
    action.action(row);
    this.action.emit({ action, row });
  }

  getCellValue(column: TableColumn, row: any) {
    return column.cell ? column.cell(row) : row[column.key as keyof typeof row];
  }
}

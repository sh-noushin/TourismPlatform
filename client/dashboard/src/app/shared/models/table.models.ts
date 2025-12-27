export type SfTableSortDirection = 'asc' | 'desc';

export interface SfTableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  headerKey?: string;
  field?: keyof T | string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
}

export interface SfTableRowAction {
  label: string;
  labelKey?: string;
  type: string;
  icon?: string;
  color?: 'primary' | 'warn' | 'muted';
  permission?: string;
}

export interface SfTablePaging {
  pageIndex: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

export interface SfTableSort {
  field: string;
  direction: SfTableSortDirection;
}

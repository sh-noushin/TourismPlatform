export interface TableColumn<Row = any> {
  key: keyof Row | string;
  label: string;
  sortable?: boolean;
  width?: string;
  cell?: (row: Row) => string;
}

export interface TableAction<Row = any> {
  label: string;
  type?: 'default' | 'danger';
  icon?: string;
  action: (row: Row) => void;
  permission?: string;
}

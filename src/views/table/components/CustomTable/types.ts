import type { VNode } from "vue";

export interface CustomTableColumn {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right" | boolean;
  sortable?: boolean | "custom";
  showOverflowTooltip?: boolean;

  type?: "tag" | "status" | "img" | "date" | "currency";

  format?: string;
  digit?: number;
  colorFormat?: (row: any) => string;
  tagProps?: Record<string, any>;

  slotName?: string;
  render?: (row: any, index: number) => VNode | string;
  formatter?: (value: any, row: any) => string;

  [key: string]: any;
}

export interface CustomTableAction {
  label: string;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  onClick: (row: any, index: number) => void;
  show?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
}

export interface CustomTableAlias {
  request?: {
    page?: string;
    pageSize?: string;
    sortField?: string;
    sortOrder?: string;
  };
  response?: {
    list?: string;
    total?: string;
  };
}

export interface CustomTablePagination {
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  show?: boolean;
  layout?: string;
}

export interface CustomTableTableProps {
  stripe?: boolean;
  border?: boolean;
  showSelection?: boolean;
  selectionMode?: "current" | "all";
  showIndex?: boolean;
  indexMethod?: (index: number) => number;
  height?: string | number;
  rowKey?: string;
  [key: string]: any;
}

export interface CustomTableConfig {
  requestApi?: (params: any) => Promise<any>;
  requestParams?: Record<string, any>;
  autoLoad?: boolean;
  transformParams?: (params: Record<string, any>) => Record<string, any>;
  preRequest?: () => Promise<void>;

  alias?: CustomTableAlias;
  pagination?: CustomTablePagination;
  columns: CustomTableColumn[];
  tableProps?: CustomTableTableProps;
  actions?: CustomTableAction[];
  batchActions?: CustomTableAction[];
}

export interface SortInfo {
  prop: string;
  order: "ascending" | "descending" | null;
}

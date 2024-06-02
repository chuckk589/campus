export type AdvancedFilterModel = JoinAdvancedFilterModel | ColumnAdvancedFilterModel;
/** Represents a series of filter conditions joined together. */
export interface JoinAdvancedFilterModel {
  filterType: 'join';
  /** How the conditions are joined together */
  operator: 'AND' | 'OR';
  /** The filter conditions that are joined by the `type` */
  conditions: AdvancedFilterModel[];
}
/** Represents a single filter condition on a column */
export type ColumnAdvancedFilterModel =
  | TextAdvancedFilterModel
  | NumberAdvancedFilterModel
  | BooleanAdvancedFilterModel
  | DateAdvancedFilterModel
  | DateStringAdvancedFilterModel
  | ObjectAdvancedFilterModel;
export type TextAdvancedFilterModelType =
  | 'equals'
  | 'notEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'blank'
  | 'notBlank';
export type ScalarAdvancedFilterModelType =
  | 'equals'
  | 'notEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'blank'
  | 'notBlank';
export type DateAdvancedFilterModelType = ScalarAdvancedFilterModelType | 'inRange';
export type BooleanAdvancedFilterModelType = 'true' | 'false';
/** Represents a single filter condition for a text column */
export interface TextAdvancedFilterModel {
  filterType: 'text';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: TextAdvancedFilterModelType;
  /** The value to filter on. This is the same value as displayed in the input. */
  filter?: string;
}
/** Represents a single filter condition for a number column */
export interface NumberAdvancedFilterModel {
  filterType: 'number';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: ScalarAdvancedFilterModelType;
  /** The value to filter on. */
  filter?: number;
}
/** Represents a single filter condition for a date column */
export interface DateAdvancedFilterModel {
  filterType: 'date';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: DateAdvancedFilterModelType;
  dateFrom?: Date;
  dateTo?: Date;
}
/** Represents a single filter condition for a date string column */
export interface DateStringAdvancedFilterModel {
  filterType: 'dateString';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: DateAdvancedFilterModelType;
  dateFrom?: string;
  dateTo?: string;
}
/** Represents a single filter condition for a boolean column */
export interface BooleanAdvancedFilterModel {
  filterType: 'boolean';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: BooleanAdvancedFilterModelType;
}
/** Represents a single filter condition for an object column */
export interface ObjectAdvancedFilterModel {
  filterType: 'object';
  /** The ID of the column being filtered. */
  colId: string;
  /** The filter option that is being applied. */
  type: TextAdvancedFilterModelType;
  /** The value to filter on. This is the same value as displayed in the input. */
  filter?: string;
}
export interface IServerSideGetRowsRequest {
  /** First row requested or undefined for all rows. */
  startRow: number | undefined;
  /** Index after the last row required row or undefined for all rows. */
  endRow: number | undefined;
  /** Columns that are currently row grouped.  */
  rowGroupCols: ColumnVO[];
  /** Columns that have aggregations on them.  */
  valueCols: ColumnVO[];
  /** Columns that have pivot on them.  */
  pivotCols: ColumnVO[];
  /** Defines if pivot mode is on or off.  */
  pivotMode: boolean;
  /** What groups the user is viewing.  */
  groupKeys: string[];
  /**
   * If filtering, what the filter model is.
   * If Advanced Filter is enabled, will be of type `AdvancedFilterModel | null`.
   * If Advanced Filter is disabled, will be of type `FilterModel`.
   */
  filterModel: { [key: string]: ColumnAdvancedFilterModel };
  /** If sorting, what the sort model is.  */
  sortModel: SortModelItem[];
}
export interface ColumnVO {
  id: string;
  displayName: string;
  field?: string;
  aggFunc?: string;
}
export interface SortModelItem {
  /** Column Id to apply the sort to. */
  colId: string;
  /** Sort direction */
  sort: 'asc' | 'desc';
}

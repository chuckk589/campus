import { BaseDto } from './interfaces';
import { ColumnAdvancedFilterModel, SortModelItem } from './agGridTypes';
import { QueryBuilder } from '@mikro-orm/mysql';
export class AgGridORMConverter {
  public static convertToQuery<T extends typeof BaseDto>(filterModel: { [key: string]: ColumnAdvancedFilterModel }, dtoClass: T) {
    const entries = Object.entries(filterModel);
    return entries.reduce((acc, [key, value]) => {
      const { logic, ...rest } = this.resolveKey(value);
      // console.log(logic, rest, key);
      console.log(dtoClass.prototype.resolveColumn(key, rest));
      const { query, aggregated } = dtoClass.prototype.resolveColumn(key, rest);
      const target = {
        query: logic ? { [logic]: query } : query,
        aggregated,
      };
      acc.push(target);
      return acc;
    }, []);
  }
  public static ApplyFilters<T extends typeof BaseDto>(
    qb: QueryBuilder<any>,
    filters: { [key: string]: ColumnAdvancedFilterModel },
    dtoClass: T,
  ) {
    const _filters = this.convertToQuery(filters, dtoClass);
    _filters.forEach((filter) => {
      if (filter.aggregated) {
        qb.having(filter.query);
      } else {
        qb.andWhere(filter.query);
      }
    });
  }
  public static ApplySort<T extends typeof BaseDto>(qb: QueryBuilder<any>, sortModel: SortModelItem[], dtoClass: T) {
    qb.orderBy(sortModel.map((sort) => dtoClass.prototype.resolveColumn(sort.colId, sort.sort).query));
  }
  private static resolveKey(value: ColumnAdvancedFilterModel) {
    if (value.type == 'equals') return { $eq: this.resolveValue(value) };
    if (value.type == 'notEqual') return { $ne: this.resolveValue(value) };
    if (value.type == 'contains') return { $like: `%${this.resolveValue(value)}%` };
    if (value.type == 'notContains') return { $like: `%${this.resolveValue(value)}%`, logic: '$not' };
    if (value.type == 'startsWith') return { $re: `^${this.resolveValue(value)}` };
    if (value.type == 'endsWith') return { $re: `${this.resolveValue(value)}$` };
    if (value.type == 'blank') return { $eq: null };
    if (value.type == 'notBlank') return { $ne: null };
    if (value.type == 'lessThan') return { $lt: this.resolveValue(value) };
    if (value.type == 'lessThanOrEqual') return { $lte: this.resolveValue(value) };
    if (value.type == 'greaterThan') return { $gt: this.resolveValue(value) };
    if (value.type == 'greaterThanOrEqual') return { $gte: this.resolveValue(value) };
    if (value.type == 'true') return { $eq: true };
    if (value.type == 'false') return { $eq: false };
    if (value.type == 'inRange') return { $gte: value.dateFrom, $lte: value.dateTo };
  }
  private static resolveValue(value: ColumnAdvancedFilterModel) {
    if (value.filterType === 'text') return value.filter;
    if (value.filterType === 'number') return value.filter;
    if (value.filterType === 'date') return value.dateFrom;
    if (value.filterType === 'dateString') return value.dateFrom;
    if (value.filterType === 'boolean') return value.type === 'true';
  }
}

export function AGColumn(column: string, resolve: (value: any) => void, aggregated = false) {
  return function reportableClassDecorator<T extends { new (...args: any[]): object }>(constructor: T) {
    constructor.prototype.columns = constructor.prototype.columns || {};
    constructor.prototype.columns[column] = { resolve, aggregated };
    return class extends constructor {};
  };
}

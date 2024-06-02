import { ColumnNameResolveFunc } from './interfaces';
import { ColumnAdvancedFilterModel } from './agGridTypes';
export class AgGridORMConverter {
  public static convertToWhereQuery(filterModel: { [key: string]: ColumnAdvancedFilterModel }, transformFunc: ColumnNameResolveFunc) {
    const entries = Object.entries(filterModel);
    return entries.reduce(
      (acc, [key, value]) => {
        const { logic, ...rest } = this.resolveKey(value);
        const body = transformFunc(key)(rest);
        const target = logic ? { [logic]: body } : body;
        acc.$and.push(target);
        return acc;
      },
      {
        $and: [],
      },
    );
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

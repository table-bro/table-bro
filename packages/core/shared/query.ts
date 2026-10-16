import type {BroRow} from '../types/row';

/**
 * Table query for pagination, filtering and sorting
 * @group Rows and query
 */
export interface BroQuery<MODEL = BroRow, EXTRA extends object = object> {
  /** The number of the page to load, from 1. */
  page: number;
  /** The number of the rows on a page. */
  pageSize: number;

  /** A copy of the filters of the table; absent when the table has no filters. */
  filter?: BroFilters<MODEL, EXTRA>;

  /** The sort of the rows; absent when no column is sorted or the sort is cleared. */
  sort?: {
    /** The sort spec of every sorted field, by the key of the field. */
    keys: Partial<Record<keyof MODEL, BroSortSpec>>;
    /** The priority of the sort keys for multi-column sorting: the first key sorts first. */
    order?: readonly (keyof MODEL)[];
  };
}

/**
 * The filters of a query: a value or a condition for each field of the row, the text of the search and the groups of the conditions of the application.
 * @group Rows and query
 */
export type BroFilters<MODEL = BroRow, EXTRA extends object = object> = Partial<{
  [K in Exclude<keyof MODEL, keyof EXTRA>]: BroFilterValue<MODEL[K]> | BroFilterCondition<MODEL[K]>;
}>
& EXTRA
& {
  /** The text of the search of the toolbar; null after the search is cleared. */
  search?: string | null;

  /** The groups of the field conditions that the application sets; the table passes them on and does not apply them. */
  advancedFilters?: BroAdvancedFilterGroup<MODEL>[];
};

/**
 * The value of a filter of a field: one value, or the values one of which the field equals.
 * @group Rows and query
 */
export type BroFilterValue<T> = T | readonly T[];

/**
 * Advanced filter condition for a field
 * @group Rows and query
 */
export interface BroFilterCondition<T> {
  /** The value that the field equals; a number matches its text, as 5 matches '5'. */
  eq?: T;
  /** The values one of which the field equals, compared as in eq. */
  in?: readonly T[];
  /** The text that the text of the field contains, case-insensitive. */
  contains?: string;
  /** The text that the text of the field starts with, case-insensitive. */
  startsWith?: string;
  /** The lower bound, inclusive: compared as numbers when both values are numbers, else as lowercase texts. */
  gte?: T;
  /** The upper bound, inclusive: compared as numbers when both values are numbers, else as lowercase texts. */
  lte?: T;
}

/**
 * A group of the conditions on the fields of the row, joined by AND or OR.
 * @group Rows and query
 */
export type BroAdvancedFilterGroup<MODEL = BroRow> = {
  /** The logical operator that joins the conditions of the group. */
  joiner: 'AND' | 'OR';

  /** The condition on the text of the search. */
  search?: BroFilterCondition<string>;
} & Partial<{
  [K in Exclude<keyof MODEL, 'joiner' | 'search'>]: BroFilterCondition<MODEL[K]>;
}>;

/**
 * Whether the value of a field meets a condition of a filter: every operator that the condition sets must match.
 * @param fieldValue - the value of the field of the row
 * @param condition - the condition of the filter
 * @group Rows and query
 */
export function matchesFilterCondition(fieldValue: unknown, condition: BroFilterCondition<unknown>): boolean {
  if (condition.eq !== undefined && !looselyEqual(fieldValue, condition.eq)) {
    return false;
  }

  if (condition.in !== undefined && !condition.in.some(v => looselyEqual(fieldValue, v))) {
    return false;
  }

  const str = String(fieldValue ?? '').toLowerCase();

  if (condition.contains !== undefined && !str.includes(condition.contains.toLowerCase())) {
    return false;
  }

  if (condition.startsWith !== undefined && !str.startsWith(condition.startsWith.toLowerCase())) {
    return false;
  }

  if (condition.gte !== undefined) {
    const n = Number(fieldValue), ng = Number(condition.gte);

    if (!Number.isNaN(n) && !Number.isNaN(ng) ? n < ng : str < String(condition.gte).toLowerCase()) {
      return false;
    }
  }

  if (condition.lte !== undefined) {
    const n = Number(fieldValue), nl = Number(condition.lte);

    if (!Number.isNaN(n) && !Number.isNaN(nl) ? n > nl : str > String(condition.lte).toLowerCase()) {
      return false;
    }
  }

  return true;
}

/** Whether two values are equal, as a number and its text from a control: '5' equals 5, and 0 equals no null, '' or false. */
function looselyEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  const na = numeric(a), nb = numeric(b);

  return na !== null && nb !== null && na === nb;
}

/** A number, or the number of a text with one; null, an empty text, a boolean and other values are no numbers. */
function numeric(value: unknown): number | null {
  const number = (typeof value === 'number') ? value : (typeof value === 'string' && value.trim()) ? Number(value) : NaN;

  return Number.isNaN(number) ? null : number;
}

/**
 * The direction of a sort: ascending or descending.
 * @group Rows and query
 */
export type BroSortDirection = 'asc' | 'desc';

/**
 * The sort of a field in a query.
 * @group Rows and query
 */
export interface BroSortSpec {
  /** The direction of the sort of the field. */
  direction: BroSortDirection;
}

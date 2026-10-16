import {BroPagination}                                                      from '../model/pagination';
import {appObject, copyAppObject}                                           from '../shared/app-objects';
import type {BroFilters}                                                    from '../shared/query';
import {selectors}                                                          from '../table-bro-selectors';
import type {BroCol, BroColDataType, BroColSort, BroResolvedConfig, BroRow} from '../types/table-bro';
import {BroRowsSearch}                                                      from '../view/features/filters/rows-search';

/**
 * The table status: loading without rows (the loading state), refreshing over the shown rows, or idle.
 */
export declare type BroTableStatus = 'idle' | 'loading' | 'refreshing';

/**
 * The logical state of an instance: what the table knows about the data and the query.
 * Only the controller writes it; views and models read it through ctx.state.
 */
export interface BroDataState {
  /** The source collection from replaceRows/appendRows. */
  sourceRows: BroRow[] | null | undefined;
  /** The displayed rows: in the local mode they are computed from sourceRows, filter, and sort on every change; none before the first rows and under a state. */
  rows?: BroRow[] | null;
  /** The accumulated filters: the local mode applies them to the rows, the server mode sends them in the load query. */
  filter?: BroFilters;
  /** The sort from the last bro-filters-sort event. */
  sort?: BroColSort;
  /** The page, the page size and the total. The controller replaces the object when the rows are replaced. */
  pagination: BroPagination;
  /** The number of the first row of the page before filtering, formerly `firstRowNumberBeforeFiltering`: after the filter is cleared, the table returns to its page. */
  firstRowBeforeFilter?: number;
  /** Loading, refreshing, or idle; the paginator is disabled while the status is not idle or there are no rows. */
  status: BroTableStatus;
  /** The page and the page size of the last load intent of the server mode: its answer, replaceRows() or appendRows(), takes them and ends the intent. */
  load?: {page: number; pageSize: number};
}

/**
 * The state of a new table: no rows yet, at the first page.
 * @phase state
 */
export function createTableState(config: BroResolvedConfig): BroDataState {
  return {
    sourceRows: undefined,
    rows: undefined,
    filter: undefined,
    sort: undefined,
    pagination: new BroPagination(config),
    firstRowBeforeFilter: undefined,
    status: 'idle',
    load: undefined
  };
}

/**
 * What the state phase sees: the state, the columns and the config. It gets no views, no models of ctx.model and no
 * DOM, so a function of this file changes only the state.
 */
export interface BroStateContext {
  readonly state: BroDataState;
  readonly cols: BroCol[];
  readonly config: BroResolvedConfig;
}

/**
 * The state of a change of the filters of the local mode: the rows of the accumulated filters and the sort. The rows
 * start at the first page; the cleared filters bring back the page before the filtering. No rows found keep the page.
 * @phase state
 */
export function filterRows(ctx: BroStateContext, change: BroFilters): void {
  const {state} = ctx;

  // A reset is decided by the accumulated filters, not by this change alone
  const filter = Object.assign({}, state.filter, change);
  // The rows come before any change: an exception of filtersTransform leaves the table as it was
  const rows = deriveRows(ctx, state.sourceRows, filter, state.sort);

  if (!state.firstRowBeforeFilter) {
    state.firstRowBeforeFilter = state.pagination.firstRow();
  }

  state.filter = filter;
  state.rows = rows;

  if (!rows.length) {
    return;
  }

  state.pagination = new BroPagination({pageSize: state.pagination.pageSize});

  if (!hasActiveFilters(state.filter) && state.firstRowBeforeFilter) {
    state.pagination.page = state.pagination.getPageByRowNumber(state.firstRowBeforeFilter);
    delete state.firstRowBeforeFilter;
  }
}

/**
 * The state of a sort of the local mode: the rows of the filters in the new order.
 * @phase state
 */
export function sortRows(ctx: BroStateContext, change: BroColSort<BroRow>): void {
  const rows = deriveRows(ctx, ctx.state.sourceRows, ctx.state.filter, change);

  ctx.state.sort = change;
  ctx.state.rows = rows;
}

/**
 * Displayed rows of the local mode, computed on every change from one source collection:
 * the accumulated filters first, then the sort. Without active filters and sort they are the source array itself.
 * A pure step: it reads only its arguments, so the caller changes the state after it.
 * @phase state
 */
export function deriveRows({cols, config}: BroStateContext, sourceRows: BroRow[] | null | undefined, filter: BroFilters | undefined, sort: BroColSort | undefined): BroRow[] {
  let rows = sourceRows || [];

  if (hasActiveFilters(filter)) {
    rows = new BroRowsSearch(cols).transform(rows, filter);

    if (typeof config.filtersTransform === 'function') {
      // The callback gets the application rows; the rows it returns are mapped back to the table copies
      const tableRows = new Map(rows.map(row => [appObject(row), row]));

      rows = config.filtersTransform(rows.map(appObject), filter)
        .map(row => tableRows.get(row) || copyAppObject(row));
    }

    if (config.rowCounter) {
      rows = rows.map((row, index) => copyAppObject(row, {
        [selectors.rowCounter]: index + 1
      }));
    }
  }

  const {sortKey, sortDirection} = sort || {};

  if (sortDirection && sortKey) {
    const dataType = cols.find(col => (col.sortKey || col.name) === sortKey)?.dataType;
    // Text compares in the language of the page, without case, and with the numbers in it: 'Item 2' before 'Item 10'
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'accent'});
    const direction = (sortDirection === 'asc') ? 1 : -1;

    rows = [...rows].sort((a: BroRow, b: BroRow) => {
      const aEmpty = isEmptyValue(a[sortKey]);
      const bEmpty = isEmptyValue(b[sortKey]);

      // Empty values come last in both directions
      if (aEmpty || bEmpty) {
        return Number(aEmpty) - Number(bEmpty);
      }

      return direction * compareValues(a[sortKey], b[sortKey], dataType, collator);
    });
  }

  return rows;
}

/**
 * Compares two values of a column for the local sort. A column of the number type compares its values as numbers, also
 * the ones given as text; text compares by the collator; numbers, booleans and dates compare by their values.
 * @param a - the value of the first row
 * @param b - the value of the second row
 * @param dataType - the type of the column
 * @param collator - the comparison of text
 * @phase state
 */
function compareValues(a: unknown, b: unknown, dataType: BroColDataType | undefined, collator: Intl.Collator): number {
  if (dataType === 'number') {
    a = Number(a);
    b = Number(b);
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return collator.compare(a, b);
  }

  // Numbers, booleans and dates compare by their values
  const x = <number>a;
  const y = <number>b;

  return (x < y) ? -1 : (x > y) ? 1 : 0;
}

/**
 * Whether a value is empty: undefined, null or an empty string. An empty filter is cleared, and an empty value of a cell
 * sorts last.
 * @phase state
 */
function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * Whether a filter has a value. A cleared filter is undefined, null or an empty string; false and 0 are values, which
 * filtersTransform gets.
 * @phase state
 */
export function hasActiveFilters(filter: BroFilters | undefined): filter is BroFilters {
  return !!filter && Object.keys(filter).some(key => !isEmptyValue(filter[key]));
}

/**
 * The state of new rows: an empty array shows the empty state. Rows are copied and numbered, the local mode filters
 * and sorts them, and they start at the first page, in the page size of the last load intent.
 * @phase state
 */
export function acceptRows(ctx: BroStateContext, value: BroRow[], total?: number): void {
  const {state, config} = ctx;

  if (!value.length) {
    // The empty result replaces the collection too, so later filters and sorting do not bring back old rows
    state.sourceRows = [];
    state.rows = state.sourceRows;
    state.load = undefined;
    state.status = 'idle';

    return;
  }

  let sourceRows = copyRows(value);

  if (config.rowCounter) {
    sourceRows = setRowNumbers(sourceRows);
  }

  // Server mode shows the collection as is; local mode applies the current filters and sort to the new rows.
  // The rows come before any change: an exception of filtersTransform leaves the table with its status and rows
  const rows = config.server ? sourceRows : deriveRows(ctx, sourceRows, state.filter, state.sort);

  state.sourceRows = sourceRows;
  state.rows = rows;

  state.pagination = new BroPagination({pageSize: state.load?.pageSize || state.pagination.pageSize});
  // The answer ends the load intent: a later appendRows without a new intent takes the shown page
  state.load = undefined;

  state.pagination.page = 1;
  state.pagination.total = (!config.server) ? rows.length : total;

  state.status = 'idle';
}

/**
 * The state of a table without rows: undefined is the loading, null the failure.
 * @phase state
 */
export function acceptNoRows({state}: BroStateContext, kind: 'loading' | 'fail'): void {
  state.sourceRows = (kind === 'loading') ? undefined : null;
  state.rows = state.sourceRows;
  state.status = (kind === 'loading') ? 'loading' : 'idle';
}

/**
 * The state of the rows of appendRows after the shown ones: their copies, numbered after them, take the page and the
 * page size of the load intent and end its refresh. The local mode shows all the rows through its filters and sort.
 * Returns the copies.
 * @param ctx - what the state phase sees
 * @param rows - the rows of the application from appendRows
 * @param from - the number of the source rows before them
 * @param total - the total of the query from appendRows; the local mode counts its shown rows
 * @param page - the page of the load intent
 * @param pageSize - the page size of the load intent
 * @phase state
 */
export function appendRows(ctx: BroStateContext, rows: BroRow[], from: number, total: number | undefined, page: number, pageSize: number): BroRow[] {
  const {state, config} = ctx;
  // Only a table that shows rows takes more
  const sourceRows = <BroRow[]>state.sourceRows;

  rows = copyRows(rows);

  if (config.rowCounter) {
    rows = setRowNumbers(rows, from);
  }

  // The local mode shows all the rows through its filters and sort; the rows come before any change, as in acceptRows
  const allRows = sourceRows.concat(rows);
  const shownRows = config.server ? allRows : deriveRows(ctx, allRows, state.filter, state.sort);

  sourceRows.push(...rows);
  // Without filters and sort the shown rows are the source array itself
  state.rows = (shownRows === allRows) ? sourceRows : shownRows;

  state.pagination.total = config.server ? total : state.rows.length;

  setPage(ctx, page, pageSize);
  state.load = undefined;

  state.status = 'idle';

  return rows;
}

/**
 * Calculates the slice range [start, end) that should be appended
 * based on already loaded rows and current pagination.
 * @phase state
 */
export function getAppendRange(loadedCount: number, page: number, pageSize: number): {start: number; end: number} {
  const end = page * pageSize;

  if (loadedCount >= end) {
    return {start: 0, end: 0};
  }

  return {
    start: loadedCount,
    end
  };
}

/**
 * The state of a page change: the page and the page size.
 * @phase state
 */
export function setPage({state}: BroStateContext, page: number, pageSize: number): void {
  const pagination: BroPagination = state.pagination;

  pagination.page = page;
  pagination.pageSize = pageSize;
}

/**
 * The state of a load intent of the server mode: its page and its page size, which the answer takes, and the refresh.
 * @phase state
 */
export function requestLoad(ctx: BroStateContext, page: number, pageSize: number): void {
  ctx.state.load = {page, pageSize};

  startRefresh(ctx);
}

/**
 * The state of a refresh over the shown rows. A table that refreshes already keeps its status, so a second request
 * does not switch the indicator off, and a table that loads keeps its loading state.
 * @phase state
 */
export function startRefresh({state}: BroStateContext): void {
  if (state.status === 'idle') {
    state.status = 'refreshing';
  }
}

/**
 * A new array of shallow row copies: the table adds its service fields (the row number) to the copies,
 * so the application rows stay untouched. Nested values keep their identity; functions and class
 * instances in rows are allowed, which structuredClone rejected. Events, cells, details, and config
 * callbacks get the application rows back through appObject().
 * @phase state
 */
export function copyRows(rows: BroRow[]): BroRow[] {
  return rows.map(row => copyAppObject(row));
}

/**
 * Numbers the rows for the row counter column, from start + 1.
 * @phase state
 */
export function setRowNumbers(rows: BroRow[], start?: number): BroRow[] {
  return rows.map((row, i) => {
    return Object.assign(row, {
      [selectors.rowCounter]: (start || 0) + (i + 1)
    });
  });
}

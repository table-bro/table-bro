import {describe, expect, it} from 'vitest';

import {appObject}                                                                                                           from '../shared/app-objects';
import type {BroFilters, BroSortDirection}                                                                                   from '../shared/query';
import {selectors}                                                                                                           from '../table-bro-selectors';
import type {BroConfig, BroResolvedConfig, BroRow}                                                                           from '../types/table-bro';
import {acceptRows, appendRows, type BroStateContext, createTableState, deriveRows, filterRows, getAppendRange, requestLoad} from './state';

/** The rows of the application: five names, four of them with the letter a. */
function appRows(): BroRow[] {
  return ['delta', 'alpha', 'charlie', 'bravo', 'echo'].map((name, i) => ({id: i + 1, name}));
}

/** The state of a local table with pages of two rows; the search looks at the column name. */
function setup(config: Partial<BroResolvedConfig> = {}): BroStateContext {
  const resolved = <BroResolvedConfig>{pageSize: 2, ...config};

  return {state: createTableState(<BroConfig>resolved), cols: [{title: 'Name', name: 'name'}], config: resolved};
}

describe('deriveRows', () => {
  it('gives the source array itself without filters and sort', () => {
    const rows = appRows();

    expect(deriveRows(setup(), rows, undefined, undefined)).toBe(rows);
  });

  it('searches the rows first, then sorts them', () => {
    const names = (rows: BroRow[]) => rows.map(row => row['name']);
    const ctx = setup();

    expect(names(deriveRows(ctx, appRows(), {search: 'A'}, {sortKey: 'name', sortDirection: 'asc'}))).toEqual(['alpha', 'bravo', 'charlie', 'delta']);
    expect(names(deriveRows(ctx, appRows(), {search: 'a'}, {sortKey: 'name', sortDirection: 'desc'}))).toEqual(['delta', 'charlie', 'bravo', 'alpha']);
  });

  it('gives false and 0 to filtersTransform; undefined, null and an empty string are cleared filters', () => {
    const filters: BroFilters[] = [];
    const ctx = setup({
      filtersTransform: (rows: BroRow[], filter: BroFilters) => {
        filters.push(filter);

        return rows;
      }
    });
    const rows = appRows();

    deriveRows(ctx, rows, {inStock: false}, undefined);
    deriveRows(ctx, rows, {priceFrom: 0}, undefined);

    expect(filters).toEqual([{inStock: false}, {priceFrom: 0}]);
    expect(deriveRows(ctx, rows, {inStock: undefined, priceFrom: null, search: ''}, undefined)).toBe(rows);
    expect(filters).toHaveLength(2);
  });
});

describe('the local sort', () => {
  /** The values of the column value after a sort of a local table of the given values. */
  function sorted(values: unknown[], sortDirection: BroSortDirection, dataType?: 'number'): unknown[] {
    const ctx = setup();
    const rows = values.map((value, i) => ({id: i + 1, value}));

    ctx.cols.push({title: 'Value', name: 'value', sortKey: 'value', dataType});

    return deriveRows(ctx, rows, undefined, {sortKey: 'value', sortDirection}).map(row => row['value']);
  }

  it('sorts text without case and with the numbers in it', () => {
    expect(sorted(['item 10', 'Item 2', 'item 1', 'Banana', 'apple'], 'asc')).toEqual(['apple', 'Banana', 'item 1', 'Item 2', 'item 10']);
  });

  it('takes the data type of a column without a sort key by its name', () => {
    const ctx = setup();
    const rows = ['0.5', '0.25'].map((price, i) => ({id: i + 1, price}));

    ctx.cols.push({title: 'Price', name: 'price', dataType: 'number'});

    expect(deriveRows(ctx, rows, undefined, {sortKey: 'price', sortDirection: 'asc'}).map(row => row['price'])).toEqual(['0.25', '0.5']);
  });

  it('sorts a column of numbers given as text as numbers', () => {
    expect(sorted(['10', '9', '100', '9.5'], 'asc', 'number')).toEqual(['9', '9.5', '10', '100']);
  });

  it('puts empty values last in both directions', () => {
    expect(sorted([2, null, 1, '', undefined, 3], 'asc')).toEqual([1, 2, 3, null, '', undefined]);
    expect(sorted([2, null, 1, '', undefined, 3], 'desc')).toEqual([3, 2, 1, null, '', undefined]);
  });
});

describe('acceptRows', () => {
  it('numbers copies of the rows, and the application rows stay untouched', () => {
    const ctx = setup({rowCounter: true});
    const rows = appRows();

    acceptRows(ctx, rows);

    const first = (<BroRow[]>ctx.state.sourceRows)[0];

    expect(first[selectors.rowCounter]).toBe(1);
    expect(selectors.rowCounter in rows[0]).toBe(false);
    expect(appObject(first)).toBe(rows[0]);
  });

  it('applies the filters of the local mode to new rows, from the first page', () => {
    const ctx = setup();

    ctx.state.filter = {search: 'e'};
    ctx.state.pagination.page = 2;

    acceptRows(ctx, appRows());

    expect(ctx.state.rows?.map(row => row['name'])).toEqual(['delta', 'charlie', 'echo']);
    expect(ctx.state.pagination.page).toBe(1);
    expect(ctx.state.pagination.total).toBe(3);
    expect(ctx.state.status).toBe('idle');
  });
});

describe('filterRows', () => {
  it('brings back the page before the filtering when the filters are cleared', () => {
    const ctx = setup();

    acceptRows(ctx, appRows());
    ctx.state.pagination.page = 3;

    filterRows(ctx, {search: 'a'});

    expect(ctx.state.rows?.length).toBe(4);
    expect(ctx.state.pagination.page).toBe(1);

    filterRows(ctx, {search: null});

    expect(ctx.state.rows?.length).toBe(5);
    expect(ctx.state.pagination.page).toBe(3);
  });
});

describe('appendRows', () => {
  it('adds numbered copies after the shown rows and takes the page of the load intent', () => {
    const ctx = setup({rowCounter: true, server: true});
    const more = appRows().slice(0, 2);

    acceptRows(ctx, appRows(), 9);
    ctx.state.status = 'refreshing';

    const added = appendRows(ctx, more, 5, 9, 3, 2);

    expect(added.map(row => row[selectors.rowCounter])).toEqual([6, 7]);
    expect(selectors.rowCounter in more[0]).toBe(false);
    expect(appObject(added[0])).toBe(more[0]);
    expect(ctx.state.rows).toBe(ctx.state.sourceRows);
    expect(ctx.state.rows?.length).toBe(7);
    expect(ctx.state.pagination).toMatchObject({page: 3, pageSize: 2, total: 9});
    expect(ctx.state.status).toBe('idle');
  });

  it('shows all the rows of the local mode through its search and sort', () => {
    const ctx = setup();

    acceptRows(ctx, appRows());
    filterRows(ctx, {search: 'a'});
    ctx.state.sort = {sortKey: 'name', sortDirection: 'desc'};

    appendRows(ctx, [{id: 6, name: 'banana'}, {id: 7, name: 'kilo'}], 5, undefined, 1, 2);

    expect(ctx.state.sourceRows?.length).toBe(7);
    expect(ctx.state.rows?.map(row => row['name'])).toEqual(['delta', 'charlie', 'bravo', 'banana', 'alpha']);
    expect(ctx.state.pagination.total).toBe(5);
  });

  it('ends the load intent with its answer, so a later appendRows takes the shown page', () => {
    const ctx = setup({server: true});

    acceptRows(ctx, appRows(), 9);
    requestLoad(ctx, 2, 2);
    appendRows(ctx, appRows().slice(0, 2), 5, 9, 2, 2);

    expect(ctx.state.load).toBeUndefined();

    requestLoad(ctx, 3, 2);
    acceptRows(ctx, appRows(), 9);

    expect(ctx.state.load).toBeUndefined();
  });
});

describe('getAppendRange', () => {
  it('asks for the rows up to the end of the page, and for none when they are loaded', () => {
    expect(getAppendRange(4, 3, 2)).toEqual({start: 4, end: 6});
    expect(getAppendRange(6, 3, 2)).toEqual({start: 0, end: 0});
  });
});

import {describe, expect, it} from 'vitest';

import {actionEvent, filtersFilterEvent, filtersServerLoadedEvent, filtersSortEvent, paginatorPageEvent} from '../shared/events';
import type {BroQuery}                                                                                   from '../shared/query';
import type {BroControllerContext}                                                                       from '../types/context';
import type {BroConfig, BroEventDetail}                                                                  from '../types/table-bro';
import {BroController}                                                                                   from './controller';
import {createTableState}                                                                                from './state';

/** A controller of the server mode without views: the load intents need the state, the host, and the stubs of the refresh. */
function setup(): {send: (action: string, data: unknown) => void; loads: BroQuery[]; ctx: BroControllerContext} {
  const config = <BroConfig>{server: true, pageSize: 5};
  const host: HTMLElement = document.createElement('div');
  const state = createTableState(config);

  // The table shows the first page of 100 rows: a page of the paginator after it loads its rows
  state.sourceRows = Array.from({length: 5}, (_, i) => ({id: i + 1}));
  state.pagination.total = 100;

  const ctx = <BroControllerContext><unknown>{
    config,
    state,
    host,
    model: {},
    // A load intent starts the refresh: the progress in the header, the overlay, a disabled paginator, the table container for screen readers
    view: {
      thead: {renderActiveSort: () => undefined, renderProgress: () => undefined},
      tableAux: {renderRefresh: () => undefined},
      paginator: {setDisabled: () => undefined},
      tableContainer: {renderStatus: () => undefined}
    },
    themeService: {themeChanges: new EventTarget()},
    signal: new AbortController().signal
  };
  const controller: BroController = new BroController(ctx);
  const loads: BroQuery[] = [];

  host.addEventListener(actionEvent, (event: Event) => {
    const detail: BroEventDetail<BroQuery> = (<CustomEvent>event).detail;

    if (detail.action === filtersServerLoadedEvent) {
      loads.push(<BroQuery>detail.data);
    }
  });

  return {
    send: (action: string, data: unknown) => controller.onDelegateEvents(new CustomEvent(actionEvent, {detail: {action, data}})),
    loads,
    ctx
  };
}

describe('the load intent of the server mode', () => {
  it('gives a query with the accumulated filters, the sort and the page of each load', () => {
    const {send, loads} = setup();
    const price = {keys: {price: {direction: 'asc'}}, order: ['price']};

    send(filtersFilterEvent, {search: 'key'});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: 'asc'});
    send(paginatorPageEvent, {page: 2, pageSize: 5});
    send(filtersFilterEvent, {price50Plus: true});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: undefined});

    expect(loads).toEqual([
      {page: 1, pageSize: 5, filter: {search: 'key'}},
      {page: 1, pageSize: 5, filter: {search: 'key'}, sort: price},
      {page: 2, pageSize: 5, filter: {search: 'key'}, sort: price},
      {page: 1, pageSize: 5, filter: {search: 'key', price50Plus: true}, sort: price},
      {page: 1, pageSize: 5, filter: {search: 'key', price50Plus: true}}
    ]);
  });

  it('keeps a cleared search in every following query', () => {
    const {send, loads} = setup();

    send(filtersFilterEvent, {search: 'key'});
    send(filtersFilterEvent, {search: null});
    send(paginatorPageEvent, {page: 2, pageSize: 5});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: 'asc'});

    expect(loads.map(load => load.filter)).toEqual([{search: 'key'}, {search: null}, {search: null}, {search: null}]);
  });

  it('leaves no sort after the sort is cleared', () => {
    const {send, loads} = setup();

    send(filtersSortEvent, {sortKey: 'price', sortDirection: 'asc'});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: 'desc'});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: undefined});

    expect(loads.map(load => load.sort)).toEqual([
      {keys: {price: {direction: 'asc'}}, order: ['price']},
      {keys: {price: {direction: 'desc'}}, order: ['price']},
      undefined
    ]);
    expect('sort' in loads[2]).toBe(false);
  });

  it('takes the page size of a filter or a sort from the rendered pagination, and of a page change from the paginator', () => {
    const {send, loads, ctx} = setup();

    ctx.state.pagination.pageSize = 15;

    send(filtersFilterEvent, {search: 'key'});
    send(paginatorPageEvent, {page: 2, pageSize: 20});
    send(filtersSortEvent, {sortKey: 'price', sortDirection: 'asc'});

    expect(loads.map(({page, pageSize}) => ({page, pageSize}))).toEqual([{page: 1, pageSize: 15}, {page: 2, pageSize: 20}, {page: 1, pageSize: 15}]);
  });

  it('gives the query without a filter and a sort while there are none, and custom filters as they came', () => {
    const {send, loads} = setup();

    send(paginatorPageEvent, {page: 2, pageSize: 5});
    send(filtersFilterEvent, {price50Plus: false});

    expect(loads[0]).toEqual({page: 2, pageSize: 5});
    expect(loads[1]).toEqual({page: 1, pageSize: 5, filter: {price50Plus: false}});
  });

  it('does not let a page or a page size inside a filter change replace the page of the load', () => {
    const {send, loads} = setup();

    send(filtersFilterEvent, {search: 'key', page: 7, pageSize: 50});

    expect(loads[0]).toEqual({page: 1, pageSize: 5, filter: {search: 'key', page: 7, pageSize: 50}});
  });
});

describe('the actions of the views', () => {
  it('leave custom actions of the application to the application, also the ones named as properties of an object', () => {
    const {send, loads} = setup();

    expect(() => ['edit', 'toString', 'constructor', '__defineGetter__'].forEach(action => send(action, {}))).not.toThrow();
    expect(loads).toEqual([]);
  });
});

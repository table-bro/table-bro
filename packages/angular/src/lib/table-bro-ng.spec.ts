import '@angular/compiler';
import {provideZonelessChangeDetection}               from '@angular/core';
import {type ComponentFixture, TestBed}               from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';

import {type BroActionDetail, type BroConfig, type BroQuery, type BroRow, dispatchAction, events, type TableBroHTMLElement} from '@table-bro/core';

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {TableBroNg} from './table-bro-ng';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

/** What the wrapper asked of the element: the methods of <table-bro> are replaced, so no skin renders. */
interface BroCall {
  method: string;
  args: unknown[];
  table: TableBroHTMLElement;
}

const cols = [{title: 'Name', name: 'name'}];
let calls: BroCall[] = [];

beforeEach(() => {
  const prototype = <Record<string, (...args: unknown[]) => void>>customElements.get('table-bro')!.prototype;

  calls = [];

  for (const method of ['configure', 'replaceRows', 'appendRows', 'setState']) {
    vi.spyOn(prototype, method).mockImplementation(function (this: TableBroHTMLElement, ...args: unknown[]): void {
      calls.push({method, args, table: this});
    });
  }

  TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
});

// Vitest has no hooks of Angular: the test module and the mocks are reset here
afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

/** The wrapper with its inputs; the calls of its first render are kept. */
async function create(inputs: Record<string, unknown>): Promise<ComponentFixture<TableBroNg<BroRow>>> {
  const fixture = TestBed.createComponent<TableBroNg<BroRow>>(TableBroNg);

  Object.entries({cols, conf: <BroConfig>{skin: 'nv'}, ...inputs}).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  await fixture.whenStable();

  return fixture;
}

async function set(fixture: ComponentFixture<TableBroNg<BroRow>>, inputs: Record<string, unknown>): Promise<BroCall[]> {
  calls = [];
  Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  await fixture.whenStable();

  return calls;
}

const methods = (list: BroCall[]) => list.map(call => [call.method, ...call.args]);

describe('TableBroNg', () => {
  it('renders the rows of the local mode with the table and delivers a new array once', async () => {
    const rows = [{name: 'a'}];
    const fixture = await create({rows, total: 1});

    expect(methods(calls)).toEqual([['configure', {cols, rows, conf: {skin: 'nv'}}]]);
    expect(fixture.nativeElement.firstElementChild).toBe(calls[0].table);

    const next = [{name: 'b'}];

    expect(methods(await set(fixture, {rows: next, emptyState: 'not-found'}))).toEqual([['replaceRows', next, {total: 1, emptyState: 'not-found'}]]);
    expect(await set(fixture, {rows: next})).toEqual([]);
    expect(await set(fixture, {rows: undefined})).toEqual([]);
  });

  it('delivers the rows of the server mode after the table, with their total', async () => {
    const rows = [{name: 'a'}];

    await create({rows, total: 40, conf: {skin: 'nv', server: true}});

    expect(methods(calls)).toEqual([['configure', {cols, rows: undefined, conf: {skin: 'nv', server: true}}], ['replaceRows', rows, {total: 40, emptyState: undefined}]]);
  });

  it('appends the rows of the page with the total of the same answer', async () => {
    const fixture = await create({rows: [{name: 'a'}], total: 40, conf: {skin: 'nv', server: true}});
    const more = [{name: 'b'}];

    expect(methods(await set(fixture, {rowsToAppend: more, total: 41}))).toEqual([['appendRows', more, {total: 41}]]);
  });

  it('shows a loading without rows, a refresh over rows, its end and a failure', async () => {
    const fixture = await create({rows: undefined, loading: true});

    // The new table and the effect of the input both give the state: a table that loads keeps its loading state
    expect(new Set(methods(calls).slice(1).map(String))).toEqual(new Set(['setState,loading']));

    const rows = [{name: 'a'}];

    expect(methods(await set(fixture, {rows, loading: false}))).toEqual([['replaceRows', rows, {total: undefined, emptyState: undefined}], ['setState', 'idle']]);
    expect(methods(await set(fixture, {loading: true}))).toEqual([['setState', 'refreshing']]);
    expect(methods(await set(fixture, {loading: false}))).toEqual([['setState', 'idle']]);
    expect(methods(await set(fixture, {failed: true}))).toEqual([['setState', 'fail']]);

    // The end of the failure shows the rows of the page again, the same array too, and a loading keeps its refresh
    expect(methods(await set(fixture, {failed: false, loading: true}))).toEqual([['replaceRows', rows, {total: undefined, emptyState: undefined}], ['setState', 'refreshing']]);
    expect(methods(await set(fixture, {loading: false}))).toEqual([['setState', 'idle']]);

    // The same array, as an async pipe gives it again after null, is delivered after a failure
    await set(fixture, {failed: true});
    expect(await set(fixture, {rows: null})).toEqual([]);
    expect(methods(await set(fixture, {failed: false, rows}))).toEqual([['replaceRows', rows, {total: undefined, emptyState: undefined}]]);
  });

  it('creates a new table for new columns, with the filters, the id and the theme of the page', async () => {
    const filter = {status: 'open'};
    const fixture = await create({rows: [{name: 'a'}], filter, tableId: 'orders', theme: 'dark'});
    const first = calls[0].table;
    const filters: unknown[] = [];
    const newCols = [{title: 'Status', name: 'status'}];

    document.addEventListener(events.actionEvent, event => {
      const detail = (<CustomEvent<BroActionDetail>>event).detail;

      if (detail.action === events.filtersFilterEvent) {
        filters.push(detail.data);
      }
    });

    await set(fixture, {cols: newCols});

    const table = calls[0].table;

    expect(table).not.toBe(first);
    expect(fixture.nativeElement.children.length).toBe(1);
    expect(fixture.nativeElement.firstElementChild).toBe(table);
    expect(table.id).toBe('orders');
    expect(table.theme).toBe('dark');
    expect(filters).toEqual([filter]);
  });

  it('renders the first table in the element of the prerender, and a new table for new columns', async () => {
    const fixture = TestBed.createComponent<TableBroNg<BroRow>>(TableBroNg);
    const prerendered = document.createElement('table-bro');

    fixture.nativeElement.append(prerendered);
    fixture.componentRef.setInput('cols', cols);
    fixture.componentRef.setInput('rows', undefined);
    fixture.componentRef.setInput('conf', {skin: 'nv'});
    await fixture.whenStable();

    expect(calls[0].table).toBe(prerendered);
    expect(fixture.nativeElement.firstElementChild).toBe(prerendered);

    await set(fixture, {cols: [{title: 'Status', name: 'status'}]});

    expect(calls[0].table).not.toBe(prerendered);
    expect(fixture.nativeElement.firstElementChild).toBe(calls[0].table);
  });

  it('emits the query of the server mode and the other actions of the table', async () => {
    const fixture = await create({rows: [{name: 'a'}]});
    const table = calls[0].table;
    const queries: BroQuery<BroRow>[] = [];
    const actions: BroActionDetail<BroRow>[] = [];
    const query = <BroQuery<BroRow>>{page: 2, pageSize: 10};

    fixture.componentInstance.query.subscribe(value => queries.push(value));
    fixture.componentInstance.action.subscribe(value => actions.push(value));

    dispatchAction(table, events.filtersServerLoadedEvent, query);
    dispatchAction(table, events.detailsToggleEvent, <never>{row: {name: 'a'}});

    expect(queries).toEqual([query]);
    expect(actions.map(action => action.action)).toEqual([events.detailsToggleEvent]);
  });
});

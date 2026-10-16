import type {BroActionDetail, BroCellElement, BroCol, BroConfig, BroFilterDrawerHTMLElement, BroRow, BroTableAction, TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, type Page, test} from '@playwright/test';
import {compile, compileString}                from 'sass';

import type {BroContext, BroSkinStyles}      from '../packages/core/types/context';
import {bodyTable, rangeLabel, stateMessage} from './table-bro.fixtures';

// Regression tests for the fixed defects of the table. Each test says what it checks.

/** The window of the stand page, with what the tests put into it and read back. */
type E2EWindow = typeof window & {
  e2eEvents: BroActionDetail[];
  e2eRan?: boolean;
  e2eAbortListeners: (signal: AbortSignal) => number;
  e2eViolations: string[];
  appCols: BroCol[];
  appRows: BroRow[];
  transformed: BroRow[];
  bootstrap: {Tooltip: {getInstance(element: Element): object | null}};
};

/** A table with config.debug, which shows its context. */
type DebugTable = TableBroHTMLElement & Record<symbol, BroContext>;

/** The detail of an action of the table by its name. */
type ActionOf<K extends BroTableAction> = Extract<BroActionDetail, {action: K}>;

/** The detail of an action of a cell element: its own name, with the cell data. */
type CellAction = Exclude<BroActionDetail, ActionOf<BroTableAction>>;

interface MountOptions {
  cols: BroCol[];
  rows?: BroRow[];
  config?: Record<string, unknown>;
  /** The inline style of the host, set before the first render. */
  hostStyle?: string;
}

/** Creates a <table-bro> on the stand page and waits for its first render. */
async function mountTable(page: Page, {cols, rows, config, hostStyle}: MountOptions): Promise<Locator> {
  // The tables of a test share the stand page: the first one opens it
  if (new URL(page.url()).pathname !== '/') {
    await page.goto('/', {waitUntil: 'networkidle'});
  }

  await page.evaluate(({cols, rows, config, hostStyle}) => {
    document.querySelector('#defect-table')?.remove();

    const el = document.createElement('table-bro') as DebugTable;

    el.id = 'defect-table';
    (window as E2EWindow).e2eEvents = [];
    el.addEventListener('bro-action', event => (window as E2EWindow).e2eEvents.push((event as CustomEvent).detail));

    if (hostStyle) {
      el.setAttribute('style', hostStyle);
    }

    el.configure({cols, rows, conf: {...config}});
    document.body.append(el);
  }, {cols, rows, config, hostStyle});

  const table = page.locator('table-bro#defect-table');

  await expect(bodyTable(table)).toHaveCount(1);

  return table;
}

function events(page: Page): Promise<BroActionDetail[]> {
  return page.evaluate(() => (window as E2EWindow).e2eEvents);
}

function cellTexts(table: Locator, column: number): Promise<string[]> {
  return bodyTable(table).locator(`tbody > tr[data-row-number] > td:nth-child(${column})`).evaluateAll(cells => {
    return cells.map(cell => cell.textContent?.trim() || '').filter(Boolean);
  });
}

const priceCols: BroCol[] = [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}];
const priceRows = [{name: 'b', price: 3}, {name: 'a', price: 1}, {name: 'c', price: 2}];

test('the local sort follows the arrow direction', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);

  const sortHeader = table.locator('table.bro-table-header th').nth(2).locator('[class*="sort-header"]').first();

  await sortHeader.click();
  await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '2', '1']);
  expect((await events(page)).at(-1)?.data).toEqual({sortKey: 'price', sortDirection: 'desc'});

  await sortHeader.click();
  await expect.poll(() => cellTexts(table, 3)).toEqual(['1', '2', '3']);
  expect((await events(page)).at(-1)?.data).toEqual({sortKey: 'price', sortDirection: 'asc'});
});

test('the third click in a vanilla skin clears the sort', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'bs'}});

  await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);

  const sortHeader = table.locator('table.bro-table-header th').nth(2).locator('.bro-sort-header-container');

  await sortHeader.click();
  await sortHeader.click();
  await sortHeader.click();

  const sorts = (await events(page)).filter((event): event is ActionOf<'bro-filters-sort'> => event.action === 'bro-filters-sort');

  expect(sorts.map(event => event.data.sortDirection)).toEqual(['desc', 'asc', undefined]);
  await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);
});

test('sorting another column resets the arrow of a vanilla header', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv'}});
  const headers = table.locator('table.bro-table-header th .bro-sort-header-container');

  await headers.nth(1).click();
  await expect(headers.nth(1)).toHaveClass(/bro-sort-header-sorted/);

  await headers.nth(2).click();
  await expect(headers.nth(2)).toHaveClass(/bro-sort-header-sorted/);
  await expect(headers.nth(1)).not.toHaveClass(/bro-sort-header-sorted/);
});

test('the mat sort header resets without looking for the table', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});
  const headers = table.locator('table.bro-table-header th [class*="sort-header"] .mat-sort-header-container');

  await headers.nth(1).click();
  await expect(headers.nth(1)).toHaveClass(/mat-sort-header-sorted/);

  await headers.nth(2).click();
  await expect(headers.nth(2)).toHaveClass(/mat-sort-header-sorted/);
  await expect(headers.nth(1)).not.toHaveClass(/mat-sort-header-sorted/);
});

test('a small table still offers page sizes', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv'}});

  await expect.poll(() => cellTexts(table, 3)).toHaveLength(3);

  expect(await table.locator('.bro-paginator-page-size select option').count()).toBeGreaterThan(0);
});

test('the range label shows no rows under the not-found state', async ({page}) => {
  const rows = Array.from({length: 20}, (_, i) => ({name: `row ${i + 1}`, price: i}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat'}});

  await expect(rangeLabel(table)).toContainText('1 – 5 of 20');

  await table.locator('.bro-toolbar-button-search').click();
  await table.locator('input[name="search"]').fill('no-such-row');
  await expect(stateMessage(table)).toContainText('No records found');
  await expect(rangeLabel(table)).not.toContainText('of 20');
});

test('server mode hides the first and last buttons in vanilla skins', async ({page}) => {
  for (const skin of ['bs', 'nv']) {
    const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin, server: true}});

    await expect(table.locator('.bro-paginator-navigation-next')).toHaveCount(1);
    await expect(table.locator('.bro-paginator-navigation-first, .bro-paginator-navigation-last')).toHaveCount(0);
  }
});

test('vanilla paginator links have labels', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv'}});
  const labels = await table.locator('[class*="bro-paginator-navigation-"]').evaluateAll(links => {
    return links.map(link => link.getAttribute('aria-label'));
  });

  expect(labels.length).toBeGreaterThan(0);

  for (const label of labels) {
    expect(label).toBeTruthy();
    expect(label).not.toBe('undefined');
  }
});

test('rowCounter: false renders the rows', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat', rowCounter: false}});

  await expect.poll(() => cellTexts(table, 2)).toEqual(['3', '1', '2']);
});

test('configure without config.skin fails', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const message = await page.evaluate(() => {
    const el = document.createElement('table-bro') as DebugTable;

    try {
      el.configure({cols: [{title: 'Name', name: 'name'}], rows: [], conf: {}});
    } catch (error) {
      return (error as Error).message;
    }
  });

  expect(message).toContain('conf.skin is required');
});

test('a table without a filters component has no filters container', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});

  await expect(table.locator('.bro-filters-container')).toHaveCount(0);
  await expect(table.locator('undefined')).toHaveCount(0);
});

test('an unregistered skin fails with its name', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const message = await page.evaluate(() => {
    const el = document.createElement('table-bro') as DebugTable;

    try {
      el.configure({cols: [{title: 'Name', name: 'name'}], rows: [], conf: {skin: 'no-such-skin'}});
    } catch (error) {
      return (error as Error).message;
    }
  });

  expect(message).toContain('no-such-skin');
});

test('configure leaves the application rows untouched', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const keys = await page.evaluate(() => {
    const rows = [{name: 'a', price: 1}];
    const el = document.createElement('table-bro') as DebugTable;

    el.configure({cols: [{title: 'Name', name: 'name'}], rows, conf: {skin: 'mat'}});

    return Object.keys(rows[0]);
  });

  expect(keys).toEqual(['name', 'price']);
});

test('rows may carry functions', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, config: {skin: 'mat'}});

  await page.evaluate(() => {
    const el = document.querySelector('#defect-table') as DebugTable;

    el.replaceRows([{name: 'a', price: 1, format: () => 'a'}, {name: 'b', price: 2, format: () => 'b'}]);
  });

  await expect.poll(() => cellTexts(table, 2)).toEqual(['a', 'b']);
});

test('cells, events, and filtersTransform get the application objects', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(() => {
    if (!customElements.get('e2e-cell')) {
      customElements.define('e2e-cell', class extends HTMLElement {
        connectedCallback() {
          this.textContent = 'cell';
          this.addEventListener('click', () => this.dispatchEvent(new CustomEvent('e2e', {detail: 'pick'})));
        }
      });
    }

    const w = window as E2EWindow;

    w.appCols = [{title: 'Cell', name: 'name', component: {selector: 'e2e-cell', event: 'e2e'}}];
    w.appRows = [{name: 'apple'}, {name: 'banana'}];
    w.transformed = [];
    w.e2eEvents = [];

    const el = document.createElement('table-bro') as DebugTable;

    el.id = 'defect-table';
    el.addEventListener('bro-action', event => w.e2eEvents.push((event as CustomEvent).detail));

    el.configure({cols: w.appCols, rows: w.appRows, conf: {
      skin: 'mat',
      filtersTransform: (rows: BroRow[]) => {
        w.transformed = rows;

        return rows;
      }
    }});
    document.body.append(el);
  });

  const table = page.locator('table-bro#defect-table');
  const cells = bodyTable(table).locator('e2e-cell');

  await expect(cells).toHaveCount(2);

  await cells.first().click();

  const cellResult = await cells.first().evaluate((cell: HTMLElement & BroCellElement) => {
    const w = window as E2EWindow;
    const action = w.e2eEvents.find((detail): detail is CellAction => detail.action === 'pick');

    return {
      row: cell.row === w.appRows[0],
      col: cell.col === w.appCols[0],
      eventRow: action?.data?.row === w.appRows[0],
      eventCol: action?.data?.col === w.appCols[0]
    };
  });

  expect(cellResult).toEqual({row: true, col: true, eventRow: true, eventCol: true});

  await search(table, 'ban');
  await expect(cells).toHaveCount(1);

  const transformResult = await cells.first().evaluate((cell: HTMLElement & BroCellElement) => {
    const w = window as E2EWindow;

    return {
      transformed: w.transformed.length === 1 && w.transformed[0] === w.appRows[1],
      row: cell.row === w.appRows[1],
      untouched: Object.keys(w.appRows[1])
    };
  });

  expect(transformResult).toEqual({transformed: true, row: true, untouched: ['name']});
});

async function callApi(page: Page, method: 'replaceRows' | 'appendRows' | 'setState', ...args: unknown[]): Promise<void> {
  await page.evaluate(({method, args}) => {
    const el = document.querySelector('#defect-table') as DebugTable;

    (el[method] as (...args: unknown[]) => void)(...args);
  }, {method, args});
}

async function search(table: Locator, text: string): Promise<void> {
  if (!await table.locator('input[name="search"]').count()) {
    await table.locator('.bro-toolbar-button-search').click();
  }

  await table.locator('input[name="search"]').fill(text);
}

async function emitFilter(page: Page, change: Record<string, unknown>): Promise<void> {
  await page.evaluate(change => {
    const el = document.querySelector('#defect-table') as HTMLElement;

    el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-filter', data: change}}));
  }, change);
}

const nameCols: BroCol[] = [{title: 'Name', name: 'name'}, {title: 'Group', name: 'group'}];
const nameRows = [
  {name: 'apple', group: 'x'},
  {name: 'banana', group: 'y'},
  {name: 'apricot', group: 'y'}
];

test('filtering after a second replaceRows uses the new rows', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, config: {skin: 'mat'}});

  await callApi(page, 'replaceRows', nameRows);
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'banana', 'apricot']);

  await callApi(page, 'replaceRows', [{name: 'cherry', group: 'z'}, {name: 'cranberry', group: 'z'}]);
  await expect.poll(() => cellTexts(table, 2)).toEqual(['cherry', 'cranberry']);

  await search(table, 'cran');
  await expect.poll(() => cellTexts(table, 2)).toEqual(['cranberry']);

  await table.locator('.bro-toolbar-clear button').click();
  await expect.poll(() => cellTexts(table, 2)).toEqual(['cherry', 'cranberry']);
});

test('clearing the sort keeps the active filter', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'banana', 'apricot']);

  await search(table, 'ap');
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'apricot']);

  const sortHeader = table.locator('table.bro-table-header th').nth(1).locator('[class*="sort-header"]').first();

  await sortHeader.click();
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apricot', 'apple']);
  await sortHeader.click();
  await sortHeader.click();
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'apricot']);
});

test('clearing the search keeps a custom filter', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});
  await page.evaluate(({cols, rows}) => {
    const el = document.createElement('table-bro') as DebugTable;

    el.id = 'defect-table';

    // The custom group filter is interpreted by filtersTransform, as in the custom filter demos
    el.configure({cols, rows, conf: {
      skin: 'mat',
      filtersTransform: (filtered: (BroRow & {group?: string})[], filters: {group?: string}) => filters.group ? filtered.filter(row => row.group === filters.group) : filtered
    }});
    document.body.append(el);
  }, {cols: nameCols, rows: nameRows});

  const table = page.locator('table-bro#defect-table');

  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'banana', 'apricot']);

  await emitFilter(page, {search: 'a'});
  await emitFilter(page, {group: 'y'});
  await expect.poll(() => cellTexts(table, 2)).toEqual(['banana', 'apricot']);

  await emitFilter(page, {search: null});
  await expect.poll(() => cellTexts(table, 2)).toEqual(['banana', 'apricot']);

  await emitFilter(page, {group: false});
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple', 'banana', 'apricot']);

  await emitFilter(page, {group: 'x'});
  await expect.poll(() => cellTexts(table, 2)).toEqual(['apple']);
});

test('an empty replaceRows replaces the collection', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(3);

  await callApi(page, 'replaceRows', []);
  await expect(stateMessage(table)).toContainText('No data');

  const sortHeader = table.locator('table.bro-table-header th').nth(1).locator('[class*="sort-header"]').first();

  await sortHeader.click();
  await expect(stateMessage(table)).toContainText('No data');
  expect(await cellTexts(table, 2)).toEqual([]);
});

test('empty filler rows take no part in search and sort', async ({page}) => {
  const rows = Array.from({length: 7}, (_, i) => ({name: `row ${i + 1}`, price: 7 - i}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(7);
  await expect(bodyTable(table).locator('tbody > tr:has(td.bro-cell-empty)')).toHaveCount(3);

  await search(table, 'empty-row');
  await expect(stateMessage(table)).toContainText('No records found');

  await table.locator('.bro-toolbar-clear button').click();

  const sortHeader = table.locator('table.bro-table-header th').nth(2).locator('[class*="sort-header"]').first();

  await sortHeader.click();
  await sortHeader.click();
  await expect.poll(() => cellTexts(table, 3)).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  await expect(bodyTable(table).locator('tbody > tr:nth-last-child(-n+3):has(td.bro-cell-empty)')).toHaveCount(3);
});

test('the search ignores fields no column displays', async ({page}) => {
  const table = await mountTable(page, {
    cols: [{title: 'Name', name: 'name'}],
    rows: [{name: 'visible', secret: 'hidden-match'}, {name: 'other', secret: 'nothing'}],
    config: {skin: 'mat'}
  });

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(2);

  await search(table, 'hidden-match');
  await expect(stateMessage(table)).toContainText('No records found');
});

test('a second replaceRows does not leave the progress on', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, config: {skin: 'mat'}});

  await callApi(page, 'replaceRows', nameRows);
  await expect.poll(() => cellTexts(table, 2)).toHaveLength(3);
  await callApi(page, 'replaceRows', nameRows.slice(0, 2));
  await expect.poll(() => cellTexts(table, 2)).toHaveLength(2);

  await expect(table.locator('.bro-table-progress')).toHaveCount(0, {timeout: 3_000});
  await expect(stateMessage(table)).toHaveCount(0);
});

test('replaceRows([]) on a loaded table shows No data', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(3);

  await callApi(page, 'replaceRows', []);
  await expect(stateMessage(table)).toContainText('No data');
});

test('a second server load intent keeps the refresh indicator', async ({page}) => {
  const rows = Array.from({length: 10}, (_, i) => ({name: `row ${i + 1}`, group: 'g'}));
  const table = await mountTable(page, {cols: nameCols, config: {skin: 'mat', server: true}});

  await callApi(page, 'replaceRows', rows.slice(0, 5), {total: 10});
  await expect.poll(() => cellTexts(table, 2)).toHaveLength(5);

  await search(table, 'r');
  await expect(table.locator('.bro-table-progress')).toHaveCount(1);
  await search(table, 'ro');
  await page.waitForTimeout(600);
  await expect(table.locator('.bro-table-progress')).toHaveCount(1);
});

test('a cleared server sort leaves no sort fields in the load payload', {tag: '@smoke'}, async ({page}) => {
  const rows = Array.from({length: 10}, (_, i) => ({name: `row ${i + 1}`, group: 'g'}));
  const table = await mountTable(page, {cols: nameCols, config: {skin: 'mat', server: true}});

  await callApi(page, 'replaceRows', rows.slice(0, 5), {total: 10});
  await expect.poll(() => cellTexts(table, 2)).toHaveLength(5);

  const sortHeader = table.locator('table.bro-table-header th').nth(1).locator('[class*="sort-header"]').first();

  for (let click = 0; click < 3; click++) {
    await sortHeader.click();
    await callApi(page, 'replaceRows', rows.slice(0, 5), {total: 10});
  }

  const loads = (await events(page)).filter((event): event is ActionOf<'bro-filters-server-loaded'> => event.action === 'bro-filters-server-loaded').map(event => event.data);

  expect(loads.map(load => load.sort)).toEqual([{keys: {name: {direction: 'desc'}}, order: ['name']}, {keys: {name: {direction: 'asc'}}, order: ['name']}, undefined]);
  expect(Object.keys(loads[2])).not.toContain('sort');
});

test("setState('loading') shows the loading state", {tag: '@smoke'}, async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(3);

  await callApi(page, 'setState', 'loading');
  await expect(stateMessage(table)).toContainText('Loading');
});

test('rows from configure appear without the loading state', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const firstState = await page.evaluate(() => {
    const el = document.createElement('table-bro') as DebugTable;

    el.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'at once'}], conf: {skin: 'mat'}});
    document.body.append(el);

    return {
      state: el.querySelector('.bro-state-message')?.textContent || '',
      cell: el.querySelector('table.bro-table:not(.bro-table-aux) tbody > tr[data-row-number] td:nth-child(2)')?.textContent?.trim()
    };
  });

  expect(firstState).toEqual({state: '', cell: 'at once'});
});

test('a moved table keeps one set of regions and works', async ({page}) => {
  const rows = Array.from({length: 12}, (_, i) => ({name: `row ${i + 1}`, price: i}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat'}});

  await expect(rangeLabel(table)).toContainText('1 – 5 of 12');

  await page.evaluate(() => {
    const el = document.querySelector('#defect-table')!;
    const holder = document.createElement('div');

    document.body.append(holder);
    holder.append(el);
  });

  await expect(table.locator('table.bro-table-header')).toHaveCount(1);
  await expect(bodyTable(table)).toHaveCount(1);
  await expect(table.locator('ng-mat-paginator, bro-paginator, mat-paginator')).toHaveCount(1);

  await table.locator('button[aria-label="Next page"]').click();
  await expect(rangeLabel(table)).toContainText('6 – 10 of 12');
  expect((await events(page)).filter(event => event.action === 'bro-paginator-page')).toHaveLength(1);
});

test('a table in the markup renders when configure() is called', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const result = await page.evaluate(async () => {
    const errors: string[] = [];
    const original = console.error;

    console.error = (...args: unknown[]) => errors.push(String(args[0]));

    document.body.insertAdjacentHTML('beforeend', '<table-bro id="markup-table"></table-bro>');

    const el = document.querySelector('#markup-table') as DebugTable;
    const before = el.children.length;

    el.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'from markup'}], conf: {skin: 'mat'}});
    await new Promise(resolve => setTimeout(resolve, 300));
    console.error = original;

    return {before, rendered: !!el.querySelector('table.bro-table'), errors};
  });

  expect(result).toEqual({before: 0, rendered: true, errors: []});
});

test('skin elements keep one copy of their markup after a move', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'bs'}});

  await expect.poll(() => cellTexts(table, 3)).toHaveLength(3);

  await page.evaluate(() => {
    const el = document.querySelector('#defect-table')!;

    document.body.prepend(el);
  });

  const counts = await table.evaluate(el => ({
    sortHeaders: el.querySelectorAll('bro-sort-header > .bro-sort-header-container').length,
    headers: el.querySelectorAll('table.bro-table-header th').length
  }));

  expect(counts.sortHeaders).toBe(counts.headers);
});

test('empty filler rows have no row number', async ({page}) => {
  const rows = Array.from({length: 7}, (_, i) => ({name: `row ${i + 1}`, price: i}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(7);

  await expect(bodyTable(table).locator('tbody > tr:has(td.bro-cell-empty)')).toHaveCount(3);
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]:has(td.bro-cell-empty)')).toHaveCount(0);
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(7);
});

test('a dark config theme puts the dark class on the host', async ({page}) => {
  await page.emulateMedia({colorScheme: 'light'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat', theme: 'dark'}});

  await expect(table).toHaveClass(/bro-dark-theme/);
});

test('re-rendering keeps one style per kind of column widths', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, config: {skin: 'mat'}});

  await callApi(page, 'replaceRows', nameRows);
  await callApi(page, 'replaceRows', nameRows.slice(0, 2));
  await search(table, 'ban');
  await expect.poll(() => cellTexts(table, 2)).toEqual(['banana']);

  expect(await table.locator(':scope > style').count()).toBeLessThanOrEqual(2);
});

test('measuring cells leaves no boxes in the document', async ({page}) => {
  const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toHaveLength(3);

  expect(await page.evaluate(() => document.querySelector('#measure-root-offscreen')?.childElementCount || 0)).toBe(0);
});

test('custom cells get objects and report actions with data', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const result = await page.evaluate(async () => {
    if (!customElements.get('e2e-cell')) {
      customElements.define('e2e-cell', class extends HTMLElement {
        connectedCallback() {
          this.textContent = 'cell';
          this.addEventListener('click', () => this.dispatchEvent(new CustomEvent('e2e', {detail: 'pick'})));
        }
      });
    }

    const date = new Date(2026, 0, 1);
    const el = document.createElement('table-bro') as DebugTable;
    const events: BroActionDetail[] = [];

    el.addEventListener('bro-action', event => events.push((event as CustomEvent).detail));

    el.configure({cols: [{title: 'Cell', name: 'name', component: {selector: 'e2e-cell', event: 'e2e'}}], rows: [{name: 'a', date}], conf: {skin: 'mat'}});
    document.body.append(el);
    await new Promise(resolve => setTimeout(resolve, 300));

    const cell = el.querySelector('e2e-cell') as HTMLElement & BroCellElement & {row?: {date?: Date}};

    cell.click();

    const action = events.find((detail): detail is CellAction => detail.action === 'pick');

    return {
      rowIsObject: typeof cell.row === 'object',
      dateKept: cell.row?.date instanceof Date,
      colName: cell.col?.name,
      dataRow: action?.data?.row?.name,
      topRow: 'row' in (action || {})
    };
  });

  expect(result).toEqual({rowIsObject: true, dateKept: true, colName: 'name', dataRow: 'a', topRow: false});
});

for (const skin of ['bs', 'nv']) {
  test(`a toolbar button of the ${skin} skin sends its eventType`, async ({page}) => {
    const table = await mountTable(page, {cols: nameCols, rows: nameRows, config: {skin}});

    await expect(table.locator('.bro-toolbar-button-search')).toHaveCount(1);

    await table.locator('.bro-toolbar a', {hasText: 'Filters'}).click();

    await expect.poll(async () => (await events(page)).map(event => event.action)).toContain('bro-filters-toggle');
  });
}

test('bootstrap tooltips are disposed with a removed table', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'bs'}});

  await expect.poll(() => cellTexts(table, 3)).toHaveLength(3);

  const disposed = await page.evaluate(async () => {
    const el = document.querySelector('#defect-table')!;
    const header = el.querySelector('bro-sort-header > .bro-sort-header-container')!;
    const bootstrap = (window as E2EWindow).bootstrap;
    const before = !!bootstrap.Tooltip.getInstance(header);

    el.remove();
    await new Promise(resolve => setTimeout(resolve, 50));

    return {before, after: !!bootstrap.Tooltip.getInstance(header)};
  });

  expect(disposed).toEqual({before: true, after: false});
});

for (const skin of ['bs', 'nv', 'mat']) {
  test(`the ${skin} skin shows cell values as text unless the column is html`, async ({page}) => {
    const short = '<b class="e2e-markup">bold</b>';
    const long = short + ' long value'.repeat(60); // wider than the column, so the cell uses the text ellipsis element

    const table = await mountTable(page, {
      cols: [
        {title: 'Size "XL"', name: 'text'},
        {title: 'Html', name: 'markup', html: true},
        {title: 'Long text', name: 'longText'},
        {title: 'Long html', name: 'longMarkup', html: true}
      ],
      rows: [{text: short, markup: short, longText: long, longMarkup: long}],
      config: {skin}
    });

    const cells = bodyTable(table).locator('tbody > tr[data-row-number]').first().locator('td');

    await expect(cells.nth(1)).toHaveText(short);
    await expect(cells.nth(2).locator('.e2e-markup')).toHaveText('bold');

    await expect(cells.nth(3).locator('.bro-cell_text-ellipsis')).toContainText(short);
    await expect(cells.nth(3).locator('.e2e-markup')).toHaveCount(0);
    await expect(cells.nth(4).locator('.bro-cell_text-ellipsis .e2e-markup')).toHaveText('bold');

    // The template escapes the quotes of the title in its attribute, so they stay in it
    await expect(table.locator('table.bro-table-header th').nth(1)).toContainText('Size "XL"');
  });
}

for (const [skin, selector] of [['bs', 'bro-bs-tags'], ['nv', 'bro-nv-tags']]) {
  test(`the ${skin} tags show values as text unless the column is html`, async ({page}) => {
    const tag = '<b class="e2e-markup">tag</b>';

    const table = await mountTable(page, {
      cols: [
        {title: 'Tags', name: 'tags', component: {selector}},
        {title: 'Html tags', name: 'htmlTags', component: {selector}, html: true}
      ],
      rows: [{tags: [tag], htmlTags: [tag]}],
      config: {skin}
    });

    const cells = bodyTable(table).locator('tbody > tr[data-row-number]').first().locator('td');

    await expect(cells.nth(1)).toHaveText(tag);
    await expect(cells.nth(1).locator('.e2e-markup')).toHaveCount(0);
    await expect(cells.nth(2).locator('.e2e-markup')).toHaveText('tag');
  });
}

test('the tags that do not fit their cell give way to an ellipsis, also after a sort moves their rows', async ({page}) => {
  const tags = ['first tag', 'second tag', 'third tag'];
  const table = await mountTable(page, {
    cols: [{title: 'Name', name: 'name'}, {title: 'Tags', name: 'tags', component: {selector: 'bro-nv-tags'}}],
    rows: ['b', 'a', 'c'].map(name => ({name, tags})),
    config: {skin: 'nv'}
  });
  const lines = bodyTable(table).locator('tbody > tr[data-row-number] bro-nv-tags');
  // The tags that show and the ellipsis of each line; a tag that does not fit is hidden from the eye only
  const shown = () => lines.evaluateAll(elements => elements.map(el => {
    const visible = (node: Element | null) => !!node && getComputedStyle(node).display !== 'none' && !node.classList.contains('bro-cell-item-hidden');

    return [...el.querySelectorAll('mark')].filter(visible).length + (visible(el.querySelector('.bro-cell-items-ellipsis')) ? '…' : '');
  }));

  await expect(lines).toHaveCount(3);
  await expect.poll(shown).toEqual(['3', '3', '3']);

  // A narrower line keeps the first tags that fit
  await lines.evaluateAll(elements => elements.forEach(el => (el as HTMLElement).style.width = '130px'));
  await expect.poll(shown).toEqual(['1…', '1…', '1…']);

  // Screen readers read every tag of the line and not the ellipsis
  await expect(lines.first().getByText('third tag')).toHaveCount(1);
  await expect(lines.first().locator('mark[aria-hidden], mark[hidden]')).toHaveCount(0);
  await expect(lines.first().locator('.bro-cell-items-ellipsis')).toHaveAttribute('aria-hidden', 'true');
  expect(await lines.first().locator('.bro-cell-item-hidden').first().evaluate(el => getComputedStyle(el).clipPath)).toBe('inset(50%)');

  await cellTexts(table, 2).then(names => expect(names).toEqual(['b', 'a', 'c']));
  await table.locator('thead th').nth(1).locator('bro-sort-header').click();
  await expect.poll(() => cellTexts(table, 2)).toEqual(['c', 'b', 'a']);
  await expect.poll(shown).toEqual(['1…', '1…', '1…']);
});

for (const skin of ['mat', 'bs', 'nv']) {
  test(`autoColumnWidth: false in the ${skin} skin measures nothing and takes the column class widths`, async ({page}) => {
    await page.goto('/', {waitUntil: 'networkidle'});
    // A class width works as a minimum: it must hold the title with the sort icon and the paddings of the skin
    await page.addStyleTag({content: '.e2e-width-name { width: 160px; } .e2e-width-price { width: 120px; }'});

    const table = await mountTable(page, {
      cols: [
        {title: 'Name', name: 'name', className: 'e2e-width-name'},
        {title: 'Description', name: 'description'},
        {title: 'Price', name: 'price', dataType: 'number', className: 'e2e-width-price'}
      ],
      rows: [{name: 'a', description: 'a long description that wraps instead of the ellipsis '.repeat(4), price: 1}],
      config: {skin, autoColumnWidth: false}
    });

    const widths = (selector: string) => table.locator(selector).evaluateAll(cells => {
      return cells.map(cell => Math.round(cell.getBoundingClientRect().width));
    });

    await expect.poll(() => widths('table.bro-table-header th')).toHaveLength(4);

    const headerWidths = await widths('table.bro-table-header th');
    const bodyWidths = await widths('table.bro-table:not(.bro-table-aux) tbody > tr[data-row-number] > td');

    expect([headerWidths[1], bodyWidths[1]]).toEqual([160, 160]);
    expect([headerWidths[3], bodyWidths[3]]).toEqual([120, 120]);

    await expect(table.locator(':scope > style[data-bro-column-widths]')).toHaveCount(0);
    await expect(table.locator('.bro-cell_text-ellipsis')).toHaveCount(0);
  });
}

const skinCustomProperties: [string, string[]][] = [
  ['nv', ['40px', '40px', '48px', '24px', '320px', '2', '0.5', '0.5', '350ms', '400ms', '280ms', '500ms', '750ms', '1', '12px', '16px']],
  ['bs', ['40px', '40px', '48px', '24px', '320px', '2', '0.5', '0.5', '350ms', '400ms', '280ms', '500ms', '750ms', '1', '12px', '16px']],
  ['mat', ['52px', '56px', '42px', '21px', '320px', '2', '0.5', '0.5', '350ms', '400ms', '280ms', '500ms', '750ms', '1', '12px', '16px']]
];

for (const [skin, expected] of skinCustomProperties) {
  test(`the ${skin} skin gives its sizes and timings to the host as custom properties`, {tag: skin === 'mat' ? '@smoke' : []}, async ({page}) => {
    const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin}});

    const values = await table.evaluate(el => {
      const style = getComputedStyle(el);
      const names = [
        '--bro-row-height', '--bro-header-height', '--bro-shadow-size', '--bro-island-space-size',
        '--bro-filter-drawer-width', '--bro-table-body-container-z-index', '--bro-refresh-overlay-opacity', '--bro-refresh-overlay-opacity-dark',
        '--bro-details-duration', '--bro-filter-drawer-duration', '--bro-kinetic-time-constant', '--bro-state-icon-duration', '--bro-state-message-duration',
        '--bro-duration-scale', '--bro-corner-radius', '--bro-filter-drawer-corner-radius'
      ];

      // The browser may give a registered time in seconds
      return names.map(name => style.getPropertyValue(name).trim().replace(/^([\d.]+)s$/, (_, s) => `${Math.round(s * 1000)}ms`));
    });

    expect(values).toEqual(expected);
  });
}

const skinToolbars: [string, string][] = [['nv', '.bro-toolbar'], ['bs', '.bro-toolbar'], ['mat', '.mat-toolbar']];

for (const [skin, toolbarSelector] of skinToolbars) {
  test(`the ${skin} skin rounds the outer corners of the table, and --bro-corner-radius: 0 squares them`, {tag: skin === 'mat' ? '@smoke' : []}, async ({page}) => {
    // The corners of the toolbar and the paginator with their shadows, top-left and bottom-left; the paginator of the
    // vanilla skins has its background on its outer container, which inherits its corners
    const corners = async (table: Locator) => {
      await expect(table.locator(toolbarSelector)).toHaveCount(1);

      return table.evaluate((el: DebugTable, toolbarSelector) => {
        const paginator: HTMLElement = el[Symbol.for('table-bro:debug')].view.paginator.el;
        const radii = (node: Element | null) => node ? [getComputedStyle(node).borderTopLeftRadius, getComputedStyle(node).borderBottomLeftRadius] : null;

        return {
          toolbar: radii(el.querySelector(toolbarSelector)),
          toolbarShadow: radii(el.querySelector('.bro-table-toolbar_shadow')),
          paginator: radii(paginator),
          paginatorShadow: radii(el.querySelector('.bro-paginator-shadow')),
          paginatorBackground: radii(paginator.querySelector('.bro-paginator-outer-container')),
          borderCollapse: Array.from(el.querySelectorAll('table')).map(table => getComputedStyle(table as Element).borderCollapse)
        };
      }, toolbarSelector);
    };

    const rounded = await corners(await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin, debug: true, toolbarTitle: 'Corners'}}));

    expect(rounded.toolbar).toEqual(['12px', '0px']);
    expect(rounded.toolbarShadow).toEqual(['12px', '0px']);
    expect(rounded.paginator).toEqual(['0px', '12px']);
    expect(rounded.paginatorShadow).toEqual(['0px', '12px']);
    expect(rounded.paginatorBackground).toEqual(skin === 'mat' ? null : ['0px', '12px']);
    // A row clips its corners only in the separate border model, also under the reboot of Bootstrap on the stand
    expect(new Set(rounded.borderCollapse)).toEqual(new Set(['separate']));

    const square = await corners(await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin, debug: true, toolbarTitle: 'Corners'}, hostStyle: '--bro-corner-radius: 0px'}));

    expect([square.toolbar, square.toolbarShadow, square.paginator, square.paginatorShadow]).toEqual(Array(4).fill(['0px', '0px']));
  });
}

test('the filter drawer is rounded, and in the modal mode its right corners and the scrim take the corners of the table', {tag: '@smoke'}, async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(({cols, rows}) => {
    const box = document.createElement('div');
    const drawer = document.createElement('table-bro-filter-drawer-container');
    const filters = document.createElement('form');
    const el = document.createElement('table-bro') as DebugTable;

    box.id = 'e2e-drawer-box';
    box.style.width = '1400px';
    drawer.setAttribute('skin', 'bs');
    filters.slot = 'filters';
    filters.innerHTML = '<label>Name <input name="name"></label>';
    drawer.append(el, filters);
    box.append(drawer);
    document.body.append(box);
    el.configure({cols, rows, conf: {skin: 'bs'}});
  }, {cols: priceCols, rows: priceRows});

  const drawer = page.locator('#e2e-drawer-box table-bro-filter-drawer-container');
  // Top-left, top-right, bottom-right and bottom-left
  const radii = (selector: string) => drawer.locator(selector).first().evaluate(node => {
    const style = getComputedStyle(node);

    return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
  });

  await drawer.evaluate((element: BroFilterDrawerHTMLElement) => element.opened = true);
  await expect(drawer).not.toHaveAttribute('modal');

  expect(await radii(':scope > .bro-filter-drawer-card')).toEqual(['16px', '16px', '16px', '16px']);
  expect(await radii(':scope > .bro-filter-drawer-header')).toEqual(['16px', '16px', '0px', '0px']);
  expect(await radii(':scope > [slot="filters"]')).toEqual(['0px', '0px', '16px', '16px']);

  await page.locator('#e2e-drawer-box').evaluate((element: HTMLElement) => element.style.width = '760px');
  await expect(drawer).toHaveAttribute('modal', '');

  expect(await radii(':scope > .bro-filter-drawer-card')).toEqual(['16px', '12px', '12px', '16px']);
  expect(await radii('.bro-filter-drawer-scrim')).toEqual(['12px', '12px', '12px', '12px']);
});

test('a refresh fades the cells of the body and lays no white layer over the spaces and the shadows', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});

  await table.evaluate((el: TableBroHTMLElement) => el.setState('refreshing'));

  const cell = bodyTable(table).locator('tbody > tr[data-row-number] > td').first();

  // The dimming of the light theme of the skin: the cells end at 1 - 0.5
  await expect.poll(() => cell.evaluate(node => getComputedStyle(node).opacity)).toBe('0.5');
  await expect(table.locator('table.bro-table-aux')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(table.locator('table.bro-table-aux')).toHaveCSS('opacity', '1');

  await table.evaluate((el: TableBroHTMLElement) => el.setState('idle'));
  await expect.poll(() => cell.evaluate(node => getComputedStyle(node).opacity)).toBe('1');
  await expect(table.locator(':scope > style[data-bro-refresh]')).toHaveText('');
});

test('the progress of loaded details fades from the first frame of their opening', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  // The Features table of the stand loads its details from the server, with the progress in the aux row
  const table = page.locator('table-bro').first();

  const opacity = table.evaluate(el => new Promise<number>(resolve => {
    let start: number | null = null;

    const frame = (time: number) => {
      const details = el.querySelector<HTMLElement>('table.bro-table tbody > tr.bro-details_tr');
      const progress = el.querySelector('table.bro-table-aux td > [mode]');

      if (start === null && details && details.getBoundingClientRect().height > 0) {
        start = time;
      }

      // The computed opacity is what shows: a transition of the component would hold it
      if (start !== null && time - start >= 100) {
        resolve(progress ? parseFloat(getComputedStyle(progress).opacity) : 0);

        return;
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }));

  await table.locator('table.bro-table tbody > tr.bro-row[data-row-number="3"] bro-details-button').click();

  // The fade is the kinetic motion of the details three times as fast: 0.34 of the opacity is left after 100 ms
  expect(await opacity).toBeLessThan(0.6);
});

/** The sizes and timings the table reads at render: ctx.styles, open with config.debug. */
function skinStyles(table: Locator): Promise<BroSkinStyles> {
  return table.evaluate(el => ({...(el as DebugTable)[Symbol.for('table-bro:debug')].styles}));
}

function rowHeights(table: Locator): Promise<number[]> {
  return bodyTable(table).locator('tbody > tr[data-row-number]').evaluateAll(rows => {
    return rows.map(row => Math.round(row.getBoundingClientRect().height));
  });
}

test('the table takes the sizes and timings of the skin from its CSS', async ({page}) => {
  const nv = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', debug: true}});

  expect(await skinStyles(nv)).toEqual({
    rowHeight: 40, shadowSize: 48, islandSpaceSize: 24, tableBodyContainerZIndex: 2,
    refreshOverlayOpacity: 0.5, refreshOverlayOpacityDark: 0.5, detailsDuration: 350, kineticTimeConstant: 280,
    stateIconDuration: 500, stateMessageDuration: 750, durationScale: 1
  });

  const mat = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat', debug: true}});

  expect(await skinStyles(mat)).toEqual({
    rowHeight: 52, shadowSize: 42, islandSpaceSize: 21, tableBodyContainerZIndex: 2,
    refreshOverlayOpacity: 0.5, refreshOverlayOpacityDark: 0.5, detailsDuration: 350, kineticTimeConstant: 280,
    stateIconDuration: 500, stateMessageDuration: 750, durationScale: 1
  });
  expect(await rowHeights(mat)).toEqual([52, 52, 52]);
});

test('a custom property on the table sets its row height for the rows and the geometry', async ({page}) => {
  const table = await mountTable(page, {
    cols: priceCols,
    rows: priceRows,
    config: {skin: 'mat', debug: true},
    hostStyle: '--bro-row-height: 3rem'
  });

  const rootFontSize: number = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  const rowHeight: number = 3 * rootFontSize;

  expect((await skinStyles(table)).rowHeight).toBe(rowHeight);
  expect(await rowHeights(table)).toEqual([rowHeight, rowHeight, rowHeight]);

  // The body holds a page of 5 rows and the shadows around it
  const bodyHeight: number = await table.locator('.bro-table-body_container').evaluate(el => el.getBoundingClientRect().height);

  expect(Math.round(bodyHeight)).toBe(5 * rowHeight + 2 * 42);
});

for (const skin of ['nv', 'bs', 'mat']) {
  test(`custom properties on the table size the rules of the ${skin} skin and the script alike`, async ({page}) => {
    const table = await mountTable(page, {
      cols: priceCols,
      rows: priceRows,
      config: {skin, debug: true},
      hostStyle: '--bro-shadow-size: 24px; --bro-row-height: 44px; --bro-header-height: 50px'
    });

    expect(await skinStyles(table)).toMatchObject({shadowSize: 24, rowHeight: 44});

    const geometry = await table.evaluate(el => {
      const host: DOMRect = el.getBoundingClientRect();
      const box = (selector: string) => {
        const rect: DOMRect = el.querySelector(selector)!.getBoundingClientRect();

        return {left: Math.round(rect.left - host.left), height: Math.round(rect.height)};
      };

      return {
        header: box('table.bro-table-header'),
        headerRow: box('table.bro-table-header tr'),
        toolbar: box('.bro-table-toolbar_container > :last-child'),
        body: box('.bro-table-body_container'),
        shadowPadding: getComputedStyle(el.querySelector('.bro-shadow')!).paddingLeft
      };
    });

    // The CSS of the skin takes the sizes of this table, not the numbers of the skin build
    expect(geometry.header.left).toBe(24);
    expect(geometry.toolbar.left).toBe(24);
    expect(geometry.shadowPadding).toBe('24px');
    expect(geometry.headerRow.height).toBe(50);
    expect(await rowHeights(table)).toEqual([44, 44, 44]);

    // The body holds a page of 5 rows and the shadows around it
    expect(geometry.body.height).toBe(5 * 44 + 2 * 24);
  });
}

test('the column width calculation takes the paddings of the cells', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});
  await page.addStyleTag({content: '#defect-table th.bro-header-cell, #defect-table td.bro-cell { padding: 0 10px 0 6px !important; }'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', debug: true}});

  const paddings = await table.evaluate(el => {
    const {model} = (el as DebugTable)[Symbol.for('table-bro:debug')];

    return {
      header: model.theadCols?.map((col: {paddings: number}) => col.paddings),
      body: model.tbodyCols?.map((col: {paddings: number}) => col.paddings)
    };
  });

  // The row counter, Name and Price columns
  expect(paddings).toEqual({header: [16, 16, 16], body: [16, 16, 16]});
});

test('the motion of a table shows its tracks and why they ended', async ({page}) => {
  const rows = Array.from({length: 12}, (_, i) => ({name: `row ${i + 1}`, price: i + 1}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat', debug: true}});

  await table.locator('button[aria-label="Next page"]').click();

  const running: string[] = await table.evaluate(el => (el as DebugTable)[Symbol.for('table-bro:debug')].motion.tracks().map((track: {label: string}) => track.label));

  expect(running).toContain('pagination');

  // A second click before the end replaces the scroll of the first one
  await table.locator('button[aria-label="Next page"]').click();

  const history = await table.evaluate(async el => {
    const {motion} = (el as DebugTable)[Symbol.for('table-bro:debug')];

    await motion.idle();

    return {
      running: motion.tracks().length,
      ends: motion.history.filter((end: {label: string}) => end.label === 'pagination').map((end: {reason: string}) => end.reason)
    };
  });

  expect(history).toEqual({running: 0, ends: ['replaced', 'done']});
});

test('prefers-reduced-motion: reduce turns a page change into a jump', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});

  const rows = Array.from({length: 12}, (_, i) => ({name: `row ${i + 1}`, price: i + 1}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat', debug: true}});

  expect((await skinStyles(table)).durationScale).toBe(0);

  await table.locator('button[aria-label="Next page"]').click();

  // The scroll draws its end at the first frame instead of after about 3 s
  const pagination = await table.evaluate(async el => {
    const {motion} = (el as DebugTable)[Symbol.for('table-bro:debug')];

    await motion.idle();

    return motion.history.filter((end: {label: string}) => end.label === 'pagination').map((end: {reason: string; duration: number}) => end);
  });

  expect(pagination).toHaveLength(1);
  expect(pagination[0].reason).toBe('done');
  expect(pagination[0].duration).toBeLessThan(100);
  await expect(rangeLabel(table)).toContainText('6 – 10 of 12');
});

test('a kinetic page change ends when less than half a pixel remains', async ({page}) => {
  const rows = Array.from({length: 12}, (_, i) => ({name: `row ${i + 1}`, price: i + 1}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'mat', debug: true}});

  await table.locator('button[aria-label="Next page"]').click();

  const pagination = await table.evaluate(async el => {
    const {motion} = (el as DebugTable)[Symbol.for('table-bro:debug')];

    await motion.idle();

    return motion.history.find((end: {label: string}) => end.label === 'pagination');
  });

  // 5 rows of 52 px: 260 * e^(-t / 280) < 0.5 from about 1.75 s, instead of 280 * ln(10^4), about 2.58 s
  expect(pagination?.reason).toBe('done');
  expect(pagination?.duration).toBeGreaterThan(1650);
  expect(pagination?.duration).toBeLessThan(2150);
  await expect(rangeLabel(table)).toContainText('6 – 10 of 12');
});

const skinRulesOnTheHost: [string, {padding: string; rowHeight: number}][] = [
  // The rows of bs and nv take the inset of their toolbar and paginator, 1.25rem
  ['nv', {padding: '20px', rowHeight: 40}],
  ['bs', {padding: '20px', rowHeight: 40}],
  ['mat', {padding: '24px', rowHeight: 52}]
];

for (const [skin, expected] of skinRulesOnTheHost) {
  test(`the rules of the ${skin} skin apply to a table without the skin class on an ancestor`, async ({page}) => {
    // The stand appends the table to the body: no ancestor has the class of the skin
    const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin}});

    const styles = await table.evaluate(el => {
      const cell = el.querySelector<HTMLElement>('table.bro-table:not(.bro-table-aux):not(.bro-table-header) tbody > tr[data-row-number] > td')!;

      return {
        ancestorWithSkin: !!el.parentElement!.closest(`.${el.className.split(' ')[0]}`),
        padding: getComputedStyle(cell).paddingLeft,
        cssRowHeight: getComputedStyle(el.querySelector<HTMLElement>('table.bro-table:not(.bro-table-aux):not(.bro-table-header) tr.bro-row')!).height
      };
    });

    expect(styles.ancestorWithSkin).toBe(false);
    expect(styles.padding).toBe(expected.padding);
    expect(parseFloat(styles.cssRowHeight)).toBe(expected.rowHeight);
  });
}

test('prefers-reduced-motion: reduce stops the decorative CSS motion of the skin', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv'}});

  // The arrow of a sort header turns and fades in with transitions
  const arrow = table.locator('.bro-sort-header-arrow').first();

  await expect(arrow).toHaveCSS('transition-duration', '0s');

  await page.emulateMedia({reducedMotion: 'no-preference'});
  await expect(arrow).toHaveCSS('transition-duration', '0.225s, 0.225s');
});

for (const skin of ['nv', 'bs']) {
  test(`a full width ${skin} table keeps its visible part and its shadows within the content`, async ({page}) => {
    await page.goto('/', {waitUntil: 'networkidle'});

    const bounds = await page.evaluate(async skin => {
      // A page without the CSS of the stand: an application may give every table a fixed width
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRule[];

        try {
          rules = Array.from(sheet.cssRules);
        } catch {
          continue;
        }

        for (let i = rules.length - 1; i >= 0; i--) {
          const rule = rules[i] as CSSStyleRule;

          if (rule.selectorText && /(^|,\s*)(app-main-demo |\.accordion-body )?table-bro(,|$)/.test(rule.selectorText) && rule.style.width) {
            sheet.deleteRule(i);
          }
        }
      }

      const measure = async (inContainer: boolean) => {
        const content = document.createElement('div');

        content.style.cssText = 'width: 800px; margin-left: 200px;';

        const parent = inContainer ? Object.assign(document.createElement('div'), {className: 'bro-table-shadow-container'}) : content;

        if (inContainer) {
          content.append(parent);
        }

        document.body.append(content);

        const el = document.createElement('table-bro') as DebugTable;

        el.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'a'}], conf: {skin}});
        parent.append(el);
        await new Promise(resolve => setTimeout(resolve, 300));

        const box = (node: Element) => {
          const rect = node.getBoundingClientRect();

          return [Math.round(rect.left), Math.round(rect.right)];
        };

        const result = {visible: box(el.querySelector('table.bro-table-header')!), shadows: box(el.querySelector('.bro-table-body_container')!)};

        content.remove();

        return result;
      };

      return {alone: await measure(false), inContainer: await measure(true)};
    }, skin);

    // Alone, the shadows fit into the content; in a container, the visible table lines up with the content
    expect(bounds.alone.shadows).toEqual([200, 1000]);
    expect(bounds.alone.visible).toEqual([248, 952]);
    expect(bounds.inContainer.visible).toEqual([200, 1000]);
  });
}

test('the mat skin styles only its tables, not the Material components of the page', () => {
  // The development mappings name the skin class mat
  const {css} = compile('packages/skins/angular-material/styles/table-bro.material.scss', {
    loadPaths: ['node_modules', 'packages/core/styles/mappings/development'],
    silenceDeprecations: ['import'],
    quietDeps: true
  });

  const selectors = Array.from(css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{};]+)\{/g))
    .flatMap(([, list]) => list.split(','))
    .map(selector => selector.trim().replace(/\s+/g, ' '))
    .filter(selector => !selector.startsWith('@') && !/^(from|to|[\d.]+%)$/.test(selector));

  // Nothing is global, also no stacking context for a Material background: the application gives it to its ancestor.
  // The scrim of a drawer is a Material element in the filter drawer container of the skin, its own component
  const own = (selector: string) => /\.mat(?![\w-])/.test(selector) || selector.startsWith('table-bro-filter-drawer-container-ng ');

  expect(selectors.filter(selector => !own(selector))).toEqual([]);
});

test('the dark theme of the nv skin gives its toolbar the dark border color of the skin', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', theme: 'dark'}});

  await expect(table).toHaveClass(/bro-dark-theme/);

  const colors = await table.evaluate(el => ({
    toolbar: getComputedStyle(el.querySelector('.bro-table-toolbar_container .bro-toolbar')!).borderBottomColor,
    navbar: getComputedStyle(el.querySelector('.bro-navbar')!).borderBottomColor
  }));

  // $bro-border-color-dark, which the navbar and the table of the dark theme draw their borders with
  expect(colors).toEqual({toolbar: 'rgb(73, 80, 87)', navbar: 'rgb(73, 80, 87)'});
});

for (const [skin, rowHeight, row] of [['native', '40px', '$bro-table-row-height'], ['bootstrap', '40px', '$bro-table-row-height'], ['material', '52px', '$bro-table-row-height']]) {
  test(`the ${skin} skin gives its variables and mixins without its CSS`, () => {
    const css = (configuration: string) => compileString(`
      @use "table-bro.${skin}.api" as bro${configuration};

      .custom {
        height: bro.${row};
        @include bro.bro-text-ellipsis-width('.custom-cell', 100px);
      }`, {
      loadPaths: ['packages/core/styles', 'packages/skins/angular-material/styles', 'packages/skins/bootstrap/styles', 'packages/skins/native/styles', 'packages/core/styles/mappings/development', 'node_modules'],
      silenceDeprecations: ['import'],
      quietDeps: true
    }).css;

    // Only the rules of the stylesheet itself: the API module prints nothing of the skin
    const selectors = Array.from(css('').matchAll(/([^{};]+)\{/g)).map(([, selector]) => selector.trim());

    expect(selectors).toEqual(['.custom', '.custom .custom-cell .bro-cell_component']);

    expect(css('')).toContain(`height: ${rowHeight}`);
    expect(css(` with (${row}: 44px)`)).toContain('height: 44px');
  });
}

test('the table keeps the classes of the application on its host and changes only its own', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const classes = await page.evaluate(() => {
    const el = document.createElement('table-bro') as DebugTable;
    const cols: BroCol<{name: string}>[] = [{title: 'Name', name: 'name'}];

    el.className = 'app-table';
    el.configure({cols, rows: [{name: 'a'}], conf: {skin: 'mat', theme: 'dark'}});
    document.body.append(el);

    const first = el.className;

    // A new configure with another skin and without a theme takes the classes of the last render away: the theme
    // follows the system, which is light here
    el.configure({cols, rows: [{name: 'a'}], conf: {skin: 'bs'}});

    const second = el.className;

    el.remove();

    return {first, second};
  });

  expect(classes.first.split(' ').sort()).toEqual(['app-table', 'bro-dark-theme', 'mat']);
  expect(classes.second.split(' ').sort()).toEqual(['app-table', 'bro-light-theme', 'bs']);
});

test('a table gets its own id outside a secure context, where crypto.randomUUID is missing', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const ids = await page.evaluate(() => {
    Object.defineProperty(window.crypto, 'randomUUID', {value: undefined, configurable: true});

    return [1, 2].map(() => {
      const el = document.createElement('table-bro') as DebugTable;

      el.configure({cols: [{title: 'Name', name: 'name'}], rows: [], conf: {skin: 'mat'}});

      return el.id;
    });
  });

  expect(ids[0]).toMatch(/^table-bro-[a-z0-9]+$/);
  expect(ids[1]).not.toBe(ids[0]);
});

test('a null value shows an empty cell', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: [{name: null, price: 1}, {name: 'b', price: 2}], config: {skin: 'mat', rowCounter: false}});

  await expect.poll(() => cellTexts(table, 2)).toEqual(['1', '2']);
  expect(await cellTexts(table, 1)).toEqual(['b']);
});

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin shows the titles of the columns and of the toolbar as text`, async ({page}) => {
    const table = await mountTable(page, {
      cols: [{title: '<b>Name</b> & co', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}],
      rows: priceRows,
      config: {skin, toolbarTitle: '<i>Prices</i>'}
    });

    await expect(table.locator('table.bro-table-header th').filter({hasText: '<b>Name</b> & co'})).toHaveCount(1);
    await expect(table.getByText('<i>Prices</i>', {exact: true})).toHaveCount(1);
    await expect(table.locator('b').filter({hasText: 'Name'})).toHaveCount(0);
    await expect(table.locator('i').filter({hasText: 'Prices'})).toHaveCount(0);
  });
}

test('the mat skin reads the tooltip of an HTML value without running its markup', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  // The element of the skin alone: Angular sanitizes the value that it shows, so only the reading of the tooltip could run the markup
  await page.evaluate(() => {
    const el = document.createElement('bro-mat-text-ellipsis') as HTMLElement & BroCellElement & {value: string};

    el.col = {title: 'Name', name: 'name', html: true};
    el.value = '<b>a long name</b><img src="nowhere.png" onerror="window.e2eRan = true">';
    document.body.append(el);
  });

  await expect(page.locator('bro-mat-text-ellipsis b')).toHaveText('a long name');

  // An image that cannot load runs its handler at once
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as E2EWindow).e2eRan)).toBeUndefined();
});

test('the CSS of the table gives its width transition only to its own cells', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});

  const transitions = await page.evaluate(() => {
    const other = document.createElement('table');

    other.innerHTML = '<tr><th>Title</th><td>Value</td></tr>';
    document.body.append(other);

    const result = [...other.querySelectorAll('th, td')].map(cell => getComputedStyle(cell).transitionProperty);

    other.remove();

    return result;
  });

  expect(transitions).toEqual(['all', 'all']);
  await expect(bodyTable(table).locator('td').first()).toHaveCSS('transition-property', 'width');
});

test('the mat skin takes the colors of the theme of the application', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});
  const row = bodyTable(table).locator('tbody > tr[data-row-number="1"]');

  // The theme of the stand: the background of the page and the outlines that the stand gives its mat tables
  await expect(row).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(row.locator('td').first()).toHaveCSS('border-bottom-color', 'rgba(0, 0, 0, 0.12)');

  // Another theme of the application, with its own outlines of mat-table
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--mat-table-background-color', 'rgb(1, 2, 3)');
    document.documentElement.style.setProperty('--mat-table-row-item-outline-color', 'rgb(4, 5, 6)');
  });

  await expect(row).toHaveCSS('background-color', 'rgb(1, 2, 3)');
  await expect(row.locator('td').first()).toHaveCSS('border-bottom-color', 'rgb(4, 5, 6)');
});

test('a mat table in the dark theme takes the dark scheme of the theme of the application', async ({page}) => {
  await page.emulateMedia({colorScheme: 'light'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat', theme: 'dark'}});

  // The dark scheme of the stand gives its mat tables the container surface of the theme, the header as the rows
  await expect(table).toHaveCSS('color-scheme', 'dark');
  await expect(bodyTable(table).locator('tbody > tr[data-row-number="1"]')).toHaveCSS('background-color', 'rgb(33, 31, 34)');
  await expect(table.locator('.bro-table-header_container > table')).toHaveCSS('background-color', 'rgb(33, 31, 34)');
});

test('a mat table on the dark page of the stand has one background for its header and its rows', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat'}});

  // The container surface of the dark scheme, above the dark background of the page
  await expect(table).toHaveCSS('color-scheme', 'dark');
  await expect(table.locator('.bro-table-header_container > table')).toHaveCSS('background-color', 'rgb(33, 31, 34)');
  await expect(bodyTable(table).locator('tbody > tr[data-row-number="1"]')).toHaveCSS('background-color', 'rgb(33, 31, 34)');
});

test('a table with its own light theme stays light on a dark page, and one with its own dark theme dark on a light page', async ({page}) => {
  // The dark page of the stand puts bro-dark-theme on body: the class of the table host overrides it
  await page.emulateMedia({colorScheme: 'dark'});

  const mat = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'mat', theme: 'light'}});

  await expect(mat).toHaveClass(/bro-light-theme/);
  await expect(mat).toHaveCSS('color-scheme', 'light');
  await expect(bodyTable(mat).locator('tbody > tr[data-row-number="1"]')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  const nv = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', theme: 'light'}});
  const nvRow = bodyTable(nv).locator('tbody > tr[data-row-number="1"]');

  await expect(nvRow).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(nvRow.locator('td').nth(1)).toHaveCSS('color', 'rgb(33, 37, 41)');

  // The light page: a table with its own dark theme has the text of the dark theme, not the one of the page
  await page.emulateMedia({colorScheme: 'light'});
  await nv.evaluate(el => (el as HTMLElement & {theme: string}).theme = 'dark');

  await expect(nv).toHaveClass(/bro-dark-theme/);
  await expect(nv).not.toHaveClass(/bro-light-theme/);
  await expect(nvRow).toHaveCSS('background-color', 'rgb(43, 48, 53)');
  await expect(nvRow.locator('td').nth(1)).toHaveCSS('color', 'rgb(222, 226, 230)');
});

test('a bs table gives Bootstrap in it the color mode of its theme, by default the one of the system', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'bs'}});
  const header = table.locator('.bro-table-header_container th').nth(1);

  // By default the table follows the dark system
  await expect(table).toHaveAttribute('data-bs-theme', 'dark');
  await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)');

  // The dark page of the stand has data-bs-theme="dark" on body: the table has the light mode of Bootstrap on its host
  await table.evaluate(el => (el as HTMLElement & {theme: string}).theme = 'light');

  await expect(table).toHaveAttribute('data-bs-theme', 'light');
  await expect(table).toHaveCSS('color-scheme', 'light');
  await expect(header).toHaveCSS('color', 'rgb(0, 0, 0)');

  await page.emulateMedia({colorScheme: 'light'});
  await table.evaluate(el => (el as HTMLElement & {theme: string}).theme = 'dark');

  await expect(table).toHaveAttribute('data-bs-theme', 'dark');
  await expect(header).toHaveCSS('color', 'rgb(255, 255, 255)');

  // Without the attribute the table follows the system again, which is light now
  await table.evaluate(el => (el as HTMLElement & {theme: string | null}).theme = null);

  await expect(table).toHaveAttribute('data-bs-theme', 'light');
  await expect(header).toHaveCSS('color', 'rgb(0, 0, 0)');
});

test('the rows of a class show and sort the values of its getters', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  // The page runs the class as it is: Playwright would turn its private field into helpers that the page lacks
  await page.evaluate(`
    document.querySelector('#defect-table')?.remove();

    class Product {
      #price;

      constructor(name, price) {
        this.name = name;
        this.#price = price;
      }

      get price() {
        return this.#price;
      }

      get label() {
        return this.name.toUpperCase() + ' for ' + this.#price;
      }
    }

    const el = document.createElement('table-bro');

    el.id = 'defect-table';
    el.configure({
      cols: [{title: 'Label', name: 'label'}, {title: 'Price', name: 'price', dataType: 'number'}],
      rows: [new Product('pear', 3), new Product('apple', 1), new Product('fig', 2)],
      conf: {skin: 'nv'}
    });
    document.body.append(el);
  `);

  const table = page.locator('table-bro#defect-table');
  const labels = bodyTable(table).locator('tbody > tr[data-row-number] > td:nth-child(2)');

  await expect(labels).toHaveText(['PEAR for 3', 'APPLE for 1', 'FIG for 2']);

  // The sort reads the getter of the price: the first click sorts from the highest
  await table.locator('thead th').nth(2).locator('bro-sort-header').click();
  await expect(labels).toHaveText(['PEAR for 3', 'FIG for 2', 'APPLE for 1']);
});

test('a toolbar without toolbarTitle shows no text and no tooltip undefined', async ({page}) => {
  for (const skin of ['bs', 'nv']) {
    const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin}});
    const toolbar = table.locator('.bro-table-toolbar_container');

    await expect(toolbar).toBeVisible();
    expect(await toolbar.innerText(), skin).not.toContain('undefined');
    expect(await table.locator('[title="undefined"]').count(), skin).toBe(0);
  }
});

test('the search of the toolbar keeps its classes in every skin, also as an Angular element', async ({page}) => {
  for (const skin of ['mat', 'bs', 'nv']) {
    const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin}});

    await table.locator('.bro-toolbar-button-search').first().click();

    const search = table.locator('.bro-table-toolbar_container > *').first();

    await expect(search, skin).toHaveClass(/\bbro-toolbar-search\b/);
    await expect(search, skin).toHaveClass(/\bbro-toolbar\b/);

    if (skin === 'mat') {
      await expect(search).toHaveClass(/\bmat-toolbar\b/);
    }
  }
});

test('opening and closing the search leaves no listener on the signal of the table', async ({page}) => {
  // The live abort listeners of every signal: a listener with its own signal leaves when that signal aborts
  await page.addInitScript(() => {
    const add = AbortSignal.prototype.addEventListener;
    const live = new WeakMap<AbortSignal, number>();

    (window as E2EWindow).e2eAbortListeners = (signal: AbortSignal) => live.get(signal) ?? 0;

    AbortSignal.prototype.addEventListener = function (this: AbortSignal, type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) {
      if (type === 'abort') {
        live.set(this, (live.get(this) ?? 0) + 1);

        if (options?.signal) {
          add.call(options.signal, 'abort', () => live.set(this, live.get(this)! - 1), {once: true});
        }
      }

      return add.call(this, type, listener, options);
    };
  });

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', debug: true}});
  const listeners = () => table.evaluate(el => (window as E2EWindow).e2eAbortListeners((el as DebugTable)[Symbol.for('table-bro:debug')].signal));

  await table.locator('.bro-toolbar-button-search').click();
  await table.locator('.bro-table-toolbar_container input').press('Escape');

  const after = await listeners();

  for (let index = 0; index < 5; index++) {
    await table.locator('.bro-toolbar-button-search').click();
    await table.locator('.bro-table-toolbar_container input').press('Escape');
  }

  expect(await listeners()).toBe(after);
});

test('a link button takes Space, and the links of a disabled paginator say so', async ({page}) => {
  // Two pages: the link of the next page works when the paginator is not disabled
  const rows = Array.from({length: 10}, (_, index) => ({name: `row ${index}`, price: index}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'nv', debug: true}});

  await table.locator('.bro-toolbar-button-search').click();

  // The clear button of the search line of the native skin is a link in the role of a button: with no search it closes the line
  const clear = table.locator('.bro-toolbar-clear a[role="button"]');

  await clear.focus();
  await page.keyboard.press(' ');
  await expect(table.locator('.bro-table-toolbar_container input')).toHaveCount(0);

  const paginator = table.locator('.bro-paginator');
  const next = paginator.getByRole('link', {name: 'Next page'});

  await expect(paginator).toHaveAttribute('aria-label', 'Pagination');

  await table.evaluate(el => (el as TableBroHTMLElement).setState('refreshing'));
  await expect(next).toHaveAttribute('aria-disabled', 'true');

  await table.evaluate(el => (el as TableBroHTMLElement).setState('idle'));
  await expect(next).not.toHaveAttribute('aria-disabled');
});

test('the texts of the config name the parts of the table in the language of the application', async ({page}) => {
  const texts = {
    rowCounter: 'Nr.', search: 'Suche', searchField: 'In der Tabelle suchen', back: 'Zurück', clear: 'Leeren', pagination: 'Seiten',
    pageNavigation: 'Seitennavigation', itemsPerPage: 'Zeilen pro Seite:', nextPage: 'Nächste Seite', next: 'Weiter',
    states: {'no-data': 'Keine Daten'}
  };
  const rows = Array.from({length: 1234}, (_, index) => ({name: `row ${index}`, price: index}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'nv', texts}});

  await expect(table.locator('thead th').first()).toContainText('Nr.');
  await expect(table.locator('.bro-paginator')).toHaveAttribute('aria-label', 'Seiten');
  await expect(table.locator('nav[aria-label="Seitennavigation"] a[aria-label="Nächste Seite"]')).toContainText('Weiter');
  await expect(table.locator('.bro-paginator-page-size-label')).toContainText('Zeilen pro Seite:');
  // The numbers of the range are formatted
  await expect(table.locator('.bro-paginator-range-label')).toHaveText('1 – 5 of 1,234');

  await table.locator('.bro-toolbar-button-search').click();
  await expect(table.locator('.bro-table-toolbar_container input')).toHaveAttribute('aria-label', 'In der Tabelle suchen');
  await expect(table.locator('.bro-toolbar-clear a')).toHaveAttribute('aria-label', 'Leeren');

  const empty = await mountTable(page, {cols: priceCols, rows: [], config: {skin: 'mat', texts}});

  await expect(empty.locator('.bro-state-message')).toHaveText('Keine Daten');
  await expect(empty.locator('.bro-toolbar-button-search')).toHaveAttribute('aria-label', 'Suche');
});

test('the vanilla filter drawer takes its title and the name of its close button from its texts', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(() => {
    const drawer = document.createElement('table-bro-filter-drawer-container') as BroFilterDrawerHTMLElement;

    drawer.id = 'e2e-drawer';
    drawer.setAttribute('skin', 'nv');
    document.body.append(drawer);
    drawer.texts = {filters: 'Filter', close: 'Schließen'};
  });

  const drawer = page.locator('#e2e-drawer');

  await expect(drawer.locator('.bro-filter-drawer-title')).toHaveText('Filter');
  await expect(drawer.locator('.bro-filter-drawer-header a[aria-label="Schließen"]')).toHaveCount(1);
});

test('screen readers hear the states of the table from its live region', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, config: {skin: 'nv', texts: {states: {'no-data': 'Nothing here'}}}});
  const live = table.locator('[role="status"].bro-live-status');

  await expect(live).toHaveText('Loading');
  await expect(live).toHaveCSS('position', 'absolute');

  await table.evaluate(el => (el as TableBroHTMLElement).replaceRows([]));
  await expect(live).toHaveText('Nothing here');

  await table.evaluate(el => (el as TableBroHTMLElement).replaceRows([{name: 'a', price: 1}]));
  await table.evaluate(el => (el as TableBroHTMLElement).setState('fail'));
  await expect(live).toHaveText('Failed');
});

test('the vanilla filter drawer takes the focus, closes on Escape and tells its button its state', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(() => {
    const drawer = document.createElement('table-bro-filter-drawer-container');
    const table = document.createElement('table-bro') as DebugTable;
    const filters = document.createElement('form');

    drawer.id = 'e2e-drawer';
    drawer.setAttribute('skin', 'nv');
    table.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'a'}], conf: {skin: 'nv'}});
    filters.setAttribute('slot', 'filters');
    filters.innerHTML = '<input name="name" aria-label="Name">';
    drawer.append(table, filters);
    document.body.append(drawer);
  });

  const drawer = page.locator('#e2e-drawer');
  const button = drawer.locator('table-bro .bro-table-toolbar_container a', {hasText: 'Filters'});
  const filters = drawer.locator('[slot="filters"]');

  // The filters are the named region of the drawer
  await expect(filters).toHaveAttribute('role', 'region');
  await expect(filters).toHaveAttribute('aria-label', 'Filters');

  await button.focus();
  await page.keyboard.press('Enter');

  await expect(drawer).toHaveAttribute('opened', '');
  await expect(filters.locator('input')).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(button).toHaveAttribute('aria-controls', (await filters.getAttribute('id'))!);

  await page.keyboard.press('Escape');

  await expect(drawer).not.toHaveAttribute('opened');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('the values of the config and of the columns stay text in the markup of the table', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(() => {
    document.querySelector('#defect-table')?.remove();

    const el = document.createElement('table-bro') as DebugTable;
    const markup = '<img src="x" class="e2e-injected">';

    el.id = 'defect-table';
    el.configure({
      cols: [{title: 'Name', name: 'name', className: 'e2e-name" data-injected="1'}, {title: 'Price', name: 'price', dataType: 'number'}],
      rows: [{name: 'a', price: 1}],
      conf: <BroConfig><unknown>{
        skin: 'nv',
        components: {toolbarMain: {buttons: [{title: markup, eventType: 'e2e'}, {title: 'More', mode: 'navbar-dropdown', options: [{title: markup, value: 'a" data-injected="1'}, {header: markup}]}]}}
      }
    });
    document.body.append(el);
  });

  const table = page.locator('table-bro#defect-table');

  await expect(bodyTable(table).locator('tbody > tr[data-row-number] > td').nth(1)).toBeVisible();
  // No markup and no attribute of the values came into the DOM: they are text
  expect(await table.locator('.e2e-injected, [data-injected]').count()).toBe(0);
  await expect(table.locator('.bro-table-toolbar_container')).toContainText('<img src="x" class="e2e-injected">');
  expect(await table.locator('option').evaluateAll(options => options.map(option => option.getAttribute('value')))).toContain('a" data-injected="1');
});

test('the bs progress of an unknown end has no values and draws its end at once without the time of motion', async ({page}) => {
  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'bs'}, hostStyle: '--bro-duration-scale: 0'});

  await table.evaluate(el => (el as TableBroHTMLElement).setState('refreshing'));

  const progress = table.locator('[role="progressbar"]').first();

  await expect(progress).toBeAttached();
  await expect(progress).not.toHaveAttribute('aria-valuenow');
  await expect(progress).not.toHaveAttribute('aria-valuemin');
  await expect(progress.locator('.progress-bar')).toHaveAttribute('style', /width: 100%/);
});

test('a native dropdown takes the attribute disabled before its render', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));

  await page.evaluate(() => {
    const dropdown = document.createElement('bro-nv-dropdown');

    dropdown.id = 'e2e-dropdown';
    dropdown.setAttribute('mode', 'select');
    dropdown.setAttribute('options', JSON.stringify([{value: '5', title: '5'}]));
    dropdown.setAttribute('disabled', 'true');
    document.body.append(dropdown);
  });

  await expect(page.locator('#e2e-dropdown select')).toBeDisabled();
  expect(errors).toEqual([]);

  await page.locator('#e2e-dropdown').evaluate(el => el.setAttribute('disabled', 'false'));
  await expect(page.locator('#e2e-dropdown select')).toBeEnabled();
});

test('the config gives the page sizes of the paginator and the delay of the search', async ({page}) => {
  const rows = Array.from({length: 7}, (_, index) => ({name: `row ${index}`, price: index}));
  const table = await mountTable(page, {cols: priceCols, rows, config: {skin: 'nv', pageSize: 3, pageSizeOptions: [3, 6, 9, 12], searchDebounce: 1000}});

  // The sizes up to the number of the rows and the first one above it
  expect(await table.locator('.bro-paginator select option:not([hidden])').evaluateAll(options => options.map(option => option.textContent?.trim()))).toEqual(['3', '6', '9']);

  await table.locator('.bro-toolbar-button-search').click();
  await table.locator('.bro-table-toolbar_container input').fill('row 5');

  // All the loaded rows are in the DOM: the search waits its delay before it leaves one
  await page.waitForTimeout(400);
  expect(await bodyTable(table).locator('tbody > tr[data-row-number]').count()).toBe(7);
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(1, {timeout: 3000});
});

test('a search typed just before the table is removed sends nothing after the removal', async ({page}) => {
  const errors: Error[] = [];

  page.on('pageerror', error => errors.push(error));

  const table = await mountTable(page, {cols: priceCols, rows: priceRows, config: {skin: 'nv', searchDebounce: 500}});

  await table.locator('.bro-toolbar-button-search').click();
  await table.locator('.bro-table-toolbar_container input').fill('a');

  const sent = await page.evaluate(() => {
    document.querySelector('#defect-table')!.remove();

    return (window as E2EWindow).e2eEvents.length;
  });

  // The timer of the search ends with the table
  await page.waitForTimeout(800);
  expect((await events(page)).slice(sent).map(event => event.action)).toEqual([]);
  expect(errors).toEqual([]);
});

test('a cell measures its value in its own font, not in the font of the page', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});
  // The page writes larger than the cells of the skin: a value measured outside the table would not fit its column
  await page.evaluate(() => document.body.style.font = '24px serif');

  const names = ['Ann', 'Bartholomew Alexander', 'Christopher Maximilian Montgomery', 'Dee'];
  const table = await mountTable(page, {cols: [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}], rows: names.map((name, price) => ({name, price})), config: {skin: 'mat'}});

  await expect.poll(() => cellTexts(table, 2)).toEqual(names);
  await expect(table.locator('.bro-cell_text-ellipsis')).toHaveCount(0);
});

test('a column fits its widest value, also a shorter one of wider letters', async ({page}) => {
  // The longer value has narrow letters: a column of its width would cut the shorter one of wide letters
  const names = ['iiiiiiiiiiiiiiiiiiii', 'WWWWWWWWWWWW'];
  const table = await mountTable(page, {cols: [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}], rows: names.map((name, price) => ({name, price})), config: {skin: 'nv'}});

  await expect.poll(() => cellTexts(table, 2)).toEqual(names);
  await expect(table.locator('.bro-cell_text-ellipsis')).toHaveCount(0);
});

for (const skin of ['nv', 'bs']) {
  test(`the ${skin} table breaks no Content Security Policy without 'unsafe-inline' for its styles`, async ({page}) => {
    const nonce = 'e2e-csp';
    const skinPackage = (skin === 'nv') ? 'native' : 'bootstrap';

    // A page of the vanilla builds of the packages under a strict policy: styles only from files and with the nonce
    await page.route('**/e2e-csp', route => route.fulfill({
      contentType: 'text/html',
      headers: {'content-security-policy': `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; img-src 'self' data:; font-src 'self' data:`},
      body: `<!doctype html>
        <html lang="en">
          <head>
            <link rel="stylesheet" href="/styles.css">
            <script nonce="${nonce}">
              window.e2eViolations = [];
              document.addEventListener('securitypolicyviolation', (event) => e2eViolations.push(event.effectiveDirective + ': ' + event.blockedURI + ' ' + event.sample));
            </script>
            <script src="/e2e-csp-bootstrap.js"></script>
            <script src="/e2e-csp-core.js"></script>
            <script src="/e2e-csp-skin.js"></script>
          </head>
          <body></body>
        </html>`
    }));
    await page.route('**/e2e-csp-bootstrap.js', route => route.fulfill({path: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'}));
    // The UMD builds of the core and of the skin, from the repository of Table, Bro next to this one
    await page.route('**/e2e-csp-core.js', route => route.fulfill({path: 'packages/core/dist/table-bro.umd.js'}));
    await page.route('**/e2e-csp-skin.js', route => route.fulfill({path: `packages/skins/${skinPackage}/dist/table-bro.${skinPackage}.umd.js`}));
    await page.goto('/e2e-csp', {waitUntil: 'networkidle'});

    await page.evaluate(({skin, nonce}) => {
      // The UMD build of the skin defines its tags with withTags()
      (<Record<string, {withTags(): void}>><unknown>window)[(skin === 'nv') ? 'TableBroNative' : 'TableBroBootstrap'].withTags();

      const el = document.createElement('table-bro') as DebugTable;

      el.id = 'csp-table';
      el.configure({
        cols: [{title: 'Name', name: 'name'}, {title: 'Tags', name: 'tags', component: {selector: `bro-${skin}-tags`}}],
        rows: [{name: 'b', tags: ['one', 'two']}, {name: 'a', tags: ['three']}, {name: 'c', tags: []}],
        conf: <BroConfig>{skin, title: 'Prices', pageSize: 2, styleNonce: nonce}
      });
      document.body.append(el);
    }, {skin, nonce});

    const table = page.locator('table-bro#csp-table');
    const row = bodyTable(table).locator('tbody > tr[data-row-number="1"]');

    await expect(row).toBeVisible();

    // The styles that the markup gave before come from properties of style and from the classes of the skins
    expect(await row.evaluate(el => el.style.height)).toMatch(/^\d+px$/);
    await expect(bodyTable(table).locator('thead')).toHaveCount(0);
    await expect(table.locator('.bro-toolbar-space')).toHaveCSS('flex-grow', '1');
    await expect(table.locator('.bro-sort-header-arrow .bro-button-icon').first()).toHaveCSS('display', 'inline-block');

    await table.locator('.bro-toolbar-button-search').click();
    await page.evaluate(() => (document.querySelector('#csp-table') as TableBroHTMLElement).setState('loading'));
    await expect(table.locator('[role="progressbar"], progress').first()).toBeAttached();

    expect(await page.evaluate(() => (window as E2EWindow).e2eViolations)).toEqual([]);
  });
}

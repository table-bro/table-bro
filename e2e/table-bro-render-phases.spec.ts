import type {BroErrorDetail, TableBroHTMLElement} from '@table-bro/core';

import {expect, test} from '@playwright/test';

import type {createContext}           from '../packages/core/shared/context';
import {bodyTable}                    from './table-bro.fixtures';
import {cellTexts, mount, tableState} from './table-bro.mount';

// The phases of one update of the table (BroController.update) and the failures in them.

/** The window of the page with the globals that the scripts of these tests set. */
type E2EWindow = typeof window & {
  e2eTable: TableBroHTMLElement;
  e2eFail: boolean;
  e2eErrors: BroErrorDetail[];
  e2ePageErrors: string[];
  e2eThrown: string;
  e2eBodies: number;
};

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

test('an exception of filtersTransform leaves the rows and the status of the table as they were', async ({page}) => {
  const pageErrors: string[] = [];

  page.on('pageerror', error => pageErrors.push(error.message));

  const table = await mount(page, `
    window.e2eFail = false;
    el.configure({cols, rows, conf: {skin: 'mat', debug: true, filtersTransform: (rows) => {
      if (window.e2eFail) {
        throw new Error('filtersTransform failed');
      }

      return rows;
    }}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  // A search runs the callback, which fails: the table keeps its rows, its filter and its status
  await table.evaluate(el => {
    (window as E2EWindow).e2eFail = true;
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-filter', data: {search: 'a'}}}));
  });

  await expect.poll(() => pageErrors).toContain('filtersTransform failed');
  expect(await tableState(table)).toEqual({status: 'idle', rows: 3, sourceRows: 3, filter: undefined});
  expect(await cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  // New rows during a load meet the same callback through the active filter: the load goes on, the old rows stay
  const thrown = await table.evaluate(el => {
    (window as E2EWindow).e2eFail = false;
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-filter', data: {search: 'a'}}}));

    (el as TableBroHTMLElement).setState('loading');

    (window as E2EWindow).e2eFail = true;

    try {
      (el as TableBroHTMLElement).replaceRows([{name: 'aa', price: 5}]);
    } catch (error) {
      return (error as Error).message;
    }

    return null;
  });

  expect(thrown).toBe('filtersTransform failed');
  expect(await tableState(table)).toMatchObject({status: 'loading', rows: undefined, sourceRows: undefined});
});

test('a synchronous answer to the load intent leaves the table idle', async ({page}) => {
  const table = await mount(page, `
    // The listener of the application is added before init, so it runs before the listener of the table
    el.addEventListener('bro-action', event => {
      if (event.detail.action === 'bro-filters-server-loaded') {
        const {page, pageSize} = event.detail.data;

        el.replaceRows([{name: 'found', price: 1}], {total: 1});
      }
    });

    el.configure({cols, rows: [{name: 'b', price: 3}], conf: {skin: 'mat', server: true, debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b']);

  await table.evaluate(el => {
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-filter', data: {search: 'f'}}}));
  });

  await expect.poll(() => cellTexts(table, 2)).toEqual(['found']);
  expect(await tableState(table)).toMatchObject({status: 'idle', rows: 1});
  await expect(table.locator('.bro-table-progress')).toHaveCount(0);
});

test('an exception in a cell is a failed render: the fail state and bro-error with render-failed', {tag: '@smoke'}, async ({page}) => {
  const pageErrors: string[] = [];

  page.on('pageerror', error => pageErrors.push(error.message));

  const table = await mount(page, `
    const failing = {title: 'Note', name: 'note', component: {attrs: {value: (col, row) => {
      if (row.name === 'a') {
        throw new Error('cell failed');
      }

      return 'ok';
    }}}};

    // The event bubbles: one listener of the page hears every table
    window.e2ePageErrors = [];
    document.addEventListener('bro-error', event => window.e2ePageErrors.push(event.detail.code), {once: true});

    el.configure({cols: [...cols, failing], rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect(table.locator('.bro-state-message')).toHaveText('Failed');
  expect(await bodyTable(table).locator('tbody > tr').count()).toBe(1);
  expect(await page.evaluate(() => (window as E2EWindow).e2eErrors)).toEqual([{code: 'render-failed', message: 'cell failed'}]);
  expect(await page.evaluate(() => (window as E2EWindow).e2ePageErrors)).toEqual(['render-failed']);
  expect(pageErrors).toContain('cell failed');
  expect(await tableState(table)).toMatchObject({status: 'idle', rows: undefined, sourceRows: undefined});
});

test('the calls before the first render wait for it, and a call before configure throws', async ({page}) => {
  const table = await mount(page, `
    try {
      el.replaceRows(rows);
    } catch (error) {
      window.e2eThrown = error.message;
    }

    // Configured and not connected yet: the table keeps the calls for its render
    el.configure({cols, conf: {skin: 'mat', debug: true}});
    el.replaceRows(rows.slice(0, 2));
    el.setState('refreshing');
    el.setState('idle');
    document.body.append(el);
  `);

  expect(await page.evaluate(() => (window as E2EWindow).e2eThrown)).toBe('[table-bro] replaceRows() before configure(): configure the table first.');
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(2);
  expect(await tableState(table)).toMatchObject({status: 'idle', rows: 2});
});

test('an exception while the details open is a failed render', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-failing-details')) {
      customElements.define('bro-e2e-failing-details', class extends HTMLElement {
        set row(row) {
          throw new Error('details failed');
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', debug: true, rowDetailsComponent: 'bro-e2e-failing-details'}});
    document.body.append(el);
  `);

  await bodyTable(table).locator('tr[data-row-number="1"]').getByRole('button', {name: 'Details'}).click();

  await expect(table.locator('.bro-state-message')).toHaveText('Failed');
  expect(await page.evaluate(() => (window as E2EWindow).e2eErrors)).toEqual([{code: 'render-failed', message: 'details failed'}]);
  await expect(table.locator('tr.bro-details_tr')).toHaveCount(0);
});

test('the refresh overlay follows the status also over a body rendered again', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  /** The opacity that the refresh gives the cells of the body once the animations end: empty without the refresh. */
  const overlay = () => table.evaluate(async el => {
    await (el as E2EDebugTable)[Symbol.for('table-bro:debug')].motion.idle();

    return el.querySelector('style[data-bro-refresh]')?.textContent ? getComputedStyle(el.querySelector('.bro-table-body > table:not(.bro-table-aux) > tbody > tr > td')!).opacity : '';
  });

  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('refreshing'));
  expect(await overlay()).toBe('0.5');

  // A local sort during the refresh renders a new body, which gets the overlay of the refresh
  await table.evaluate(el => {
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-sort', data: {sortKey: 'price', sortDirection: 'asc'}}}));
  });

  await expect.poll(() => cellTexts(table, 2)).toEqual(['a', 'c', 'b']);
  expect(await overlay()).toBe('0.5');
  expect((await tableState(table)).status).toBe('refreshing');

  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('idle'));
  expect(await overlay()).toBe('');
  expect((await tableState(table)).status).toBe('idle');
  await expect(table.locator('.bro-table-progress')).toHaveCount(0);
});

test('rows from configure render the body once', async ({page}) => {
  const table = await mount(page, `
    window.e2eBodies = 0;

    // Every body container that enters the table, the first one included
    new MutationObserver(records => {
      for (const record of records) {
        window.e2eBodies += [...record.addedNodes].filter(node => node.classList?.contains('bro-table-body_container')).length;
      }
    }).observe(el, {childList: true, subtree: true});

    el.configure({cols, rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  expect(await page.evaluate(() => (window as E2EWindow).e2eBodies)).toBe(1);
});

test('a new body after the first one builds no aux header', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  const auxHeaders = await table.evaluate(el => {
    let headers = 0;

    // The aux header rows that enter the table; the header of the visible table keeps its row
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of Array.from(record.addedNodes)) {
          if (node instanceof Element) {
            headers += [node, ...Array.from(node.querySelectorAll('*'))].filter(child => child.matches('table.bro-table-aux > thead')).length;
          }
        }
      }
    });

    observer.observe(el, {childList: true, subtree: true});

    (window as E2EWindow).e2eTable.replaceRows([{name: 'x', price: 1}, {name: 'y', price: 2}]);
    (window as E2EWindow).e2eTable.replaceRows([{name: 'z', price: 3}]);

    observer.disconnect();

    return headers;
  });

  expect(auxHeaders).toBe(0);
  expect(await cellTexts(table, 2)).toEqual(['z']);
});

for (const server of [false, true]) {
  test(`the cells of 1000 ${server ? 'appended' : 'new'} rows are measured in one layout`, {tag: !server ? '@smoke' : []}, async ({browserName, page}) => {
    test.skip(browserName !== 'chromium', 'LayoutCount is a metric of the DevTools Protocol of Chromium');

    const table = await mount(page, `
      el.configure({cols, rows: [{name: 'first', price: 0}], conf: {skin: 'mat', server: ${server}}});
      document.body.append(el);
      window.e2eTable = el;
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['first']);

    const session = await page.context().newCDPSession(page);

    await session.send('Performance.enable');

    const layouts = async (): Promise<number> => {
      const {metrics} = await session.send('Performance.getMetrics');

      return metrics.find(metric => metric.name === 'LayoutCount')!.value;
    };

    const before = await layouts();

    await page.evaluate(server => {
      const rows = Array.from({length: 1000}, (_, i) => ({name: `row ${i + 1} with a name that is long enough`, price: i}));
      const table = (window as E2EWindow).e2eTable;

      if (server) {
        table.appendRows(rows, {total: 1001});
      } else {
        table.replaceRows(rows);
      }
    }, server);

    const count = await layouts() - before;

    console.log(`layouts for 1000 ${server ? 'appended' : 'new'} rows: ${count}`);
    expect(count).toBeLessThan(10);
  });
}

test('a table whose first render failed takes good rows from replaceRows', async ({page}) => {
  const table = await mount(page, `
    const failing = {title: 'Note', name: 'note', component: {attrs: {value: (col, row) => {
      if (row.name === 'a') {
        throw new Error('cell failed');
      }

      return 'ok';
    }}}};

    el.configure({cols: [...cols, failing], rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect(table.locator('.bro-state-message')).toHaveText('Failed');
  await expect(table.locator('button[aria-label="Next page"]')).toBeAttached();

  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows([{name: 'x', price: 1}, {name: 'y', price: 2}]));

  await expect.poll(() => cellTexts(table, 2)).toEqual(['x', 'y']);
  expect((await page.evaluate(() => (window as E2EWindow).e2eErrors)).map((error: {code: string}) => error.code)).toEqual(['render-failed']);
});

test('a handler of the window error that gives new rows finds a table that takes them', async ({page}) => {
  const table = await mount(page, `
    const failing = {title: 'Note', name: 'note', component: {attrs: {value: (col, row) => {
      if (row.name === 'a') {
        throw new Error('cell failed');
      }

      return 'ok';
    }}}};

    // The application retries with other rows when it sees the error
    window.addEventListener('error', () => el.replaceRows([{name: 'x', price: 1}]), {once: true});

    el.configure({cols: [...cols, failing], rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['x']);
});

test('appendRows of a table without rows changes nothing and throws nothing', async ({page}) => {
  const pageErrors: string[] = [];

  page.on('pageerror', error => pageErrors.push(error.message));

  const table = await mount(page, `
    el.configure({cols, conf: {skin: 'mat', server: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  const append = () => page.evaluate(() => {
    try {
      (window as E2EWindow).e2eTable.appendRows([{name: 'z', price: 9}], {total: 6});

      return '';
    } catch (error) {
      return (error as Error).message;
    }
  });

  // While the table loads, and after setState('fail') shows the fail state
  expect(await append()).toBe('');

  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('fail'));
  await expect(table.locator('.bro-state-message')).toHaveText('Failed');

  expect(await append()).toBe('');
  await expect(table.locator('.bro-state-message')).toHaveText('Failed');
  expect(pageErrors).toEqual([]);
});

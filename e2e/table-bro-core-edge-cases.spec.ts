import type {BroActionDetail, BroErrorDetail, TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, type Page, test} from '@playwright/test';

import type {createContext} from '../packages/core/shared/context';
import {bodyTable}          from './table-bro.fixtures';
import {cellTexts, mount}   from './table-bro.mount';

// Edge cases of the core: appendRows of the local mode under a search and a sort, a failed loading of server details,
// the progress of server details under open details, the clicks during a refresh.

/** The window of the page with the globals that the scripts of these tests set. */
type E2EWindow = typeof window & {
  e2eTable: TableBroHTMLElement;
  e2eErrors: BroErrorDetail[];
  e2eEvents: BroActionDetail[];
};

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

/** A local table of the rows a, b, c, d of the names and prices, five rows on a page. */
async function mountLocal(page: Page): Promise<Locator> {
  const table = await mount(page, `
    const four = [{id: 1, name: 'a1', price: 4}, {id: 2, name: 'b1', price: 3}, {id: 3, name: 'a2', price: 2}, {id: 4, name: 'b2', price: 1}];

    el.configure({cols, rows: four, conf: {skin: 'mat', rowCounter: false}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 1)).toEqual(['a1', 'b1', 'a2', 'b2']);

  return table;
}

function act(table: Locator, action: string, data: unknown): Promise<void> {
  return table.evaluate((el, {action, data}) => {
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action, data}}));
  }, {action, data});
}

function appendRows(table: Locator): Promise<void> {
  return table.evaluate(() => (window as E2EWindow).e2eTable.appendRows([{id: 5, name: 'a3', price: 0}, {id: 6, name: 'b3', price: 5}], {total: 6}));
}

test('appendRows of the local mode shows the new rows through the search', async ({page}) => {
  const table = await mountLocal(page);

  await act(table, 'bro-filters-filter', {search: 'a'});
  await expect.poll(() => cellTexts(table, 1)).toEqual(['a1', 'a2']);

  await appendRows(table);

  await expect.poll(() => cellTexts(table, 1)).toEqual(['a1', 'a2', 'a3']);
  expect(await page.evaluate(() => (window as E2EWindow).e2eErrors)).toEqual([]);

  // The search cleared shows all the rows, the new ones too
  await act(table, 'bro-filters-filter', {search: ''});
  await expect.poll(() => cellTexts(table, 1)).toEqual(['a1', 'b1', 'a2', 'b2', 'a3', 'b3']);
});

test('appendRows of the local mode puts the new rows in the order of the sort', async ({page}) => {
  const table = await mountLocal(page);

  await act(table, 'bro-filters-sort', {sortKey: 'price', sortDirection: 'asc'});
  await expect.poll(() => cellTexts(table, 1)).toEqual(['b2', 'a2', 'b1', 'a1']);

  await appendRows(table);

  await expect.poll(() => cellTexts(table, 1)).toEqual(['a3', 'b2', 'a2', 'b1', 'a1', 'b3']);

  // The next sort starts from the order that the table shows
  await act(table, 'bro-filters-sort', {sortKey: 'price', sortDirection: 'desc'});
  await expect.poll(() => cellTexts(table, 1)).toEqual(['b3', 'a1', 'b1', 'a2', 'b2', 'a3']);
  expect(await page.evaluate(() => (window as E2EWindow).e2eErrors)).toEqual([]);
});

test('server details whose loading failed end it closed and load again at the next opening', async ({page}) => {
  const table = await mount(page, `
    // The first loading fails, the second one loads
    window.e2eDetailsLoads = 0;

    if (!customElements.get('bro-e2e-failing-details')) {
      customElements.define('bro-e2e-failing-details', class extends HTMLElement {
        connectedCallback() {
          if (this.loading) {
            return;
          }

          this.loading = true;
          const failed = (window.e2eDetailsLoads++ === 0);

          setTimeout(() => {
            this.innerHTML = '<div style="height: 60px">Server details</div>';
            this.dispatchEvent(new CustomEvent(failed ? 'bro-details-server-failed' : 'bro-details-server-loaded', {detail: failed ? undefined : 1}));
          }, 300);
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-failing-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  const row = bodyTable(table).locator('tbody > tr[data-row-number]').nth(1);
  const button = row.getByRole('button', {name: 'Details'});
  const auxTable = table.locator('table.bro-table-aux');

  await button.click();
  await expect(row).toHaveAttribute('data-action', 'expand');

  // The failure: no progress, no loading, the button closed, and the application gets the action
  await expect(row).not.toHaveAttribute('data-action');
  await expect(auxTable.locator('bro-e2e-failing-details')).toHaveCount(0);
  await expect.poll(() => auxTable.locator('tbody > tr td > *').count()).toBe(0);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => (window as E2EWindow).e2eEvents.map((event: BroActionDetail) => event.action))).toContain('bro-details-server-failed');

  // The next opening loads them again
  await button.click();
  await expect(bodyTable(table).locator('tr.bro-details_tr bro-e2e-failing-details')).toBeVisible();
});

test('the progress of server details under open details lies over its row', async ({page}) => {
  const table = await mount(page, `
    // The details of the row c never end their loading, the others load at once
    if (!customElements.get('bro-e2e-slow-details')) {
      customElements.define('bro-e2e-slow-details', class extends HTMLElement {
        connectedCallback() {
          if (this.row.name === 'c' || this.innerHTML) {
            return;
          }

          this.innerHTML = '<div style="height: 60px">Server details</div>';
          this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', debug: true, rowDetailsComponent: 'bro-e2e-slow-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.durationScale = 1);

  const rowOf = (name: string) => bodyTable(table).locator('tbody > tr[data-row-number]').filter({has: page.getByText(name, {exact: true})});

  await rowOf('b').getByRole('button', {name: 'Details'}).click();
  await expect(bodyTable(table).locator('tr.bro-details_tr bro-e2e-slow-details')).toBeVisible();
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.idle());

  await rowOf('c').getByRole('button', {name: 'Details'}).click();

  // One aux row for each row, and the progress of the row c within the box of the row c
  const auxRows = table.locator('table.bro-table-aux > tbody > tr[data-row-number]');
  const progress = auxRows.nth(2).locator('td > :not(bro-e2e-slow-details)').first();

  await expect(auxRows).toHaveCount(3);
  await expect(progress).toBeAttached();

  const rowBox = (await rowOf('c').boundingBox())!;
  const progressBox = (await progress.boundingBox())!;

  expect(progressBox.y).toBeGreaterThanOrEqual(rowBox.y - 1);
  expect(progressBox.y + progressBox.height).toBeLessThanOrEqual(rowBox.y + rowBox.height + 1);
});

test('the cells of a body that refreshes take no clicks', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-refresh-details')) {
      customElements.define('bro-e2e-refresh-details', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div style="height: 60px">Details</div>';
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-refresh-details'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  await table.evaluate(() => (window as E2EWindow).e2eTable.setState('refreshing'));

  const button = bodyTable(table).locator('tbody > tr[data-row-number="1"]').getByRole('button', {name: 'Details'});

  await expect(button.locator('xpath=ancestor::td')).toHaveCSS('pointer-events', 'none');
  await button.click({force: true});
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(0);

  // The end of the refresh gives the clicks back
  await table.evaluate(() => (window as E2EWindow).e2eTable.setState('idle'));
  await expect(button.locator('xpath=ancestor::td')).toHaveCSS('pointer-events', 'auto');
  await button.click();
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);
});

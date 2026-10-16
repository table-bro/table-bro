import type {BroErrorDetail, BroRowDetailsElement, TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, type Page, test} from '@playwright/test';

import type {createContext} from '../packages/core/shared/context';
import {bodyTable}          from './table-bro.fixtures';
import {cellTexts, mount}   from './table-bro.mount';

// The slots of the rows: rows kept by their keys and open details that stay with their rows.

/** The window of the page with the globals that the scripts of these tests set. */
type E2EWindow = typeof window & {
  e2eTable: TableBroHTMLElement;
  e2eErrors: BroErrorDetail[];
  e2eLoad: () => void;
};

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

/** A body row that a test marked to find it again after a render. */
interface E2EMarkedRow extends HTMLElement {
  e2eMark?: boolean;
}

/** Twelve rows with ids, different prices and a column of details buttons; the details have a fixed height. */
function slotsTable(): string {
  return `
    if (!customElements.get('bro-e2e-slot-details')) {
      customElements.define('bro-e2e-slot-details', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div style="height: 60px">Details</div>';
        }
      });
    }

    const twelve = Array.from({length: 12}, (_, i) => ({id: i + 1, name: 'row ' + (i + 1), price: (i * 7) % 12}));
    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows: twelve, conf: {skin: 'mat', debug: true, rowDetailsComponent: 'bro-e2e-slot-details'}});
    document.body.append(el);
    window.e2eTable = el;`;
}

/** The names of the rows of the first page: the body keeps the rows of all pages. */
async function firstPage(table: Locator): Promise<string[]> {
  return (await cellTexts(table, 2)).slice(0, 5);
}

async function mountSlots(page: Page): Promise<Locator> {
  const table = await mount(page, slotsTable());

  await expect.poll(() => firstPage(table)).toEqual(['row 1', 'row 2', 'row 3', 'row 4', 'row 5']);

  // The debug config slows the animations down; the checks wait for their ends
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.durationScale = 1);

  return table;
}

function idle(table: Locator): Promise<void> {
  return table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.idle());
}

/** The row of the body table with the name. */
function row(table: Locator, name: string): Locator {
  return bodyTable(table).locator('tbody > tr[data-row-number]').filter({has: table.page().getByText(name, {exact: true})});
}

function sortByPrice(table: Locator): Promise<void> {
  return table.locator('table.bro-table-header th[data-bro-column-key="price"] .bro-sort-header > *').first().click();
}

/** The layers of the body: the rows of the body table, of the aux table and the shadows, as kinds and numbers in their order. */
function layers(table: Locator): Promise<{body: string[]; aux: string[]; shadows: string[]; height: string}> {
  return table.evaluate(el => {
    const kind = (node: Element) => {
      if (node.classList.contains('bro-details_tr')) {
        return 'details';
      }

      return node.classList.contains('bro-details_island-space') ? 'space' : 'row';
    };

    const list = (parent: Element) => Array.from(parent.children).map(node => `${kind(node)} ${node.getAttribute('data-row-number') || ''}`.trim());
    const auxBodies = el.querySelectorAll('table.bro-table-aux > tbody');

    return {
      body: list(el.querySelector('table.bro-table:not(.bro-table-aux):not(.bro-table-header) > tbody')!),
      aux: list(auxBodies[auxBodies.length - 1]),
      shadows: list(el.querySelector('.bro-table-shadows')!),
      height: (el.querySelector('.bro-table-body_container') as HTMLElement).style.height
    };
  });
}

test('open details stay with their row through a sort, which moves the rows without rendering them again', async ({page}) => {
  const table = await mountSlots(page);

  await row(table, 'row 2').getByRole('button', {name: 'Details'}).click();
  await idle(table);

  const before = await layers(table);

  // The elements of the rows get a mark: a moved row keeps it
  await bodyTable(table).locator('tbody > tr[data-row-number]').evaluateAll(rows => rows.forEach(tr => (tr as E2EMarkedRow).e2eMark = true));

  await sortByPrice(table);
  await expect.poll(() => firstPage(table)).toEqual(['row 6', 'row 11', 'row 4', 'row 9', 'row 2']);
  await idle(table);

  const details = bodyTable(table).locator('tr.bro-details_tr');

  await expect(details).toHaveCount(1);
  await expect(details).toHaveAttribute('data-row-number', '5');
  expect(await details.evaluate(tr => tr.previousElementSibling?.querySelector('td:nth-child(2)')?.textContent?.trim())).toBe('row 2');
  await expect(row(table, 'row 2').getByRole('button', {name: 'Details'})).toHaveAttribute('aria-expanded', 'true');

  expect(await bodyTable(table).locator('tbody > tr[data-row-number]').evaluateAll(rows => rows.filter(tr => (tr as E2EMarkedRow).e2eMark).length)).toBe(13);

  // The shadows follow the rows, and the aux table has rows only for server details; the open details on the page
  // keep the height of the body
  const after = await layers(table);
  const rowsOf = (list: string[]) => list.filter(item => item.startsWith('row')).slice(0, 12);

  expect(rowsOf(after.body)).toEqual(Array.from({length: 12}, (_, i) => `row ${i + 1}`));
  expect(after.aux).toEqual([]);
  expect(after.height).toBe(before.height);

  // A table without Island Details has one shadow along the page
  expect(after.shadows).toEqual(['row']);
  expect(after.body.filter(item => item.startsWith('space'))).toEqual([]);
});

test('a search and replaceRows with the same ids keep the open details; rows with other ids close them', async ({page}) => {
  const table = await mountSlots(page);
  const details = bodyTable(table).locator('tr.bro-details_tr');

  await row(table, 'row 3').getByRole('button', {name: 'Details'}).click();
  await expect(details).toHaveCount(1);

  await table.locator('.bro-toolbar-button-search').click();
  await table.getByRole('textbox', {name: 'Search in table'}).fill('row 3');
  await expect.poll(() => cellTexts(table, 2)).toEqual(['row 3']);
  await expect(details).toHaveAttribute('data-row-number', '1');

  await page.keyboard.press('Escape');
  await expect.poll(() => firstPage(table)).toEqual(['row 1', 'row 2', 'row 3', 'row 4', 'row 5']);
  await expect(details).toHaveAttribute('data-row-number', '3');

  // New row objects with the same ids: the row renders again with its new values, and its details stay open with it
  await page.evaluate(() => {
    const renamed = Array.from({length: 12}, (_, i) => ({id: i + 1, name: 'new ' + (i + 1), price: (i * 7) % 12}));

    (window as E2EWindow).e2eTable.replaceRows(renamed);
  });

  await expect.poll(() => firstPage(table)).toEqual(['new 1', 'new 2', 'new 3', 'new 4', 'new 5']);
  await expect(details).toHaveCount(1);
  expect(await details.evaluate(tr => tr.previousElementSibling?.querySelector('td:nth-child(2)')?.textContent?.trim())).toBe('new 3');
  expect(await details.evaluate(tr => (tr.querySelector('bro-e2e-slot-details') as BroRowDetailsElement).row?.['name'])).toBe('new 3');

  const button = row(table, 'new 3').locator('bro-details-button');

  await expect(button.getByRole('button', {name: 'Details'})).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => button.evaluate(el => Array.from(el.querySelectorAll<HTMLElement>('*')).find(node => node.style.transform)?.style.transform)).toBe('rotate(180deg)');

  // Other ids are other rows
  await page.evaluate(() => {
    const others = Array.from({length: 12}, (_, i) => ({id: i + 101, name: 'other ' + (i + 1), price: i}));

    (window as E2EWindow).e2eTable.replaceRows(others);
  });

  await expect.poll(() => firstPage(table)).toEqual(['other 1', 'other 2', 'other 3', 'other 4', 'other 5']);
  await expect(details).toHaveCount(0);
});

test('a kept row measures again only the values that changed', async ({page}) => {
  const table = await mountSlots(page);
  const reads: number[] = [];

  // With config.debug every update logs its reads: the measurement of the columns, then one for each measured value
  page.on('console', async message => {
    if (message.type() === 'debug' && message.text().startsWith('[table-bro] update')) {
      const [, reason, summary] = await Promise.all(message.args().map(arg => arg.jsonValue()));

      if (reason === 'onReplaceRows') {
        reads.push(summary.reads);
      }
    }
  });

  const replaceRows = (prefix: string) => page.evaluate(prefix => {
    const rows = Array.from({length: 12}, (_, i) => ({id: i + 1, name: prefix + (i + 1), price: (i * 7) % 12}));

    (window as E2EWindow).e2eTable.replaceRows(rows);
  }, prefix);

  // The same values in new row objects: the columns are measured, the values are not
  await replaceRows('row ');
  await expect.poll(() => reads.length).toBe(1);

  // New names: the twelve names are measured, the prices are not
  await replaceRows('new ');
  await expect.poll(() => reads.length).toBe(2);
  await expect.poll(() => firstPage(table)).toEqual(['new 1', 'new 2', 'new 3', 'new 4', 'new 5']);

  expect(reads).toEqual([1, 13]);
});

test('server details that report their loading twice open once and keep the table working', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-twice-details')) {
      customElements.define('bro-e2e-twice-details', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div style="height: 60px">Server details</div>';

          // A component that loads again, for example for a new row object, reports the end of its loading once more
          setTimeout(() => {
            this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
            this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
          }, 50);
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-twice-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  await row(table, 'a').getByRole('button', {name: 'Details'}).click();

  // Screen readers hear the loading of the details, whose progress lies in the aux table
  await expect(table.locator('[role="status"].bro-live-status')).toHaveText('Loading details');
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);
  await page.waitForTimeout(500);

  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);
  expect(await page.evaluate(() => (window as E2EWindow).e2eErrors)).toEqual([]);
  expect(await cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
});

test('a state after open details fills the body that keeps their height', async ({page}) => {
  const table = await mountSlots(page);

  // The body minus the row of the state: the space of the shadows around the body
  const gap = () => table.evaluate(el => {
    const container = el.querySelector<HTMLElement>('.bro-table-body_container')!;
    const state = el.querySelector<HTMLElement>('table.bro-table:not(.bro-table-aux):not(.bro-table-header) > tbody > tr')!;

    return parseFloat(container.style.height) - parseFloat(state.style.height);
  });

  await table.locator('.bro-toolbar-button-search').click();

  const search = table.getByRole('textbox', {name: 'Search in table'});

  await search.fill('nothing');
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(0);
  await idle(table);

  const withoutDetails = await gap();

  await search.fill('');
  await expect.poll(() => firstPage(table)).toEqual(['row 1', 'row 2', 'row 3', 'row 4', 'row 5']);

  await row(table, 'row 2').getByRole('button', {name: 'Details'}).click();
  await idle(table);

  await search.fill('nothing');
  await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(0);
  await idle(table);

  expect(await gap()).toBe(withoutDetails);
});

test('the next page starts at the top of the window after open details with the border of their cell', async ({page}) => {
  const table = await mountSlots(page);

  // The top of a row in the window of the body
  const top = (name: string) => row(table, name).evaluate(tr => tr.getBoundingClientRect().top - tr.closest('.bro-table-body_container')!.getBoundingClientRect().top);
  const next = table.locator('button[aria-label="Next page"]');

  await next.click();
  await idle(table);

  const withoutDetails = await top('row 6');

  await table.locator('button[aria-label="Previous page"]').click();
  await idle(table);

  await row(table, 'row 5').getByRole('button', {name: 'Details'}).click();
  await idle(table);

  await next.click();
  await idle(table);

  expect(await top('row 6')).toBe(withoutDetails);
});

test('server details that load after a page change keep the page in its place and stay hidden from screen readers', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-late-details')) {
      customElements.define('bro-e2e-late-details', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div style="height: 60px">Server details</div>';

          // The test ends the loading when it wants
          window.e2eLoad = () => this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
        }
      });
    }

    const twelve = Array.from({length: 12}, (_, i) => ({id: i + 1, name: 'row ' + (i + 1), price: i}));
    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows: twelve, conf: {skin: 'mat', debug: true, rowDetailsComponent: 'bro-e2e-late-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => firstPage(table)).toEqual(['row 1', 'row 2', 'row 3', 'row 4', 'row 5']);
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.durationScale = 1);

  // The top of a row in the window of the body
  const top = (name: string) => row(table, name).evaluate(tr => tr.getBoundingClientRect().top - tr.closest('.bro-table-body_container')!.getBoundingClientRect().top);

  await row(table, 'row 5').getByRole('button', {name: 'Details'}).click();
  await table.locator('button[aria-label="Next page"]').click();
  await idle(table);

  const before = await top('row 6');

  await page.evaluate(() => (window as E2EWindow).e2eLoad());
  await idle(table);

  expect(await top('row 6')).toBe(before);
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveAttribute('aria-hidden', 'true');
});

test('details that open in the frame of a page change leave the next page its own height', async ({page}) => {
  const table = await mountSlots(page);
  const height = () => table.evaluate(el => (el.querySelector('.bro-table-body_container') as HTMLElement).style.height);
  const before = await height();
  const button = await row(table, 'row 5').getByRole('button', {name: 'Details'}).elementHandle();
  const next = await table.locator('button[aria-label="Next page"]').elementHandle();

  // Two clicks in one task, as a program gives them: the page changes before the first frame of the opening
  await page.evaluate(([details, next]) => {
    (details as HTMLElement).click();
    (next as HTMLElement).click();
  }, [button, next]);
  await idle(table);

  expect(await height()).toBe(before);
});

test('open details stay with their row through a sort when two rows share an id', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-slot-details')) {
      customElements.define('bro-e2e-slot-details', class extends HTMLElement {
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
    const shared = [{id: 7, name: 'first', price: 1}, {id: 7, name: 'second', price: 2}];

    el.configure({cols: [...cols, details], rows: shared, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-slot-details'}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['first', 'second']);

  await row(table, 'first').getByRole('button', {name: 'Details'}).click();
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);

  // Descending by price: the second row comes first
  await sortByPrice(table);
  await expect.poll(() => cellTexts(table, 2)).toEqual(['second', 'first']);

  const details = bodyTable(table).locator('tr.bro-details_tr');

  await expect(details).toHaveCount(1);
  expect(await details.evaluate(tr => tr.previousElementSibling?.querySelector('td:nth-child(2)')?.textContent?.trim())).toBe('first');
});

test('a value measured while the table was hidden is measured again once it shows', async ({page}) => {
  const table = await mountSlots(page);
  const reads: number[] = [];

  page.on('console', async message => {
    if (message.type() === 'debug' && message.text().startsWith('[table-bro] update')) {
      const [, reason, summary] = await Promise.all(message.args().map(arg => arg.jsonValue()));

      if (reason === 'onReplaceRows') {
        reads.push(summary.reads);
      }
    }
  });

  // The display changes in the same task as replaceRows, before the observer of the width of the table sees it
  const replaceRows = (display: string) => table.evaluate((el, display) => {
    const rows = Array.from({length: 12}, (_, i) => ({id: i + 1, name: 'new ' + (i + 1), price: (i * 7) % 12}));

    (el as HTMLElement).style.display = display;
    (window as E2EWindow).e2eTable.replaceRows(rows);
  }, display);

  // New names while hidden measure nothing, then the same names while visible are measured
  await replaceRows('none');
  await replaceRows('');

  await expect.poll(() => reads.length).toBe(2);
  expect(reads[1]).toBe(13);
});

test('server details that end their loading as soon as they connect show at once', {tag: '@smoke'}, async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-instant-details')) {
      customElements.define('bro-e2e-instant-details', class extends HTMLElement {
        connectedCallback() {
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

    el.configure({cols: [...cols, details], rows, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-instant-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  await row(table, 'a').getByRole('button', {name: 'Details'}).click();

  await expect(bodyTable(table).locator('tr.bro-details_tr bro-e2e-instant-details')).toBeVisible();
});

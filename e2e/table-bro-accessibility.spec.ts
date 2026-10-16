import type {BroActionDetail, BroCellActionData, BroRow, BroRowDetailsElement, TableBroHTMLElement} from '@table-bro/core';

import AxeBuilder                              from '@axe-core/playwright';
import {expect, type Locator, type Page, test} from '@playwright/test';

import type {createContext} from '../packages/core/shared/context';
import {bodyTable}          from './table-bro.fixtures';
import {cellTexts, mount}   from './table-bro.mount';

// The accessibility of the skins: the names of the controls, the keyboard, and the table as one table with column
// headers for screen readers.

/** The window of the page with the globals that the scripts of these tests set. */
type E2EWindow = typeof window & {
  e2eTable: TableBroHTMLElement;
  e2eEvents: BroActionDetail[];
  e2eEscapes: number;
  e2eRows: (prefix: string) => BroRow[];
  e2eLoad: () => void;
};

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

/** A table of the skin with a column of details buttons, as the demos of the details have it. */
function detailsTable(skin: string): string {
  return `
    if (!customElements.get('bro-e2e-details')) {
      customElements.define('bro-e2e-details', class extends HTMLElement {
        connectedCallback() {
          this.textContent = 'The details';
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: '${skin}', rowDetailsComponent: 'bro-e2e-details'}});
    document.body.append(el);`;
}

for (const skin of ['nv', 'bs']) {
  test(`the buttons of the ${skin} skin take their names from their titles`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    await expect(bodyTable(table).locator('tr[data-row-number="1"]').getByRole('button', {name: 'Details', exact: true})).toHaveCount(1);
    await expect(table.locator('[aria-label="false"]')).toHaveCount(0);
  });
}

for (const skin of ['mat', 'nv', 'bs']) {
  test(`the back and clear buttons of the search of the ${skin} skin have names`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await table.locator('.bro-toolbar-button-search').click();

    await expect(table.getByRole('button', {name: 'Back', exact: true})).toHaveCount(1);
    await expect(table.getByRole('button', {name: 'Clear', exact: true})).toHaveCount(1);
  });
}

for (const skin of ['nv', 'bs']) {
  test(`Enter and Space sort a column of the ${skin} skin`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);

    const sortHeader = table.locator('table.bro-table-header th').nth(2).locator('.bro-sort-header-container');

    // A screen reader meets the sort header as a button with the title of its column
    await expect(table.locator('table.bro-table-header').getByRole('button', {name: 'Price', exact: true})).toHaveCount(1);

    await sortHeader.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '2', '1']);

    await page.keyboard.press(' ');
    await expect.poll(() => cellTexts(table, 3)).toEqual(['1', '2', '3']);

    const sorts = await page.evaluate(() => (window as E2EWindow).e2eEvents.filter((event: {action: string}) => event.action === 'bro-filters-sort').map(event => event.data));

    expect(sorts).toEqual([{sortKey: 'price', sortDirection: 'desc'}, {sortKey: 'price', sortDirection: 'asc'}]);
  });
}

for (const skin of ['mat', 'nv', 'bs']) {
  test(`Escape closes the named search field of the ${skin} skin and returns the focus to the search button`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await table.locator('.bro-toolbar-button-search').click();

    const field = table.getByRole('textbox', {name: 'Search in table'});

    await expect(field).toBeFocused();
    await field.fill('a');
    await expect.poll(() => cellTexts(table, 2)).toEqual(['a']);

    await page.keyboard.press('Escape');

    await expect(field).toHaveCount(0);
    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await expect(table.locator('.bro-toolbar-button-search')).toBeFocused();
  });
}

for (const skin of ['nv', 'bs']) {
  test(`the focus of the ${skin} skin shows on the sort header`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    // The keyboard moves the focus from the second sort header to the third one
    await table.locator('table.bro-table-header th').nth(1).locator('.bro-sort-header-container').focus();
    await page.keyboard.press('Tab');

    const header = table.locator('table.bro-table-header th').nth(2).locator('.bro-sort-header-container');

    await expect(header).toBeFocused();
    await expect(header).toHaveCSS('outline-style', 'solid');
  });
}

test('the page size list and the progress of the nv skin have names', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'nv'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await expect(table.getByRole('combobox', {name: 'Items per page:'})).toHaveCount(1);

  // The progress of the loading lies in the header row and has its own name
  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('loading'));
  await expect(table.locator('progress[aria-label="Loading progress"]')).toHaveCount(1);
});

for (const skin of ['mat', 'nv']) {
  test(`the state of the ${skin} skin is named by its message, not by its icon`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows: [], conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    await expect(table.locator('.bro-state-message')).toHaveText('No data');
    await expect(table.locator('.bro-state-icon')).toHaveAttribute('aria-hidden', 'true');
  });
}

for (const skin of ['mat', 'nv']) {
  test(`the details button of the ${skin} skin says whether its details are open and points at them`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const button = bodyTable(table).locator('tr[data-row-number="1"]').getByRole('button', {name: 'Details'});

    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();

    const details = bodyTable(table).locator('tr.bro-details_tr');

    await expect(details).toHaveCount(1);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAttribute('aria-controls', await details.getAttribute('id') as string);

    await button.click();

    await expect(details).toHaveCount(0);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).not.toHaveAttribute('aria-controls');
  });
}

for (const skin of ['mat', 'nv']) {
  test(`the header and the body of the ${skin} skin are one table with column headers for screen readers`, {tag: skin === 'mat' ? '@smoke' : []}, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', toolbarTitle: 'Prices'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const grid = table.getByRole('table', {name: 'Prices'});

    await expect(grid).toHaveCount(1);

    // The arrow of a sort header is no part of its name: aria-sort tells the direction. The column of the row numbers
    // has a name of its own, not its short title No
    for (const title of ['Row number', 'Name', 'Price']) {
      await expect(grid.getByRole('columnheader', {name: title, exact: true})).toHaveCount(1);
    }

    await expect(grid.getByRole('row', {name: '1 b 3'}).getByRole('cell')).toHaveText(['1', 'b', '3']);

    // The aux table that measures the widths stays hidden, and the HTML tables are no tables of their own
    await expect(table.getByRole('table')).toHaveCount(1);
  });
}

for (const skin of ['mat', 'nv']) {
  test(`the column header of the ${skin} skin tells the direction of its sort`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', toolbarTitle: 'Prices'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);

    const price = table.getByRole('columnheader', {name: 'Price', exact: true});
    const name = table.getByRole('columnheader', {name: 'Name', exact: true});
    const sortHeader = table.locator('table.bro-table-header th[data-bro-column-key="price"] .bro-sort-header > *').first();

    await expect(price).not.toHaveAttribute('aria-sort');

    await sortHeader.click();
    await expect(price).toHaveAttribute('aria-sort', 'descending');

    await sortHeader.click();
    await expect(price).toHaveAttribute('aria-sort', 'ascending');
    await expect(name).not.toHaveAttribute('aria-sort');
  });
}

test('the table counts its rows for screen readers, also the rows of the server that are not loaded', async ({page}) => {
  const table = await mount(page, `
    const twelve = Array.from({length: 12}, (_, i) => ({name: 'row ' + (i + 1), price: i}));

    el.configure({cols, rows: twelve, conf: {skin: 'mat', toolbarTitle: 'Prices'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  const grid = table.getByRole('table', {name: 'Prices'});

  await expect(grid).toHaveAttribute('aria-rowcount', '13');
  await expect(table.locator('table.bro-table-header tr[role="row"]')).toHaveAttribute('aria-rowindex', '1');
  await expect(bodyTable(table).locator('tr[data-row-number="1"]')).toHaveAttribute('aria-rowindex', '2');

  // The server mode counts its total
  await page.evaluate(() => {
    document.querySelector('table-bro#e2e-table')?.remove();
  });

  const server = await mount(page, `
    el.configure({cols, conf: {skin: 'mat', server: true, toolbarTitle: 'Prices'}});
    document.body.append(el);
    el.replaceRows([{name: 'a', price: 1}, {name: 'b', price: 2}], {total: 40});
  `);

  await expect(server.getByRole('table', {name: 'Prices'})).toHaveAttribute('aria-rowcount', '41');
});

test('screen readers and the keyboard meet only the rows of the current page', async ({page}) => {
  const table = await mount(page, `
    const twelve = Array.from({length: 12}, (_, i) => ({name: 'row ' + (i + 1), price: i}));
    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    if (!customElements.get('bro-e2e-details')) {
      customElements.define('bro-e2e-details', class extends HTMLElement {
        connectedCallback() {
          this.textContent = 'The details';
        }
      });
    }

    el.configure({cols: [...cols, details], rows: twelve, conf: {skin: 'mat', toolbarTitle: 'Prices', rowDetailsComponent: 'bro-e2e-details'}});
    document.body.append(el);
  `);

  const grid = table.getByRole('table', {name: 'Prices'});
  const detailsButton = (row: number) => bodyTable(table).locator(`tr[data-row-number="${row}"] button`);

  // The header row and the five rows of the first page
  await expect(grid.getByRole('row')).toHaveCount(6);
  await expect(detailsButton(6)).toHaveAttribute('tabindex', '-1');

  // Opened details of the first page do not shift the next page
  await detailsButton(1).click();
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);

  await table.locator('button[aria-label="Next page"]').click();

  await expect(grid.getByRole('row', {name: /^7 /})).toHaveCount(1);
  await expect(grid.getByRole('row', {name: /^5 /})).toHaveCount(0);
  await expect(detailsButton(10)).not.toHaveAttribute('tabindex');
  await expect(detailsButton(5)).toHaveAttribute('tabindex', '-1');

  // The last page has two rows and three empty ones, which are no rows for screen readers
  await table.locator('button[aria-label="Next page"]').click();
  await expect(grid.getByRole('row')).toHaveCount(3);

  // The rows of the last page were hidden on the first two pages, and their buttons come back into Tab
  await expect(detailsButton(11)).not.toHaveAttribute('tabindex');
  await expect(detailsButton(12)).not.toHaveAttribute('tabindex');
});

test('the table is busy for screen readers while it loads or refreshes', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, conf: {skin: 'mat', toolbarTitle: 'Prices'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  const grid = table.getByRole('table', {name: 'Prices'});

  await expect(grid).toHaveAttribute('aria-busy', 'true');

  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows([{name: 'a', price: 1}]));
  await expect(grid).not.toHaveAttribute('aria-busy');

  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('refreshing'));
  await expect(grid).toHaveAttribute('aria-busy', 'true');

  await page.evaluate(() => (window as E2EWindow).e2eTable.setState('idle'));
  await expect(grid).not.toHaveAttribute('aria-busy');
});

test('the elements of a cell get their own tabindex back on their page', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-focus-cell')) {
      customElements.define('bro-e2e-focus-cell', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div class="own" tabindex="0">own</div><button class="excluded" tabindex="-1">excluded</button>';
        }
      });
    }

    const twelve = Array.from({length: 12}, (_, i) => ({name: 'row ' + (i + 1), price: i}));

    el.configure({cols: [...cols, {title: 'Cell', name: 'cell', component: 'bro-e2e-focus-cell'}], rows: twelve, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  const own = (rowNumber: number) => bodyTable(table).locator(`tr[data-row-number="${rowNumber}"] .own`);
  const excluded = (rowNumber: number) => bodyTable(table).locator(`tr[data-row-number="${rowNumber}"] .excluded`);
  const idle = () => table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.idle());

  await expect(own(1)).toHaveAttribute('tabindex', '0');
  await expect(own(6)).toHaveAttribute('tabindex', '-1');

  await table.locator('button[aria-label="Next page"]').click();
  await idle();
  await table.locator('button[aria-label="Previous page"]').click();
  await idle();

  await expect(own(1)).toHaveAttribute('tabindex', '0');
  await expect(excluded(1)).toHaveAttribute('tabindex', '-1');
  await expect(own(6)).toHaveAttribute('tabindex', '-1');
});

test('a table measured while hidden shows its sort again on its new header row', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'mat', toolbarTitle: 'Prices'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 3)).toEqual(['3', '1', '2']);

  const price = table.getByRole('columnheader', {name: 'Price', exact: true});

  await table.locator('table.bro-table-header th[data-bro-column-key="price"] .bro-sort-header > *').first().click();
  await expect(price).toHaveAttribute('aria-sort', 'descending');

  // New rows while hidden: the table measures its columns again once it shows, with a new header row
  await table.evaluate(el => {
    (el as HTMLElement).style.display = 'none';
    (window as E2EWindow).e2eTable.replaceRows([{name: 'x', price: 5}, {name: 'y', price: 7}]);
  });
  await table.evaluate(el => (el as HTMLElement).style.display = '');

  await expect.poll(() => cellTexts(table, 3)).toEqual(['7', '5']);
  await expect(price).toHaveAttribute('aria-sort', 'descending');
});

test('Escape in the search closes only the search, not a dialog around the table', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'nv'}});
    document.body.append(el);

    window.e2eEscapes = 0;
    document.body.addEventListener('keydown', event => event.key === 'Escape' && window.e2eEscapes++);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await table.locator('.bro-toolbar-button-search').click();

  const field = table.getByRole('textbox', {name: 'Search in table'});

  await expect(field).toBeFocused();
  await page.keyboard.press('Escape');

  await expect(field).toHaveCount(0);
  expect(await page.evaluate(() => (window as E2EWindow).e2eEscapes)).toBe(0);
});

test('the page size list of the nv skin stays disabled under a state that comes again', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'nv'}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await table.locator('.bro-toolbar-button-search').click();

  const field = table.getByRole('textbox', {name: 'Search in table'});

  // Two searches that find nothing: the second state renders the paginator for its total again
  await field.fill('zz');
  await expect(table.locator('.bro-state-message')).toBeVisible();
  await field.fill('zzz');
  await page.waitForTimeout(300);

  await expect(table.locator('bro-nv-dropdown')).toHaveAttribute('disabled', 'true');
});

test('the details button of server details says whether they are open, also for a row rendered again while they load', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-late-server-details')) {
      customElements.define('bro-e2e-late-server-details', class extends HTMLElement {
        connectedCallback() {
          if (!this.innerHTML) {
            this.innerHTML = '<div style="height: 60px">Server details</div>';
          }

          // The test ends the loading when it wants
          window.e2eLoad = () => this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    window.e2eRows = prefix => [{id: 1, name: prefix + ' a', price: 1}, {id: 2, name: prefix + ' b', price: 2}];
    el.configure({cols: [...cols, details], rows: window.e2eRows('old'), conf: {skin: 'mat', debug: true, rowDetailsComponent: 'bro-e2e-late-server-details', rowDetailsServer: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['old a', 'old b']);

  const button = () => bodyTable(table).locator('tr[data-row-number="1"]').getByRole('button', {name: 'Details'});
  const idle = () => table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.idle());

  await button().click();
  await expect(button()).toHaveAttribute('aria-expanded', 'true');

  // New row objects with the same ids while the details load: the row renders again with a new button
  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows((window as E2EWindow).e2eRows('new')));
  await expect.poll(() => cellTexts(table, 2)).toEqual(['new a', 'new b']);
  await expect(button()).toHaveAttribute('aria-expanded', 'true');

  await page.evaluate(() => (window as E2EWindow).e2eLoad());

  const details = bodyTable(table).locator('tr.bro-details_tr');

  await expect(details).toHaveCount(1);
  await expect(button()).toHaveAttribute('aria-controls', await details.getAttribute('id') as string);
  expect(await details.evaluate(tr => (tr.querySelector('bro-e2e-late-server-details') as BroRowDetailsElement).row?.['name'])).toBe('new a');
  await idle();

  // Opened again while they close: the button says they are open
  await button().click();
  await button().click();
  await expect(button()).toHaveAttribute('aria-expanded', 'true');
  await idle();
  await expect(details).toHaveCount(1);
});

for (const [skin, selector] of [['mat', 'bro-mat-slide-toggle'], ['bs', 'bro-switch'], ['nv', 'bro-switch']]) {
  test(`the switch of a cell of the ${skin} skin has the name of its column and sends its action`, async ({page}) => {
    const table = await mount(page, `
      const done = {title: 'Done', name: 'done', component: {
        selector: '${selector}',
        attrs: {checked: (col, row) => row.done, name: 'toggle-done'},
        event: 'action'
      }};

      el.configure({cols: [...cols, done], rows: rows.map(row => ({...row, done: false})), conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    const toggle = bodyTable(table).locator('tr[data-row-number="1"]').getByRole('switch', {name: 'Done'});

    await toggle.click();

    await expect.poll(() => page.evaluate(() => (window as E2EWindow).e2eEvents.filter((event: {action: string}) => event.action === 'toggle-done')
      .map(event => ({col: (event.data as BroCellActionData).col.name, row: (event.data as BroCellActionData).row['name']}))))
      .toEqual([{col: 'done', row: 'b'}]);
  });
}

/** The actions of the table that the application got, of the given names. */
function actions(page: Page, names: string[]): Promise<string[]> {
  return page.evaluate(names => (window as E2EWindow).e2eEvents.map((event: {action: string}) => event.action).filter((action: string) => names.includes(action)), names);
}

const moreMenu = '{buttonTitle: \'More\', mode: \'navbar-dropdown\', options: [{value: \'export\', title: \'Export\'}, {value: \'print\', title: \'Print\'}]}';

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the menu of the toolbar of the ${skin} skin has a name and sends the chosen action`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', components: {toolbarMain: {buttons: [${moreMenu}]}}}});
      document.body.append(el);
    `);

    if (skin === 'nv') {
      await table.getByRole('combobox', {name: 'More'}).selectOption('print');
    } else {
      await table.getByRole('button', {name: 'More'}).click();
      await page.getByText('Print', {exact: true}).click();
    }

    await expect.poll(() => actions(page, ['export', 'print'])).toEqual(['print']);
  });
}

test('the menu of the toolbar of the nv skin waits for Enter after a choice of the keyboard', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'nv', components: {toolbarMain: {buttons: [${moreMenu}]}}}});
    document.body.append(el);
  `);

  const menu = table.getByRole('combobox', {name: 'More'});

  // The keys of a closed select change its value on Windows: the change of an arrow key sends nothing yet
  await menu.evaluate((select: HTMLSelectElement) => {
    select.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
    select.value = 'export';
    select.dispatchEvent(new Event('change', {bubbles: true}));
  });

  expect(await actions(page, ['export', 'print'])).toEqual([]);

  await menu.evaluate((select: HTMLSelectElement) => select.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));

  await expect.poll(() => actions(page, ['export', 'print'])).toEqual(['export']);
  await expect(menu).toHaveValue('');
});

/** The opacity that the element shows with: its own one times the ones of its ancestors. */
function shownOpacity(locator: Locator): Promise<number> {
  return locator.evaluate(el => {
    let opacity = 1;

    for (let node: Element | null = el; node; node = node.parentElement) {
      opacity *= Number(getComputedStyle(node).opacity);
    }

    return opacity;
  });
}

/** The rules of WCAG 2.2 A and AA and the advice of axe beyond them that the table breaks: the selectors of the elements of each one. */
async function axeViolations(page: Page): Promise<Record<string, string[]>> {
  const {violations} = await new AxeBuilder({page}).include('#e2e-table').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();

  return Object.fromEntries(violations.map(violation => [violation.id, violation.nodes.map(node => node.target.join(' '))]));
}

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin passes axe sorted, with open details and search, and empty`, async ({page}) => {
    const table = await mount(page, detailsTable(skin));

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    await table.locator('thead th').nth(1).getByRole('button').first().click();
    await expect(table.locator('thead th[aria-sort]')).toHaveCount(1);
    await bodyTable(table).locator('tr[data-row-number="1"]').getByRole('button', {name: 'Details', exact: true}).click();
    await expect(table.locator('bro-e2e-details')).toHaveText('The details');
    // The details fade in: the contrast of their text counts at the end of the opening
    await expect.poll(() => shownOpacity(table.locator('bro-e2e-details'))).toBe(1);
    await table.locator('.bro-toolbar-button-search').click();
    await expect(table.locator('.bro-table-toolbar_container input')).toBeFocused();

    expect(await axeViolations(page)).toEqual({});
    // An element of the skin without a role carries no aria-label, which ARIA forbids there: it names its control
    expect(await table.evaluate(el => Array.from(el.querySelectorAll('[aria-label]')).filter(node => node.localName.includes('-') && !node.hasAttribute('role')).map(node => node.localName))).toEqual([]);

    await page.evaluate(() => (document.querySelector('#e2e-table') as TableBroHTMLElement).replaceRows([]));
    await expect(table.locator('.bro-state')).toContainText('No data');
    // The message of the state fades in: the contrast of its text counts at the end of the animation
    await expect.poll(() => shownOpacity(table.locator('.bro-state-message'))).toBe(1);

    expect(await axeViolations(page)).toEqual({});
  });
}

for (const [skin, toggle] of [['mat', ''], ['bs', 'Vanilla Bootstrap'], ['nv', 'Vanilla HTML']]) {
  test(`the filter drawer of the ${skin} skin filters the rows of the page, passes axe open and closes`, async ({page}) => {
    await page.goto('/', {waitUntil: 'networkidle'});

    if (toggle) {
      await page.locator('mat-button-toggle', {hasText: toggle}).first().click();
    }

    const table = page.locator('table-bro').first();
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');
    const container = page.locator(skin === 'mat' ? 'table-bro-filter-drawer-container-ng' : 'table-bro-filter-drawer-container').first();
    const opened = () => (skin === 'mat') ? container.locator('mat-drawer').evaluate(el => el.classList.contains('mat-drawer-opened')) : container.evaluate(el => el.hasAttribute('opened'));

    await expect(rows.first()).toBeAttached();

    const all = await rows.count();

    await table.getByRole('button', {name: 'Filters'}).or(table.locator('a', {hasText: 'Filters'})).first().click();
    await expect.poll(opened).toBe(true);

    // The filters of the page go to the table, which asks the server of the page for the rows
    await container.locator('input[name="featureName"]').fill('column');
    await expect.poll(async () => {
      const texts = await rows.allTextContents();

      return texts.length > 0 && texts.length < all && texts.every(text => /column/i.test(text));
    }, {timeout: 10_000}).toBe(true);

    // The card slides and fades in: the contrast counts at the end of the opening
    const card = container.locator('.bro-filter-drawer-card').first();

    await expect.poll(() => shownOpacity(card)).toBe(1);
    await page.waitForTimeout(500);

    // The drawer of the table, without the filters of the page in it
    const {violations} = await new AxeBuilder({page}).include(skin === 'mat' ? 'table-bro-filter-drawer-container-ng' : 'table-bro-filter-drawer-container')
      .exclude('app-feature-filters').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();

    expect(Object.fromEntries(violations.map(violation => [violation.id, violation.nodes.map(node => node.target.join(' '))]))).toEqual({});

    await container.locator('.bro-filter-drawer-header :is(a, button)').first().click();
    await expect.poll(opened).toBe(false);
  });
}

test('the column of the row numbers has a name to read, and the hidden head of the body no aria-hidden', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'nv', toolbarTitle: 'Prices', texts: {rowCounterName: 'Row #'}}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  await expect(table.getByRole('table', {name: 'Prices'}).getByRole('columnheader', {name: 'Row #'})).toHaveCount(1);
  await expect(table.locator('thead[aria-hidden]')).toHaveCount(0);
});

test('a row rendered anew for a new object of the same row keeps the focus of the keyboard on its control', async ({page}) => {
  const table = await mount(page, `
    const details = {title: '', name: 'details', component: {selector: 'bro-details-button', attrs: {title: 'Details', name: 'bro-details-toggle'}, event: 'action'}};

    el.configure({cols: [...cols, details], rows: rows.map((row, i) => ({...row, id: i + 1})), conf: {skin: 'nv'}});
    document.body.append(el);
  `);
  const details = () => bodyTable(table).locator('tr[data-row-number="2"]').getByRole('button', {name: 'Details', exact: true});

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await details().focus();

  // The same rows by their ids, as new objects: the table renders the rows again in their places
  await page.evaluate(() => {
    const el = document.querySelector('#e2e-table') as TableBroHTMLElement;

    el.replaceRows([{id: 1, name: 'b', price: 4}, {id: 2, name: 'a', price: 5}, {id: 3, name: 'c', price: 6}]);
  });

  await expect.poll(() => cellTexts(table, 3)).toEqual(['4', '5', '6']);
  await expect(details()).toBeFocused();
});

test('the mat paginator that new rows render anew keeps the focus of the keyboard on its button', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'mat', pageSize: 2}});
    document.body.append(el);
  `);
  const next = () => table.getByRole('button', {name: 'Next page'});

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await next().focus();

  await page.evaluate(() => (document.querySelector('#e2e-table') as TableBroHTMLElement).replaceRows([{name: 'd', price: 1}, {name: 'e', price: 2}, {name: 'f', price: 3}]));

  await expect.poll(() => cellTexts(table, 2)).toEqual(['d', 'e', 'f']);
  await expect(next()).toBeFocused();
});

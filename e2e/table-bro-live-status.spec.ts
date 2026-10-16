import type {TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, type Page, test} from '@playwright/test';

import {bodyTable}        from './table-bro.fixtures';
import {cellTexts, mount} from './table-bro.mount';

// The live region of the table: screen readers hear a state or the loading of row details only while the table shows it.

/** The live region of the table. */
/** The window of the stand page, with the server details the page script keeps by the name of their row. */
interface E2EWindow extends Window {
  e2eDetails?: Record<string, HTMLElement>;
}

function liveStatus(table: Locator): Locator {
  return table.locator('[role="status"].bro-live-status');
}

/** The row of the body table with the name. */
function row(table: Locator, name: string): Locator {
  return bodyTable(table).locator('tbody > tr[data-row-number]').filter({has: table.page().getByText(name, {exact: true})});
}

/** Ends the loading of the server details of the row with the name. */
function load(page: Page, name: string): Promise<void> {
  return page.evaluate(name => {
    (window as E2EWindow).e2eDetails![name].dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1}));
  }, name);
}

test('the live region is empty once rows replace the state of the table', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, conf: {skin: 'nv'}});
    document.body.append(el);
  `);

  await expect(liveStatus(table)).toHaveText('Loading');

  await table.evaluate((el: TableBroHTMLElement, rows) => el.replaceRows(rows), [{name: 'b', price: 3}, {name: 'a', price: 1}]);
  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a']);
  await expect(liveStatus(table)).toHaveText('');

  await table.evaluate((el: TableBroHTMLElement) => el.replaceRows([]));
  await expect(liveStatus(table)).toHaveText('No data');

  await table.evaluate((el: TableBroHTMLElement) => el.replaceRows([{name: 'c', price: 2}]));
  await expect.poll(() => cellTexts(table, 2)).toEqual(['c']);
  await expect(liveStatus(table)).toHaveText('');
});

test('the live region says the loading of server details until the details of every row load or leave', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-live-details')) {
      customElements.define('bro-e2e-live-details', class extends HTMLElement {
        connectedCallback() {
          if (this.innerHTML) {
            return;
          }

          this.innerHTML = '<div style="height: 40px">Server details</div>';

          // The test ends the loading of the details of a row by its name
          (window.e2eDetails ||= {})[this.row.name] = this;
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'nv', rowDetailsComponent: 'bro-e2e-live-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await expect(liveStatus(table)).toHaveText('');

  await row(table, 'a').getByRole('button', {name: 'Details'}).click();
  await row(table, 'b').getByRole('button', {name: 'Details'}).click();
  await expect(liveStatus(table)).toHaveText('Loading details');

  // The details of b still load
  await load(page, 'a');
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(1);
  await expect(liveStatus(table)).toHaveText('Loading details');

  await load(page, 'b');
  await expect(bodyTable(table).locator('tr.bro-details_tr')).toHaveCount(2);
  await expect(liveStatus(table)).toHaveText('');

  // A row that leaves the table takes the loading of its details along
  await row(table, 'c').getByRole('button', {name: 'Details'}).click();
  await expect(liveStatus(table)).toHaveText('Loading details');

  await table.locator('.bro-toolbar-button-search').click();
  await table.getByRole('textbox', {name: 'Search in table'}).fill('a');
  await expect.poll(() => cellTexts(table, 2)).toEqual(['a']);
  await expect(liveStatus(table)).toHaveText('');
});

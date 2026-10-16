import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';
import {mount}     from './table-bro.mount';

// The progress bar of the bs skin keeps its progress when the table moves its row.

test('the bs progress of server details keeps its width when a sort moves the row during the loading', async ({page}) => {
  const table = await mount(page, `
    if (!customElements.get('bro-e2e-loading-details')) {
      // The details of the server never end their loading in this test
      customElements.define('bro-e2e-loading-details', class extends HTMLElement {
        connectedCallback() {
          this.innerHTML = '<div style="height: 60px">Server details</div>';
        }
      });
    }

    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    // The prices go up: the first sort, down, reverses the rows
    const five = Array.from({length: 5}, (_, i) => ({name: 'row ' + (i + 1), price: i}));

    el.style.width = '900px';
    el.configure({cols: [...cols, details], rows: five, conf: {skin: 'bs', rowDetailsComponent: 'bro-e2e-loading-details', rowDetailsServer: true}});
    document.body.append(el);
  `);

  // The bar of the loading details of the second row
  await bodyTable(table).locator('tbody > tr[data-row-number]').nth(1).getByRole('button', {name: 'Details'}).click();

  const bar = table.locator('bro-bs-progress-bar .progress-bar');
  const width = async () => parseFloat(await bar.evaluate((el: HTMLElement) => el.style.width));

  // Half of the bar fills in the first second of the loading
  await expect.poll(width).toBeGreaterThan(50);

  const before = await width();

  // The first click sorts the prices down: the second row moves to the fourth place
  await table.getByRole('button', {name: 'Price'}).first().click();

  expect(await width()).toBeGreaterThanOrEqual(before);

  await page.waitForTimeout(300);
  expect(await width()).toBeGreaterThanOrEqual(before);
});

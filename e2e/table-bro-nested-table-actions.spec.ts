import {expect, test} from '@playwright/test';

import {mount} from './table-bro.mount';

// A table in the row details of another table: its actions bubble through the outer table, which keeps to its own.

test('the paginator of a table in the row details pages only that table', async ({page}) => {
  const outer = await mount(page, `
    const many = Array.from({length: 12}, (item, index) => ({name: 'row ' + (index + 1), price: index}));

    customElements.get('e2e-inner-details') || customElements.define('e2e-inner-details', class extends HTMLElement {
      connectedCallback() {
        if (this.firstChild) {
          return;
        }

        const inner = document.createElement('table-bro');
        inner.configure({cols, rows: many, conf: {skin: 'nv', toolbar: false, pageSize: 5}});
        this.append(inner);
      }
    });

    el.configure({
      cols: [...cols, {title: '', component: {selector: 'bro-details-button', attrs: {title: 'Details', name: 'bro-details-toggle'}, event: 'action'}}],
      rows: many,
      conf: {skin: 'nv', pageSize: 5, rowDetailsComponent: 'e2e-inner-details'}
    });
    document.body.append(el);
  `);

  const range = (table: ReturnType<typeof page.locator>) => table.locator(':scope > .bro-paginator-container').innerText();

  await expect.poll(() => range(outer)).toContain('1 – 5 of 12');

  await outer.getByRole('button', {name: 'Details'}).first().click();

  const inner = outer.locator('e2e-inner-details table-bro');

  await expect.poll(() => range(inner)).toContain('1 – 5 of 12');

  await inner.locator(':scope > .bro-paginator-container').getByLabel('Next page').click();

  await expect.poll(() => range(inner)).toContain('6 – 10 of 12');
  await expect.poll(() => range(outer)).toContain('1 – 5 of 12');

  // The rows of the outer table did not scroll to its next page
  await page.waitForTimeout(1000);

  const scrolled = await outer.evaluate((host: Element) => {
    const body = host.querySelector<HTMLElement>(':scope > .bro-table_container .bro-table-body')!;

    return new DOMMatrix(getComputedStyle(body).transform).m42;
  });

  expect(scrolled).toBe(0);
});

import {expect, test} from '@playwright/test';

import {mount} from './table-bro.mount';

// The values of a table that gets narrower after its render: a value that its column cuts takes the text ellipsis
// element of the skin, with its tooltip, as a value cut at the render does.

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin gives a value cut by a narrower table its tooltip`, async ({page}) => {
    const table = await mount(page, `
      const long = ['Margaret Hamilton of the Apollo Guidance Computer', 'Katherine Johnson of the Orbital Mechanics', 'Ada Lovelace'];
      el.style.display = 'block';
      el.style.width = '900px';
      el.configure({cols, rows: long.map((name, i) => ({name, price: i})), conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    await expect(table.locator('.bro-table-body tbody tr.bro-row').first()).toBeVisible();

    await table.evaluate((el: HTMLElement) => el.style.width = '300px');
    await page.waitForTimeout(1500);

    // No plain value is cut: each one is as wide as its text, else it is the ellipsis element of the skin
    const cut = await table.evaluate((host: Element) => {
      const range = document.createRange();

      return [...host.querySelectorAll<HTMLElement>(':scope > .bro-table_container .bro-table-body > table > tbody > tr.bro-row > td > span.bro-cell_component')]
        .filter(span => span.getBoundingClientRect().height > 0)
        .filter(span => {
          span.style.whiteSpace = 'nowrap';
          range.selectNodeContents(span);

          const width = range.getBoundingClientRect().width;

          span.style.removeProperty('white-space');

          return width > span.getBoundingClientRect().width + 0.5;
        })
        .map(span => span.textContent);
    });

    expect(cut).toEqual([]);
  });
}

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin gives a value cut by the CSS width of its column its tooltip with autoColumnWidth: false`, async ({page}) => {
    const table = await mount(page, `
      const style = document.createElement('style');
      style.textContent = '#e2e-table .e2e-narrow .bro-cell_component { width: 60px; }';
      document.head.append(style);
      el.configure({
        cols: [{title: 'Name', name: 'name', className: 'e2e-narrow'}, {title: 'Price', name: 'price', dataType: 'number'}],
        rows: [{name: 'Margaret Hamilton of the Apollo Guidance Computer', price: 1}, {name: 'Ada', price: 2}],
        conf: {skin: '${skin}', autoColumnWidth: false}
      });
      document.body.append(el);
    `);

    const cells = table.locator('.bro-table-body tbody tr.bro-row td.e2e-narrow');

    await expect(cells.first()).toBeVisible();
    // The long value is the ellipsis element of the skin, the short one stays a plain value
    await expect(cells.nth(0).locator(':scope > span.bro-cell_component')).toHaveCount(0);
    await expect(cells.nth(1).locator(':scope > span.bro-cell_component')).toHaveCount(1);
  });
}

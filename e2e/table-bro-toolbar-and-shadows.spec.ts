import {expect, test} from '@playwright/test';

import {cellTexts, mount} from './table-bro.mount';

// A table without its toolbar, and a table without shadows: its CSS places the body and the paginator as its script does.

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin renders no toolbar with toolbar: false`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', toolbar: false, toolbarTitle: 'Prices'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await expect(table.locator('.bro-table-toolbar_container')).toHaveCount(0);
    // The title still names the table for screen readers
    await expect(table.locator('.bro-table_container')).toHaveAttribute('aria-label', 'Prices');
  });

  test(`the ${skin} skin without shadows keeps the paginator under the last row`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', shadowsEnabled: false, pageSize: 3}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const boxes = await table.evaluate((host: Element) => {
      const lastRow = [...host.querySelectorAll('.bro-table-body tbody tr')].filter(row => row.getBoundingClientRect().height > 0).at(-1)!;

      return {lastRow: lastRow.getBoundingClientRect().bottom, paginator: host.querySelector('.bro-paginator-container')!.getBoundingClientRect().top};
    });

    expect(boxes.paginator).toBeGreaterThanOrEqual(boxes.lastRow - 1);
  });
}

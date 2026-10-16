import {expect, test} from '@playwright/test';

import {cellTexts, mount} from './table-bro.mount';

// A table without its header: the header keeps its place in the DOM, hidden, and the rows start at the top of the table.

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin hides the header with header: false`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', toolbar: false, header: false}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await expect(table.locator('.bro-table-header_container')).toBeHidden();

    // The first row is the first thing of the table
    const gap = await table.evaluate((host: Element) => {
      const firstRow = [...host.querySelectorAll('.bro-table-body tbody tr')].find(row => row.getBoundingClientRect().height > 0)!;

      return firstRow.getBoundingClientRect().top - host.getBoundingClientRect().top;
    });

    expect(gap).toBeLessThan(1);
  });
}

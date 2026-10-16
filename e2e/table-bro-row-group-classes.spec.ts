import {expect, test} from '@playwright/test';

import {bodyTable}        from './table-bro.fixtures';
import {cellTexts, mount} from './table-bro.mount';

// The classes of the row groups: css.table.thead.className and css.table.tbody.className of the config reach the
// <thead> and the <tbody> of the table, as the classes of its rows and cells reach them.

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin gives the header and the body row groups their classes from the config`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', css: {table: {thead: {className: 'e2e-head'}, tbody: {className: 'e2e-body'}}}}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    // The header row group that the header container shows, and the one of the body
    await expect(table.locator('.bro-table-header thead')).toHaveClass('e2e-head');
    await expect(bodyTable(table).locator('tbody')).toHaveClass('e2e-body');
    // No row group of the table, the hidden ones included, goes without its class
    await expect(table.locator('thead:not(.e2e-head), tbody:not(.e2e-body)')).toHaveCount(0);
  });
}

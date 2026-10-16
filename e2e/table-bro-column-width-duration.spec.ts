import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';
import {mount}     from './table-bro.mount';

// The columns move to their new widths in --bro-column-width-duration of the skin, in the time of the table.

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin moves the column widths in --bro-column-width-duration, and a value on the table changes it`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}'}});
      document.body.append(el);
    `);
    const cell = bodyTable(table).locator('tbody > tr[data-row-number] > td').first();

    await expect(cell).toBeVisible();
    await expect(table).toHaveCSS('--bro-column-width-duration', /^(500ms|0\.5s)$/);
    await expect(cell).toHaveCSS('transition-property', 'width');
    await expect(cell).toHaveCSS('transition-duration', '0.5s');

    await table.evaluate((el: HTMLElement) => el.style.setProperty('--bro-column-width-duration', '200ms'));
    await expect(cell).toHaveCSS('transition-duration', '0.2s');

    await table.evaluate((el: HTMLElement) => el.style.setProperty('--bro-duration-scale', '0'));
    await expect(cell).toHaveCSS('transition-duration', '0s');
  });
}

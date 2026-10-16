import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The vanilla stand: the UMD builds of the core and of the skins bs and nv on a page without a framework.

for (const skin of ['bs', 'nv']) {
  test(`the UMD builds show a ${skin} table whose filter drawer filters its rows`, {tag: '@smoke'}, async ({page}) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.goto('/vanilla/', {waitUntil: 'networkidle'});

    if (skin === 'nv') {
      await page.getByLabel('Native').check();
    }

    const table = page.locator('table-bro');
    const container = page.locator('table-bro-filter-drawer-container');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(new RegExp(`\\b${skin}\\b`));
    await expect(rows.first()).toBeVisible();

    await table.locator('.bro-toolbar a', {hasText: 'Filters'}).click();
    await expect(container).toHaveAttribute('opened');

    await container.locator('input[name="featureName"]').fill('column');
    await expect.poll(() => rows.allTextContents()).toEqual([expect.stringMatching(/Fixed column width/), expect.stringMatching(/Auto-detected column width/)]);

    expect(errors).toEqual([]);
  });
}

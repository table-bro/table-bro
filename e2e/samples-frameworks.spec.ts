import fs   from 'node:fs';
import path from 'node:path';

import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The pages of samples/frameworks, a project of one framework each, as `npm run build:samples` builds them into
// dist/samples/frameworks under the base path of table-bro.com: in each framework the page configures the table, gives
// it the theme auto, which follows the color scheme of the system, and logs the names of its bro-action events.

const dist = path.join(__dirname, '../dist/samples/frameworks');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the pages of samples/frameworks');

test.beforeEach(async ({page}) => {
  // The built files, as a static host serves them: a folder gives its index.html
  await page.route(`${origin}/samples/frameworks/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/frameworks/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
});

for (const name of ['react', 'vue', 'svelte', 'solid', 'preact']) {
  test(`the ${name} sample shows its table in the theme of the system and logs its bro-action`, async ({page}) => {
    const errors: string[] = [];
    const logs: string[] = [];

    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => logs.push(message.text()));

    await page.emulateMedia({colorScheme: 'dark'});
    await page.goto(`${origin}/samples/frameworks/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(/\bnv\b/);
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText('Modern Cotton Chair');

    await expect(table).toHaveClass(/\bbro-dark-theme\b/);

    await page.emulateMedia({colorScheme: 'light'});
    await expect(table).toHaveClass(/\bbro-light-theme\b/);

    await table.locator('table.bro-table-header th[data-bro-column-key="price"] .bro-sort-header').click();
    await expect.poll(() => logs).toContain('bro-filters-sort');

    expect(errors).toEqual([]);
  });
}

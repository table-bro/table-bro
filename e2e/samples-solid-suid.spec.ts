import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The pages of samples/solid-suid, as `npm run build:samples` builds them into dist/samples/solid-suid under the base path
// of table-bro.com: Solid configures the table in the skin suid in the browser, and SolidStart prerenders it in the
// markup of SUID at its build, as a static site, before configure() renders it with its rows.

const dist = path.join(__dirname, '../dist/samples/solid-suid');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the pages of samples/solid-suid');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/solid-suid/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/solid-suid/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test.beforeEach(async ({page}) => {
  await serve(page);
});

for (const name of ['solid', 'start']) {
  test(`the ${name} sample shows its table in the components of SUID`, async ({page}) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.goto(`${origin}/samples/solid-suid/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(/\bsuid\b/);
    await expect(rows).toHaveCount(20);
    await expect(table.locator('bro-suid-toolbar-main .MuiToolbar-root')).toHaveCount(1);
    await expect(table.locator('.bro-paginator-range-label')).toHaveText('1 – 5 of 20');
    expect(errors).toEqual([]);
  });
}

test('the SolidStart sample shows the prerendered table in the markup of SUID before its scripts run', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await serve(page);
  await page.goto(`${origin}/samples/solid-suid/start/`);

  const table = page.locator('table-bro#orders');

  // The loading state of the table: the toolbar and the progress bar of SUID, the sort headers, and the paginator with
  // the native select of SUID, in the colors of the theme
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table).toHaveAttribute('class', 'suid');
  await expect(table.locator('bro-suid-toolbar-main .MuiToolbar-root')).toHaveCount(1);
  await expect(table.locator('bro-suid-sort-header .bro-sort-header-content')).not.toHaveCount(0);
  await expect(table.locator('bro-suid-progress-bar .MuiLinearProgress-root')).toHaveCount(1);
  await expect(table.locator('bro-suid-paginator bro-suid-dropdown .MuiNativeSelect-select')).toHaveCount(1);
  expect(await table.evaluate(element => getComputedStyle(element).getPropertyValue('--suid-palette-background-paper'))).toBe('#fff');

  const prerendered = (await table.boundingBox())!.height;

  await context.close();

  // The table of the browser takes the place of the prerender at the same height: the page has no layout shift
  const live = await browser.newPage();

  await serve(live);
  await live.goto(`${origin}/samples/solid-suid/start/`);
  await expect(bodyTable(live.locator('table-bro#orders')).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.locator('table-bro#orders').boundingBox())!.height).toBe(prerendered);
  await live.close();
});

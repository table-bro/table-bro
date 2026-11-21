import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The page of samples/preact-astro, as `npm run build:samples` builds it into dist/samples/preact-astro under the base
// path of table-bro.com: Astro prerenders the table of Preact MUI in the markup of MUI at its build, as a static site,
// and the island of Preact hydrates the page before configure() renders the table with its rows.

const dist = path.join(__dirname, '../dist/samples/preact-astro');
const origin = 'http://samples.localhost';
const url = `${origin}/samples/preact-astro/`;

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the page of samples/preact-astro');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/preact-astro/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/preact-astro/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test.beforeEach(async ({page}) => {
  await serve(page);
});

test('the Astro sample shows its table in the components of MUI', async ({page}) => {
  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));

  await page.goto(url);

  const table = page.locator('table-bro#orders');
  const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

  await expect(table).toHaveClass(/\bmui\b/);
  await expect(rows).toHaveCount(20);
  await expect(table.locator('.MuiTablePagination-displayedRows')).toHaveText('1 – 5 of 20');
  expect(errors).toEqual([]);
});

test('the Astro sample shows the prerendered table in the markup of MUI before its scripts run', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await serve(page);
  await page.goto(url);

  const table = page.locator('table-bro#orders');

  // The loading state of the table: the toolbar, the sort labels, the progress bar and the paginator of MUI, in the
  // colors of the theme of the page
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table.locator('bro-mui-toolbar-main .MuiToolbar-root')).toHaveCount(1);
  await expect(table.locator('bro-mui-sort-header .MuiTableSortLabel-root')).not.toHaveCount(0);
  await expect(table.locator('bro-mui-progress-bar .MuiLinearProgress-root')).toHaveCount(1);
  await expect(table.locator('bro-mui-paginator .MuiTablePagination-root')).toHaveCount(1);
  expect(await table.evaluate(element => getComputedStyle(element).getPropertyValue('--mui-palette-primary-main'))).toBe('#005cbb');

  const prerendered = (await table.boundingBox())!.height;

  await context.close();

  // The table of the browser takes the place of the prerender at the same height: the page has no layout shift
  const live = await browser.newPage();

  await serve(live);
  await live.goto(url);
  await expect(bodyTable(live.locator('table-bro#orders')).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.locator('table-bro#orders').boundingBox())!.height).toBe(prerendered);
  await live.close();
});

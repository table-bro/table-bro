import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The pages of samples/react-mui, as `npm run build:samples` builds them into dist/samples/react-mui under the base path
// of table-bro.com: React and Preact configure the table in the skin mui in the browser, and Next.js prerenders it in
// the markup of MUI at its build, as a static export, before configure() renders it with its rows.

const dist = path.join(__dirname, '../dist/samples/react-mui');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the pages of samples/react-mui');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/react-mui/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/react-mui/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test.beforeEach(async ({page}) => {
  await serve(page);
});

for (const name of ['react', 'preact', 'next']) {
  test(`the ${name} sample shows its table in the components of MUI`, async ({page}) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.goto(`${origin}/samples/react-mui/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(/\bmui\b/);
    await expect(rows).toHaveCount(20);
    await expect(table.locator('.MuiTablePagination-displayedRows')).toHaveText('1 – 5 of 20');
    expect(errors).toEqual([]);
  });
}

test('the Next.js sample shows the prerendered table in the markup of MUI before its scripts run', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await serve(page);
  await page.goto(`${origin}/samples/react-mui/next/`);

  const table = page.locator('table-bro#orders');

  // The loading state of the table: the toolbar, the sort labels, the progress bar and the paginator of MUI
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table.locator('bro-mui-toolbar-main .MuiToolbar-root')).toHaveCount(1);
  await expect(table.locator('bro-mui-sort-header .MuiTableSortLabel-root')).not.toHaveCount(0);
  await expect(table.locator('bro-mui-progress-bar .MuiLinearProgress-root')).toHaveCount(1);
  await expect(table.locator('bro-mui-paginator .MuiTablePagination-root')).toHaveCount(1);

  const prerendered = (await table.boundingBox())!.height;

  await context.close();

  // The table of the browser takes the place of the prerender at the same height: the page has no layout shift
  const live = await browser.newPage();

  await serve(live);
  await live.goto(`${origin}/samples/react-mui/next/`);
  await expect(bodyTable(live.locator('table-bro#orders')).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.locator('table-bro#orders').boundingBox())!.height).toBe(prerendered);
  await live.close();
});

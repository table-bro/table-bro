import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The page of samples/angular-ssr, as `npm run build:samples` builds it into dist/samples/angular-ssr under the base
// path of table-bro.com: the server render of Angular prerenders the table of <table-bro-ng> in the skin mat at the
// build, and the browser hydrates the page and renders the table with its rows in its place.

const dist = path.join(__dirname, '../dist/samples/angular-ssr');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the page of samples/angular-ssr');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/angular-ssr/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/angular-ssr/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test('the Angular SSR sample shows the prerendered table before its scripts run, and its rows after them', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const prerendered = await context.newPage();

  await serve(prerendered);
  await prerendered.goto(`${origin}/samples/angular-ssr/`);

  const table = prerendered.locator('table-bro#orders');

  // The loading state of the table in the components of Angular Material
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table).toHaveClass(/\bmat\b/);
  await expect(table.locator('.mat-mdc-paginator')).toHaveCount(1);

  const height = (await table.boundingBox())!.height;

  await context.close();

  // The hydrated page renders the table with its rows at the same height: the page has no layout shift
  const page = await browser.newPage();
  const errors: string[] = [];

  page.on('pageerror', error => errors.push(error.message));
  await serve(page);
  await page.goto(`${origin}/samples/angular-ssr/`);

  const live = page.locator('table-bro#orders');

  await expect(bodyTable(live).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.boundingBox())!.height).toBe(height);
  expect(errors).toEqual([]);
  await page.close();
});

import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The pages of samples/svelte-m3, as `npm run build:samples` builds them into dist/samples/svelte-m3 under the base path
// of table-bro.com: Svelte configures the table in the skin m3-svelte in the browser, and SvelteKit prerenders it in the
// markup of M3 Svelte at its build, before configure() renders it with its rows.

const dist = path.join(__dirname, '../dist/samples/svelte-m3');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the pages of samples/svelte-m3');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/svelte-m3/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/svelte-m3/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test.beforeEach(async ({page}) => {
  await serve(page);
});

for (const name of ['svelte', 'sveltekit']) {
  test(`the ${name} sample shows its table in the components of M3 Svelte`, async ({page}) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.goto(`${origin}/samples/svelte-m3/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(/\bm3-svelte\b/);
    await expect(rows).toHaveCount(20);
    await expect(table.locator('.bro-m3-svelte-paginator-range')).toHaveText('1 – 5 of 20');
    expect(errors).toEqual([]);
  });
}

test('the SvelteKit sample shows the prerendered table in the markup of M3 Svelte before its scripts run', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await serve(page);
  await page.goto(`${origin}/samples/svelte-m3/sveltekit/`);

  const table = page.locator('table-bro#orders');

  // The loading state of the table: the toolbar with the icon buttons of M3 Svelte, the sort headers, the progress bar
  // and the paginator with the select and the buttons of M3 Svelte
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table.locator('bro-m3-svelte-toolbar-main .bro-toolbar-button-search')).toHaveCount(1);
  await expect(table.locator('bro-m3-svelte-sort-header .bro-m3-svelte-sort-header-content')).not.toHaveCount(0);
  await expect(table.locator('bro-m3-svelte-progress-bar [role="progressbar"]')).toHaveCount(1);
  await expect(table.locator('bro-m3-svelte-paginator select')).toHaveCount(1);
  await expect(table.locator('bro-m3-svelte-paginator .bro-paginator-navigation-next')).toHaveCount(1);

  const prerendered = (await table.boundingBox())!.height;

  await context.close();

  // The table of the browser takes the place of the prerender at the same height: the page has no layout shift
  const live = await browser.newPage();

  await serve(live);
  await live.goto(`${origin}/samples/svelte-m3/sveltekit/`);
  await expect(bodyTable(live.locator('table-bro#orders')).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.locator('table-bro#orders').boundingBox())!.height).toBe(prerendered);
  await live.close();
});

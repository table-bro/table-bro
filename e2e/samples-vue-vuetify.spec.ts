import fs   from 'node:fs';
import path from 'node:path';

import {expect, type Page, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The pages of samples/vue-vuetify, as `npm run build:samples` builds them into dist/samples/vue-vuetify under the base
// path of table-bro.com: Vue configures the table in the skin vuetify in the browser, and Nuxt prerenders it in the
// markup of Vuetify at its build, as a static site, before configure() renders it with its rows.

const dist = path.join(__dirname, '../dist/samples/vue-vuetify');
const origin = 'http://samples.localhost';

test.skip(!fs.existsSync(dist), 'npm run build:samples builds the pages of samples/vue-vuetify');

/**
 * Serves the built files, as a static host does: a folder gives its index.html.
 * @param page - the page
 */
async function serve(page: Page): Promise<void> {
  await page.route(`${origin}/samples/vue-vuetify/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/vue-vuetify/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
}

test.beforeEach(async ({page}) => {
  await serve(page);
});

for (const name of ['vue', 'nuxt']) {
  test(`the ${name} sample shows its table in the components of Vuetify`, async ({page}) => {
    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    await page.goto(`${origin}/samples/vue-vuetify/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(/\bvuetify\b/);
    await expect(rows).toHaveCount(20);
    await expect(table.locator('.bro-vuetify-paginator-range')).toHaveText('1 – 5 of 20');
    expect(errors).toEqual([]);
  });
}

test('the Nuxt sample shows the prerendered table in the markup of Vuetify before its scripts run', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();

  await serve(page);
  await page.goto(`${origin}/samples/vue-vuetify/nuxt/`);

  const table = page.locator('table-bro#orders');

  // The loading state of the table: the toolbar, the sort headers, the progress bar and the paginator of Vuetify
  await expect(table).toHaveAttribute('data-bro-prerender', '');
  await expect(table.locator('bro-vuetify-toolbar-main .v-toolbar')).toHaveCount(1);
  await expect(table.locator('bro-vuetify-sort-header .bro-vuetify-sort-header')).not.toHaveCount(0);
  await expect(table.locator('bro-vuetify-progress-bar .v-progress-linear')).toHaveCount(1);
  await expect(table.locator('bro-vuetify-paginator .bro-vuetify-paginator')).toHaveCount(1);

  const prerendered = (await table.boundingBox())!.height;

  await context.close();

  // The table of the browser takes the place of the prerender at the same height: the page has no layout shift
  const live = await browser.newPage();

  await serve(live);
  await live.goto(`${origin}/samples/vue-vuetify/nuxt/`);
  await expect(bodyTable(live.locator('table-bro#orders')).locator('tbody > tr[data-row-number]')).toHaveCount(20);
  expect((await live.locator('table-bro#orders').boundingBox())!.height).toBe(prerendered);
  await live.close();
});

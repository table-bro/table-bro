import fs   from 'node:fs';
import path from 'node:path';

import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The page of samples/no-build, as `npm run build:samples` copies it into dist/samples/no-build: without a bundler, it
// takes the packages, as npm publishes them, from jsDelivr by an import map. The test needs the network to the CDN and
// skips without it.

const dist = path.join(__dirname, '../dist/samples/no-build');
const origin = 'http://samples.localhost';
const cdn = 'https://cdn.jsdelivr.net/npm/@table-bro/core/package.json';

test.skip(!fs.existsSync(dist), 'npm run build:samples copies the page of samples/no-build');

test.beforeAll(async () => {
  const online = await fetch(cdn, {method: 'HEAD', signal: AbortSignal.timeout(5000)}).then(response => response.ok, () => false);

  test.skip(!online, 'the page takes the packages from cdn.jsdelivr.net');
});

test.beforeEach(async ({page}) => {
  // The files of the page, as a static host serves them: a folder gives its index.html
  await page.route(`${origin}/samples/no-build/**`, route => {
    const file = path.join(dist, new URL(route.request().url()).pathname.slice('/samples/no-build/'.length));

    return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
  });
});

test('the sample without a build shows its table from the packages of the CDN and logs its bro-action', async ({page}) => {
  const errors: string[] = [];
  const logs: string[] = [];

  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => logs.push(message.text()));

  await page.goto(`${origin}/samples/no-build/`);

  const table = page.locator('table-bro#orders');
  const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

  await expect(table).toHaveClass(/\bnv\b/);
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('Modern Cotton Chair');

  await table.locator('table.bro-table-header th[data-bro-column-key="price"] .bro-sort-header').click();
  await expect.poll(() => logs).toContain('bro-filters-sort');

  expect(errors).toEqual([]);
});

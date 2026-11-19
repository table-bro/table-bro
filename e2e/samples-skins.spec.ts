import fs   from 'node:fs';
import path from 'node:path';

import {expect, test} from '@playwright/test';

import {bodyTable} from './table-bro.fixtures';

// The page of each skin in samples/, as `npm run build:samples` builds it into dist/samples/<name>: the page installs the
// packages from the local registry, where `npm run publish:packages` put them as a release publishes them to npm, so a
// package that npm would publish without its build fails the build of the page or this test.

const dist = path.join(__dirname, '../dist/samples');
const origin = 'http://samples.localhost';

const samples = [
  {name: 'angular-material', skin: 'mat'},
  {name: 'bootstrap', skin: 'bs'},
  {name: 'native', skin: 'nv'}
];

for (const {name, skin} of samples) {
  test(`the ${name} sample shows its table in the skin ${skin}`, async ({page}) => {
    test.skip(!fs.existsSync(path.join(dist, name)), `npm run build:samples builds the page of samples/${name}`);

    const errors: string[] = [];

    page.on('pageerror', error => errors.push(error.message));

    // The built files, as a static host serves them: a folder gives its index.html
    await page.route(`${origin}/samples/${name}/**`, route => {
      const file = path.join(dist, name, new URL(route.request().url()).pathname.slice(`/samples/${name}/`.length));

      return route.fulfill({path: fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file});
    });

    await page.goto(`${origin}/samples/${name}/`);

    const table = page.locator('table-bro#orders');
    const rows = bodyTable(table).locator('tbody > tr[data-row-number]');

    await expect(table).toHaveClass(new RegExp(`\\b${skin}\\b`));
    await expect(rows).toHaveCount(20);
    await expect(rows.first()).toContainText('Handcrafted Wooden Table, Gorgeous Bronze Watch');

    expect(errors).toEqual([]);
  });
}

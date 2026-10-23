import type {BroTextsConfig, TableBroHTMLElement} from '@table-bro/core';

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

for (const skin of ['bs', 'nv']) {
  test(`the ${skin} filter drawer takes its title and the names of its close button and filters from the config of its table`, async ({page}) => {
    await page.goto('/vanilla/', {waitUntil: 'networkidle'});

    if (skin === 'nv') {
      await page.getByLabel('Native').check();
    }

    const table = page.locator('table-bro');
    const container = page.locator('table-bro-filter-drawer-container');
    const title = container.locator('.bro-filter-drawer-title');
    const close = container.locator('.bro-filter-drawer-close [aria-label]');
    const filters = container.locator('[slot="filters"]');
    // A new config of the same table, as an application that changes its language
    const configure = (texts: BroTextsConfig) => table.evaluate((el, {skin, texts}) => {
      (<TableBroHTMLElement>el).configure({
        cols: [{title: 'Feature', name: 'featureName'}],
        rows: [],
        conf: {skin, texts, components: {toolbarMain: {buttons: [{buttonTitle: 'Filters', eventType: 'bro-filters-toggle'}]}}}
      });
    }, {skin, texts});
    const open = () => table.locator('.bro-toolbar a', {hasText: 'Filters'}).click();

    await open();
    await expect(title).toHaveText('Filters');
    await expect(close).toHaveAttribute('aria-label', 'Close');
    await close.click();

    await configure({filterDrawer: {title: 'Refine', close: 'Dismiss'}});
    await open();
    await expect(title).toHaveText('Refine');
    await expect(close).toHaveAttribute('aria-label', 'Dismiss');
    await expect(filters).toHaveAttribute('aria-label', 'Refine');
    await close.click();

    await configure({filters: 'Narrow down'});
    await open();
    await expect(title).toHaveText('Narrow down');
    await expect(close).toHaveAttribute('aria-label', 'Close');
    await expect(filters).toHaveAttribute('aria-label', 'Narrow down');
  });
}

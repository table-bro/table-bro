import type {BroFilterDrawerHTMLElement, TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, type Page, test} from '@playwright/test';
import {compile}                               from 'sass';

import type {createContext} from '../packages/core/shared/context';
import {bodyTable}          from './table-bro.fixtures';

// The styles that the skins give an application by themselves, without the styles of the stand.

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

test('the mat skin lets the page show through the container of its filter drawer', async ({page}) => {
  const {css} = compile('packages/skins/angular-material/styles/table-bro.material.scss', {
    loadPaths: ['node_modules', 'packages/core/styles/mappings/development'],
    silenceDeprecations: ['import'],
    quietDeps: true
  });

  // The skin gives the transparent background, not the stand
  expect(css).toMatch(/table-bro-filter-drawer-container-ng \.mat-drawer-container \{\s*--mat-sidenav-content-background-color: transparent;/);

  await page.goto('/', {waitUntil: 'networkidle'});

  const container = page.locator('table-bro-filter-drawer-container-ng .mat-drawer-container').first();

  await expect(container).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

/** A table of the skin with the width of its host, on the stand page. */
async function mountTable(page: Page, skin: string, width: string, config: Record<string, unknown> = {}): Promise<Locator> {
  if (new URL(page.url()).pathname !== '/') {
    await page.goto('/', {waitUntil: 'networkidle'});
  }

  await page.evaluate(({skin, width, config}) => {
    document.querySelector('#e2e-skin-table')?.remove();

    const el = document.createElement('table-bro') as TableBroHTMLElement;

    el.id = 'e2e-skin-table';
    el.style.width = width;
    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}], rows: Array.from({length: 1000}, (_, i) => ({name: `n${i}`, price: i})), conf: {skin, ...config}});
    document.body.append(el);
  }, {skin, width, config});

  const table = page.locator('table-bro#e2e-skin-table');

  await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();

  return table;
}

for (const [skin, minWidth] of [['mat', 541], ['bs', 670], ['nv', 594]] as const) {
  test(`the ${skin} skin keeps the table at least ${minWidth}px wide, with its paginator`, async ({page}) => {
    const table = await mountTable(page, skin, '300px');
    const paginator = table.locator('.bro-paginator-container');

    await expect(table).toHaveCSS('--bro-table-min-width', `${minWidth}px`);

    // A narrower width of the page: the table takes its minimum width, and its paginator keeps within it
    expect((await table.boundingBox())!.width).toBe(minWidth);
    expect((await paginator.boundingBox())!.width).toBe(minWidth);

    await table.evaluate((el: HTMLElement) => el.style.width = '800px');
    await expect.poll(async () => (await paginator.boundingBox())!.width).toBe(800);
  });

  test(`the paginator of the ${skin} skin stays in one line at its minimum width on the last page of 1000 rows`, async ({page}) => {
    // A narrow width of the page: the table takes the minimum width of the skin
    const table = await mountTable(page, skin, '300px', {pageSize: 5, debug: true});

    // The range writes the number of rows: 996 – 1,000 of 1,000 is the widest one
    const lines = await table.evaluate(async (el: E2EDebugTable) => {
      const paginator: HTMLElement = el[Symbol.for('table-bro:debug')].view.paginator.el;
      const buttons = [...paginator.querySelectorAll<HTMLElement>('a, button')].filter(button => button.offsetParent);

      buttons[buttons.length - 1].click();
      await new Promise(resolve => setTimeout(resolve, 500));

      const centers = [...paginator.querySelectorAll<HTMLElement>('*')]
        .filter(node => node.offsetParent && !node.closest('select') && node.children.length === 0 && node.getBoundingClientRect().height > 0)
        .map(node => node.getBoundingClientRect())
        .map(rect => Math.round((rect.top + rect.height / 2) / 12));

      return {range: /1,?000 of 1,?000/.test(paginator.innerText), lines: new Set(centers).size};
    });

    expect(lines).toEqual({range: true, lines: 1});
  });
}

test('the search of the mat skin keeps its buttons in the toolbar of a narrow table', async ({page}) => {
  const table = await mountTable(page, 'mat', '300px');
  const toolbar = table.locator('.bro-table-toolbar_container');

  await toolbar.getByRole('button', {name: 'Search'}).click();

  const search = toolbar.locator('.bro-toolbar-search');
  const clear = search.locator('.bro-toolbar-clear');

  await expect(clear).toBeVisible();

  const searchBox = (await search.boundingBox())!;
  const clearBox = (await clear.boundingBox())!;
  const inputBox = (await search.locator('input').boundingBox())!;

  // The buttons and the field lie in one row, and the field takes the width between the buttons
  expect(clearBox.x + clearBox.width).toBeLessThanOrEqual(searchBox.x + searchBox.width);
  expect(Math.abs((clearBox.y + clearBox.height / 2) - (inputBox.y + inputBox.height / 2))).toBeLessThan(2);
  expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(clearBox.x);
});

test('the filter drawer lies over a table that would be narrower than its minimum width next to it', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  await page.evaluate(() => {
    const box = document.createElement('div');
    const drawer = document.createElement('table-bro-filter-drawer-container');
    const filters = document.createElement('form');
    const el = document.createElement('table-bro') as TableBroHTMLElement;

    box.id = 'e2e-skin-drawer-box';
    box.style.width = '700px';
    el.style.width = '100%';
    // A minimum of the page, so the test sees which width the drawer reads
    el.style.setProperty('--bro-table-min-width', '400px');
    drawer.setAttribute('skin', 'bs');
    filters.slot = 'filters';
    filters.innerHTML = '<label>Name <input name="name"></label>';
    drawer.append(el, filters);
    box.append(drawer);
    document.body.append(box);
    el.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'a'}], conf: {skin: 'bs'}});
  });

  const box = page.locator('#e2e-skin-drawer-box');
  const drawer = box.locator('table-bro-filter-drawer-container');

  await drawer.evaluate((element: BroFilterDrawerHTMLElement) => element.opened = true);
  await expect(drawer).toHaveAttribute('opened', '');

  // Without a shadow container the table leaves 2 × 48px for its shadows, and the drawer takes 320px with a space of 24px:
  // at 700px the table would keep 700 - 96 - 344 = 260px, below its minimum width of 400px, at 900px 460px
  await expect(drawer).toHaveAttribute('modal', '');

  await box.evaluate((element: HTMLElement) => element.style.width = '900px');
  await expect(drawer).not.toHaveAttribute('modal');
});

test('the filter drawer of the mat skin lies over a table that would be narrower than its minimum width next to it', async ({page}) => {
  await page.goto('/', {waitUntil: 'networkidle'});

  const container = page.locator('table-bro-filter-drawer-container-ng').first();
  const table = container.locator('table-bro').first();
  const drawer = container.locator('mat-drawer');

  // A minimum of the page, so the test sees which width the drawer reads
  await table.evaluate((el: HTMLElement) => el.style.setProperty('--bro-table-min-width', '400px'));
  await table.getByRole('button', {name: 'Filters'}).click();
  await expect(drawer).toHaveClass(/mat-drawer-opened/);

  // Next to the drawer of 320px with its space, a container of 650px keeps 309px for the table, one of 800px 459px
  await container.evaluate((el: HTMLElement) => el.style.width = '650px');
  await expect(drawer).toHaveClass(/mat-drawer-over/);

  await container.evaluate((el: HTMLElement) => el.style.width = '800px');
  await expect(drawer).toHaveClass(/mat-drawer-side/);
});

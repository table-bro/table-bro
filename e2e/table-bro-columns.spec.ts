import type {BroRow, TableBroHTMLElement} from '@table-bro/core';

import {expect, test} from '@playwright/test';

import type {createContext} from '../packages/core/shared/context';
import {bodyTable}          from './table-bro.fixtures';
import {cellTexts, mount}   from './table-bro.mount';

// The columns: the classes and the attributes of their keys, their widths, and how they follow the host and the filter drawer.

/** The window of the page with the globals that the scripts of these tests set. */
type E2EWindow = typeof window & {
  e2eTable: TableBroHTMLElement;
  e2eWidthWrites: number;
  e2eRows: BroRow[];
  e2eFirstTransitions: number;
};

/** A table with config.debug: the context of the instance is under Symbol.for('table-bro:debug'). */
interface E2EDebugTable extends TableBroHTMLElement {
  [debug: symbol]: ReturnType<typeof createContext>;
}

test('every cell of a column has the class and the attribute of its key, also for two columns of one field', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Name again', name: 'name', className: 'shared'}, {title: 'Price', name: 'price', className: 'shared'}], rows, conf: {skin: 'mat'}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  for (const key of ['name', 'name-2', 'price']) {
    await expect(table.locator(`table.bro-table-header th.bro-col--${key}[data-bro-column-key="${key}"]`)).toHaveCount(1);
    await expect(bodyTable(table).locator(`tbody > tr[data-row-number] > td.bro-col--${key}[data-bro-column-key="${key}"]`)).toHaveCount(3);
  }

  // The widths are written by key: the class shared by two columns no longer gives them one rule
  const styles = await table.evaluate(el => Array.from(el.querySelectorAll(':scope > style')).map(style => style.textContent || '').join('\n'));

  expect(styles).toContain('[data-bro-column-key="name-2"]');
  expect(styles).not.toContain('.shared');
  await expect(table.locator('[class*="bro-col-"]:not([class*="bro-col--"])')).toHaveCount(0);
});

for (const skin of ['mat', 'bs']) {
  test(`a column of buttons in a narrow ${skin} table keeps the width of its buttons`, async ({page}) => {
    const table = await mount(page, `
      const details = {title: '', name: 'details', component: {
        selector: 'bro-details-button',
        attrs: {title: 'Details', name: 'bro-details-toggle'},
        event: 'action'
      }};

      // Three short columns come before the buttons, so the buttons fall into the shared rest of the table
      const narrowCols = [{title: 'A', name: 'a'}, {title: 'B', name: 'b'}, {title: 'C', name: 'c'}, details, {title: 'Description', name: 'description'}];
      const narrowRows = [{a: 'a', b: 'bb', c: 'ccc', description: 'A description long enough to take the rest of any table, and more of it'}];

      el.style.width = '420px';
      el.configure({cols: narrowCols, rows: narrowRows, conf: {skin: '${skin}', rowDetailsComponent: 'div'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['a']);

    const button = bodyTable(table).locator('tr[data-row-number="1"] > td[data-bro-column-key="details"] > .bro-cell_component');
    const size = await button.evaluate(el => ({client: el.clientWidth, scroll: el.scrollWidth}));

    expect(size.scroll).toBeLessThanOrEqual(size.client);
  });
}

test('new rows of replaceRows measure the widths of the body again', async ({page}) => {
  const table = await mount(page, `
    el.style.width = '900px';
    el.configure({cols: [{title: 'Name', name: 'name'}], rows: [{name: 'a'}, {name: 'b'}], conf: {skin: 'mat'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['a', 'b']);

  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows([{name: 'a name longer than the first ones'}]));
  await expect.poll(() => cellTexts(table, 2)).toEqual(['a name longer than the first ones']);

  // The column fits the new value, so the value stays a plain one instead of a shortened text with a tooltip
  await expect(bodyTable(table).locator('tr[data-row-number="1"] > td[data-bro-column-key="name"] > span.bro-cell_component')).toHaveCount(1);
});

for (const skin of ['mat', 'nv']) {
  test(`the tooltips of the ${skin} header follow the width of the columns`, async ({page}) => {
    const table = await mount(page, `
      const longCols = [{title: 'The name of the thing in this row', name: 'name'}, {title: 'The price of the thing in dollars', name: 'price'}];

      el.style.width = '1200px';
      el.configure({cols: longCols, rows, conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const header = table.locator('table.bro-table-header th[data-bro-column-key="name"] .bro-sort-header');
    const width = (px: number) => table.evaluate((el, px) => (el as HTMLElement).style.width = `${px}px`, px);

    await expect(header).toHaveAttribute('tooltip', '');

    // A narrow host shortens the titles: the header shows the whole title in its tooltip
    await width(240);
    await expect(header).toHaveAttribute('tooltip', 'The name of the thing in this row');

    if (skin === 'nv') {
      await expect(header.locator('.bro-sort-header-container')).toHaveAttribute('title', 'The name of the thing in this row');
    }

    await width(1200);
    await expect(header).toHaveAttribute('tooltip', '');
  });
}

test('the columns follow a narrower and a wider host', {tag: '@smoke'}, async ({page}) => {
  const table = await mount(page, `
    el.style.width = '1000px';
    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Description', name: 'description'}], rows: [{name: 'a', description: 'A description long enough to need some room in its column'}], conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['a']);

  const columnsWidth = () => table.evaluate(el => (el as E2EDebugTable)[Symbol.for('table-bro:debug')].model.columnsWidth);
  const headerWidth = () => table.locator('table.bro-table-header').evaluate(el => el.getBoundingClientRect().width);

  // The mat skin keeps a table at least 552 px wide
  await table.evaluate(el => (el as HTMLElement).style.width = '600px');
  await expect.poll(columnsWidth).toBe(600);

  // The columns narrow with the width transition of the skin
  await expect.poll(headerWidth).toBeLessThanOrEqual(601);

  await table.evaluate(el => (el as HTMLElement).style.width = '900px');
  await expect.poll(columnsWidth).toBe(900);
});

test('a table rendered while hidden measures its columns when it shows', async ({page}) => {
  const table = await mount(page, `
    const hidden = document.createElement('div');

    hidden.id = 'e2e-hidden';
    hidden.style.display = 'none';
    hidden.append(el);
    document.body.append(hidden);

    el.style.width = '800px';
    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Price', name: 'price', dataType: 'number'}], rows, conf: {skin: 'mat', debug: true}});
  `);

  const model = () => table.evaluate(el => {
    const {model} = (el as E2EDebugTable)[Symbol.for('table-bro:debug')];

    return {columnsWidth: model.columnsWidth, name: model.theadCols?.[1].clientWidth};
  });

  expect(await model()).toEqual({columnsWidth: 0, name: 0});

  await page.evaluate(() => document.querySelector<HTMLElement>('#e2e-hidden')!.style.display = '');

  await expect.poll(async () => (await model()).columnsWidth).toBe(800);
  expect((await model()).name).toBeGreaterThan(0);
  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  // The header and the body share the widths of their columns again
  const widths = await table.evaluate(el => ['name', 'price'].map(key => [
    Math.round(el.querySelector(`table.bro-table-header th[data-bro-column-key="${key}"]`)!.getBoundingClientRect().width),
    Math.round(el.querySelector(`table.bro-table:not(.bro-table-aux) td[data-bro-column-key="${key}"]`)!.getBoundingClientRect().width)
  ]));

  for (const [header, body] of widths) {
    expect(Math.abs(header - body)).toBeLessThanOrEqual(1);
  }
});

for (const skin of ['mat', 'bs']) {
  test(`the columns of the ${skin} table take the width of the open filter drawer once, not in every frame of its transition`, async ({page}) => {
    await page.goto('/', {waitUntil: 'networkidle'});

    if (skin !== 'mat') {
      await page.locator('mat-button-toggle', {hasText: 'Vanilla Bootstrap'}).first().click();
    }

    const table = page.locator('table-bro').first();

    await expect(table.locator('tbody > tr[data-row-number]').first()).toBeAttached();
    await page.waitForTimeout(500);

    // Every write of the body widths during the transition of the drawer
    await table.evaluate(el => {
      const style = el.querySelector(':scope > style[data-bro-column-widths="tbody"]')!;

      (window as E2EWindow).e2eWidthWrites = 0;
      new MutationObserver(() => (window as E2EWindow).e2eWidthWrites++).observe(style, {childList: true, characterData: true, subtree: true});
    });

    await table.getByRole('button', {name: 'Filters'}).or(table.locator('a', {hasText: 'Filters'})).first().click();
    await page.waitForTimeout(1000);

    expect(await page.evaluate(() => (window as E2EWindow).e2eWidthWrites)).toBe(1);

    const {host, header} = await table.evaluate(el => ({
      host: Math.round(el.getBoundingClientRect().width),
      header: Math.round(el.querySelector('table.bro-table-header')!.getBoundingClientRect().width)
    }));

    expect(header).toBeLessThanOrEqual(host);
  });
}

test('the styles of the column widths carry the nonce of config.styleNonce', async ({page}) => {
  const table = await mount(page, `
    el.configure({cols, rows, conf: {skin: 'mat', styleNonce: 'e2e-nonce'}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  const nonces = await table.evaluate(el => Array.from(el.querySelectorAll<HTMLStyleElement>(':scope > style')).map(style => style.nonce));

  expect(nonces).toEqual(['e2e-nonce', 'e2e-nonce']);
});

test('the widths of the columns apply to a table whose id needs escaping in a selector', async ({page}) => {
  await mount(page, `
    el.id = 'orders.v2';
    el.configure({cols, rows, conf: {skin: 'mat'}});
    document.body.append(el);
  `);

  await expect.poll(() => page.evaluate(() => {
    const el = document.getElementById('orders.v2')!;
    const style = el.querySelector<HTMLStyleElement>(':scope > style[data-bro-column-widths="tbody"]');

    if (!style?.sheet) {
      return false;
    }

    // Every rule of the widths finds the cells of its column in this table
    return style.sheet.cssRules.length > 0 && Array.from(style.sheet.cssRules).every(rule => !!el.parentElement!.querySelector((rule as CSSStyleRule).selectorText));
  })).toBe(true);
});

test('a width that the host never reaches stops holding back the layout of the columns', async ({page}) => {
  const table = await mount(page, `
    el.style.cssText = 'display: block; width: 1000px';
    el.configure({cols, rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  const columnsWidth = () => table.evaluate((el: E2EDebugTable) => Math.round(el[Symbol.for('table-bro:debug')].model.columnsWidth!));
  const resize = async (width: number) => {
    await table.evaluate((el, width) => (el as HTMLElement).style.width = `${width}px`, width);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };

  // A filter drawer declares 600; the host stops on its way, at 800, and the window then makes it 900. The widths stay
  // above 552 px, the least width of a table of the mat skin
  await table.evaluate(el => el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-columns-width', data: 600}})));
  await expect.poll(columnsWidth).toBe(600);

  await resize(800);
  expect(await columnsWidth()).toBe(600);

  await resize(900);
  await expect.poll(columnsWidth).toBe(900);
});

test('a width that steps back during the transition of a drawer lays nothing out until the transition ends', async ({page}) => {
  const table = await mount(page, `
    el.style.cssText = 'display: block; width: 1000px; --bro-filter-drawer-duration: 1500ms';
    el.configure({cols, rows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.durationScale = 1);

  const columnsWidth = () => table.evaluate((el: E2EDebugTable) => Math.round(el[Symbol.for('table-bro:debug')].model.columnsWidth!));
  const resize = async (width: number) => {
    await table.evaluate((el, width) => (el as HTMLElement).style.width = `${width}px`, width);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };

  // A drawer declares 600; on the way the host steps back for a moment, as when a scrollbar of the page comes. The widths
  // stay above 552 px, the least width of a table of the mat skin
  await table.evaluate(el => el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-columns-width', data: 600}})));
  await expect.poll(columnsWidth).toBe(600);

  for (const width of [800, 840, 750]) {
    await resize(width);
    expect(await columnsWidth()).toBe(600);
  }

  // The transition ends with the host at 750: the columns take it
  await expect.poll(columnsWidth, {timeout: 5000}).toBe(750);
});

test('rows that come during the transition of a drawer take the declared width at once', async ({page}) => {
  const table = await mount(page, `
    el.style.cssText = 'display: block; width: 1000px; --bro-filter-drawer-duration: 1500ms';

    // Long values: the widths of the columns depend on the width they are laid out for
    window.e2eRows = Array.from({length: 5}, (_, i) => ({
      name: 'row ' + (i + 1) + ' with a name long enough to need more room than the host gives it',
      note: 'a note long enough to need room as well ' + i
    }));

    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Note', name: 'note'}], conf: {skin: 'mat', debug: true, server: true}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  // The table loads: it has its header, the rows come later
  await expect.poll(() => table.evaluate((el: E2EDebugTable) => !!el[Symbol.for('table-bro:debug')].model.theadCols)).toBe(true);
  await table.evaluate((el: E2EDebugTable) => el[Symbol.for('table-bro:debug')].motion.durationScale = 1);

  const bodyWidths = () => table.evaluate(el => el.querySelector(':scope > style[data-bro-column-widths="tbody"]')?.textContent?.match(/width:\s*[\d.]+px/g)?.join() ?? '');
  const resize = async (width: number) => {
    await table.evaluate((el, width) => (el as HTMLElement).style.width = `${width}px`, width);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };

  // A drawer declares 400 while the table loads, and the rows come with the host on the way
  await table.evaluate(el => el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-columns-width', data: 400}})));
  await resize(900);
  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows((window as E2EWindow).e2eRows, {total: 5}));
  await expect.poll(bodyWidths).not.toBe('');

  const widths = await bodyWidths();

  // The rows keep the widths they came with on the rest of the way and at its end
  for (const width of [800, 600, 400]) {
    await resize(width);
    expect(await bodyWidths()).toBe(widths);
  }
});

test('a wide column after narrow ones never moves to and fro while a drawer narrows the table', async ({page}) => {
  const table = await mount(page, `
    // The host narrows as with a filter drawer: by its duration and its curve
    el.style.cssText = 'display: block; width: 1000px; transition: width 400ms cubic-bezier(.4, 0, .2, 1)';
    const longRows = Array.from({length: 5}, (_, i) => ({
      code: i + 1,
      flag: 'x',
      name: 'row ' + (i + 1) + ' with a name long enough to need more room than the host gives it',
      note: 'a note long enough to need room as well ' + i
    }));

    el.configure({cols: [{title: 'Code', name: 'code'}, {title: 'F', name: 'flag'}, {title: 'Name', name: 'name'}, {title: 'Note', name: 'note'}], rows: longRows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 3)).toHaveLength(5);
  await page.waitForTimeout(600);

  // The left edge of the wide column in every frame of the transition
  const lefts: number[] = await table.evaluate(el => new Promise(resolve => {
    const th = el.querySelector('table.bro-table-header .bro-header-row > th:nth-child(4)')!;
    const lefts: number[] = [];
    const t0 = performance.now();
    const sample = () => {
      lefts.push(th.getBoundingClientRect().left - el.getBoundingClientRect().left);

      if (performance.now() - t0 < 700) {
        requestAnimationFrame(sample);
      } else {
        resolve(lefts);
      }
    };

    (el as HTMLElement).style.width = '600px';
    el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-columns-width', data: 600}}));
    requestAnimationFrame(sample);
  }));

  // The narrow columns before it keep their widths, as the widths fill the table to the pixel: the edge may also stand
  const steps = lefts.slice(1).map((left, i) => left - lefts[i]).filter(step => Math.abs(step) > 0.5);

  expect(steps.every(step => Math.sign(step) === Math.sign(steps[0]))).toBe(true);
});

test('the first widths of the columns come without the width transition of the skin', async ({page}) => {
  const table = await mount(page, `
    // A width of the CSS of the application, as bro-text-ellipsis-width gives it, wider than the table gives the column
    const css = document.createElement('style');
    css.textContent = '.e2e-wide .bro-cell_component { width: 400px; }';
    document.head.append(css);

    el.style.cssText = 'display: block; width: 400px';
    const longRows = Array.from({length: 5}, (_, i) => ({name: 'row ' + (i + 1) + ' with a name long enough to need more room than the host gives it', note: 'a note long enough to need room as well ' + i}));

    el.configure({cols: [{title: 'Name', name: 'name', className: 'e2e-wide'}, {title: 'Note', name: 'note'}], rows: longRows, conf: {skin: 'mat', debug: true}});
    document.body.append(el);

    // The width transitions on the cells in the first frame of the table
    requestAnimationFrame(() => window.e2eFirstTransitions = el.getAnimations({subtree: true}).filter(animation => animation.transitionProperty === 'width').length);
  `);

  await expect.poll(() => page.evaluate(() => (window as E2EWindow).e2eFirstTransitions)).toBe(0);
  await expect(table.locator('table.bro-table:not(.bro-table-aux):not(.bro-table-header) td.e2e-wide .bro-cell_component').first()).not.toHaveCSS('width', '400px');

  // A later width of the table moves the columns with the transition of the skin as before
  await table.evaluate(el => el.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-columns-width', data: 300}})));

  expect(await table.evaluate(el => el.getAnimations({subtree: true}).filter(animation => (animation as CSSTransition).transitionProperty === 'width').length)).toBeGreaterThan(0);
});

test('the header of a table that waited for its rows moves to the widths of the rows with the transition', async ({page}) => {
  const table = await mount(page, `
    el.style.cssText = 'display: block; width: 800px';

    // No rows yet: the table shows its header at the widths of the titles
    el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Note', name: 'note'}], conf: {skin: 'mat'}});
    document.body.append(el);
    window.e2eTable = el;
  `);

  const headerMoves = () => table.evaluate(el => el.querySelector('table.bro-table-header')!.getAnimations({subtree: true})
    .some(animation => (animation as CSSTransition).transitionProperty === 'width'));

  // The header stands at the widths of its titles and has no width transition under way
  await expect.poll(() => table.locator('table.bro-table-header th').count()).toBeGreaterThan(0);
  await page.waitForTimeout(700);
  expect(await headerMoves()).toBe(false);

  await page.evaluate(() => (window as E2EWindow).e2eTable.replaceRows([{name: 'a', note: 'a note much longer than the title of its column, so the column takes the rest of the table'}]));

  // The rows give the header their widths: it moves to them with the transition of the skin, it does not jump
  await expect.poll(headerMoves, {timeout: 5_000, intervals: [16]}).toBe(true);
});

test('the answer of the server to a search keeps the widths of the columns', async ({page}) => {
  const table = await mount(page, `
    el.addEventListener('bro-action', event => {
      if (event.detail.action === 'bro-filters-server-loaded') {
        const {page, pageSize} = event.detail.data;

        el.replaceRows([{name: 'a found row with a name much longer than the names before', price: 1}], {total: 1});
      }
    });

    el.configure({cols, rows: [{name: 'b', price: 3}, {name: 'a', price: 1}], conf: {skin: 'mat', server: true}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a']);

  const widths = () => table.evaluate(el => el.querySelector(':scope > style[data-bro-column-widths="tbody"]')!.textContent);
  const before = await widths();

  await table.evaluate(el => {
    el.querySelector('tbody')!.dispatchEvent(new CustomEvent('bro-action', {bubbles: true, detail: {action: 'bro-filters-filter', data: {search: 'found'}}}));
  });

  await expect.poll(() => cellTexts(table, 2)).toEqual(['a found row with a name much longer than the names before']);
  expect(await widths()).toBe(before);
});

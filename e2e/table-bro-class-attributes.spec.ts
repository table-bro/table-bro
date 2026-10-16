import {expect, test} from '@playwright/test';

import {cellTexts, mount} from './table-bro.mount';

// The class attributes of the table: no empty attribute and no space at the edges, also without the classes of a skin.

/** The elements with an empty class attribute, or with a space at the edge of it. */
const badClass = '[class=""], [class^=" "], [class$=" "]';

for (const skin of ['mat', 'bs', 'nv']) {
  test(`the ${skin} skin writes no empty class attribute`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', toolbarTitle: 'Prices', components: {toolbarMain: {buttons: [{title: 'Export'}]}}}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await expect(table.locator(badClass)).toHaveCount(0);
  });
}

for (const skin of ['bs', 'nv']) {
  test(`the ${skin} skin without classes and shadows writes no class attribute for them`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: '${skin}', shadowsEnabled: false, toolbarTitle: 'Prices',
        css: {table: {className: '', thead: {tr: {className: '', th: {className: ''}}}, tbody: {tr: {className: '', td: {className: ''}}}}},
        components: {
          paginator: {css: {ul: {className: '', li: {className: '', a: {className: ''}}}}},
          toolbar: {css: {nav: {div: {className: ''}}}},
          toolbarMain: {buttons: [{title: 'Export'}], css: {navbarCollapse: {ul: {className: ''}}}}
        }
      }});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);
    await expect(table.locator(badClass)).toHaveCount(0);

    // The shadows of the regions keep their own class
    for (const shadow of ['bro-table-toolbar_shadow', 'bro-table-header_shadow', 'bro-paginator-shadow']) {
      await expect(table.locator(`.${shadow}`)).toHaveAttribute('class', shadow);
    }
  });
}

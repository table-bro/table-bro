import {expect, test} from '@playwright/test';

import {bodyTable}        from './table-bro.fixtures';
import {cellTexts, mount} from './table-bro.mount';

// The classes of the config in the markup of the table: a class with a quote stays a class and adds no attribute.

test('a quote in the classes of the config keeps the markup of the table whole', async ({page}) => {
  const table = await mount(page, `
    const quoted = 'e2e-class" data-injected="1';
    const details = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    el.configure({cols: [...cols, details], rows, conf: {skin: 'nv', rowDetailsComponent: 'div', css: {
      table: {className: quoted, thead: {tr: {className: quoted, th: {className: quoted}}}, tbody: {tr: {className: quoted, td: {className: quoted}}}},
      shadow: {className: quoted}
    }}});
    document.body.append(el);
  `);

  await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

  await bodyTable(table).locator('tbody > tr[data-row-number="1"]').getByRole('button', {name: 'Details'}).click();
  await expect(bodyTable(table).locator('tr.bro-details_tr > td')).toHaveCount(1);

  // No part of a class became an attribute
  await expect(table.locator('[data-injected]')).toHaveCount(0);

  // The shadows of the toolbar, of the header and of the paginator keep the class of the config and their own one
  for (const shadow of ['bro-table-toolbar_shadow', 'bro-table-header_shadow', 'bro-paginator-shadow']) {
    await expect(table.locator(`.${shadow}`)).toHaveClass(/^e2e-class" data-injected="1 /);
  }

  await expect(bodyTable(table)).toHaveClass(/e2e-class" data-injected="1/);
  await expect(bodyTable(table).locator('tbody > tr[data-row-number="1"]:not(.bro-details_tr)')).toHaveClass(/e2e-class" data-injected="1/);
  await expect(bodyTable(table).locator('tbody > tr[data-row-number="1"]:not(.bro-details_tr) > td').first()).toHaveClass(/e2e-class" data-injected="1/);
  await expect(bodyTable(table).locator('tr.bro-details_tr > td')).toHaveClass(/e2e-class" data-injected="1/);
  await expect(table.locator('table.bro-table-header th').first()).toHaveClass(/e2e-class" data-injected="1/);
});

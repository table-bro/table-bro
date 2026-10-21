import type {TableBroHTMLElement} from '@table-bro/core';

import {expect, type Locator, test} from '@playwright/test';

import {mount} from './table-bro.mount';

// The paginator of the vanilla skins disables the buttons of the pages before the first and after the last page,
// as MatPaginator of the mat skin does.

/** The four buttons of the paginator of the table. */
function buttons(table: Locator): {first: Locator; previous: Locator; next: Locator; last: Locator} {
  const paginator = table.locator('.bro-paginator-container');

  return {
    first: paginator.getByRole('link', {name: 'First page'}),
    previous: paginator.getByRole('link', {name: 'Previous page'}),
    next: paginator.getByRole('link', {name: 'Next page'}),
    last: paginator.getByRole('link', {name: 'Last page'})
  };
}

/** Whether the item of the button has the class disabled and the button tells it to screen readers. */
async function expectDisabled(button: Locator, disabled: boolean): Promise<void> {
  if (disabled) {
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button.locator('xpath=..')).toHaveClass(/(^| )disabled( |$)/);
  } else {
    await expect(button).not.toHaveAttribute('aria-disabled');
    await expect(button.locator('xpath=..')).not.toHaveClass(/(^| )disabled( |$)/);
  }
}

for (const skin of ['bs', 'nv']) {
  test(`the ${skin} paginator disables First and Previous on the first page, and Next and Last on the last one`, async ({page}) => {
    const table = await mount(page, `
      const twelve = Array.from({length: 12}, (_, i) => ({name: 'row ' + (i + 1), price: i}));

      el.style.width = '900px';
      el.configure({cols, rows: twelve, conf: {skin: '${skin}'}});
      document.body.append(el);
    `);
    const {first, previous, next, last} = buttons(table);

    // Three pages of 5 rows
    await expectDisabled(first, true);
    await expectDisabled(previous, true);
    await expectDisabled(next, false);
    await expectDisabled(last, false);

    await next.click();

    for (const button of [first, previous, next, last]) {
      await expectDisabled(button, false);
    }

    await last.click();

    await expectDisabled(first, false);
    await expectDisabled(previous, false);
    await expectDisabled(next, true);
    await expectDisabled(last, true);
  });
}

for (const [skin, control] of [['bs', '.dropdown-toggle'], ['nv', 'select']]) {
  test(`the page size list of the ${skin} paginator is disabled while the table loads, as the one of the mat skin, and works with rows`, async ({page}) => {
    const table = await mount(page, `
      el.configure({cols, conf: {skin: '${skin}'}});
      document.body.append(el);
    `);
    const list = table.locator(`.bro-paginator-page-size ${control}`);

    await expect(list).toBeDisabled();

    await table.evaluate((el, rows) => (el as TableBroHTMLElement).replaceRows(rows), [{name: 'b', price: 3}, {name: 'a', price: 1}]);
    await expect(list).toBeEnabled();

    await table.evaluate(el => (el as TableBroHTMLElement).setState('loading'));
    await expect(list).toBeDisabled();
  });
}

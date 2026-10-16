import {expect, type Locator, type Page, test} from '@playwright/test';

import {cellTexts, mount} from './table-bro.mount';

// The titles of the header in the three skins: a column with short values is as wide as its whole title while the table
// has room; without room the title is cut with an ellipsis, and its tooltip shows the whole title.

const longCols = `[
  {title: 'The name of the thing in this row', name: 'name', tooltip: 'What the row is about'},
  {title: 'The price of the thing in dollars', name: 'price'}
]`;

/** The sort header of the column with the name. */
function sortHeader(table: Locator, name: string): Locator {
  return table.locator(`table.bro-table-header th[data-bro-column-key="${name}"] .bro-sort-header`);
}

/** The element of the title in the sort header of the column with the name, in the three skins. */
function headerTitle(table: Locator, name: string): Locator {
  return sortHeader(table, name).locator('.bro-sort-header-content, .mat-sort-header-content');
}

/**
 * Sets a new width of the host. A declared width of the columns (bro-columns-width) would hold only until the host is
 * measured again, too short for a tooltip that shows on hover.
 */
function width(table: Locator, px: number): Promise<void> {
  return table.evaluate((el, px) => {
    el.style.width = `${px}px`;
  }, px);
}

/**
 * How the title shows: whole, or cut with an ellipsis. text-overflow applies to a block container that clips its line,
 * not to the anonymous item of a flex container, which a title of text is there.
 * @param title The element of the title.
 */
function titleShows(title: Locator): Promise<'whole' | 'ellipsis' | 'cut'> {
  return title.evaluate(el => {
    const style = getComputedStyle(el);
    const ellipsis = style.textOverflow === 'ellipsis' && style.overflow === 'hidden' && style.whiteSpace === 'nowrap'
      && !style.display.includes('flex');

    if (el.scrollWidth <= el.clientWidth) {
      return 'whole';
    }

    return ellipsis ? 'ellipsis' : 'cut';
  });
}

/**
 * Checks the tooltip that the skin shows for the sort header: the title attribute of nv, the Tooltip of Bootstrap in bs,
 * the matTooltip in mat.
 * @param page The page of the table.
 * @param skin The skin of the table.
 * @param header The sort header.
 * @param text The text of the tooltip.
 */
async function expectSkinTooltip(page: Page, skin: string, header: Locator, text: string): Promise<void> {
  if (skin === 'nv') {
    await expect(header.locator('.bro-sort-header-container')).toHaveAttribute('title', text);

    return;
  }

  const tooltip = page.locator(skin === 'bs' ? '.tooltip' : '.mat-mdc-tooltip');

  await header.hover();
  await expect(tooltip).toHaveText(text);

  // The pointer leaves, so the next check sees the next tooltip only
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
}

for (const skin of ['nv', 'bs', 'mat']) {
  test(`the ${skin} header shows the whole titles of the columns with short values while the table has room`, async ({page}) => {
    // The host is no narrower than the paginator in one line, unless the application lowers its min width, as here
    const table = await mount(page, `
      el.style.width = '1200px';
      el.style.setProperty('--bro-table-min-width', '0px');
      el.configure({cols: ${longCols}, rows, conf: {skin: '${skin}', shortColumnTitle: col => col.title.split(' ').pop()}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const name = sortHeader(table, 'name');
    const price = sortHeader(table, 'price');

    // The values of one letter leave room for the titles: the header has the tooltips of the columns
    await expect.poll(() => titleShows(headerTitle(table, 'name'))).toBe('whole');
    await expect.poll(() => titleShows(headerTitle(table, 'price'))).toBe('whole');
    await expect(name).toHaveAttribute('tooltip', 'What the row is about');
    await expect(price).toHaveAttribute('tooltip', '');
    await expectSkinTooltip(page, skin, name, 'What the row is about');

    // A narrow host has no room for the titles: they are cut with an ellipsis, and the tooltips show them whole
    await width(table, 240);
    await expect.poll(() => titleShows(headerTitle(table, 'name'))).toBe('ellipsis');
    await expect.poll(() => titleShows(headerTitle(table, 'price'))).toBe('ellipsis');
    await expect(name).toHaveAttribute('tooltip', 'The name of the thing in this row');
    await expect(price).toHaveAttribute('tooltip', 'The price of the thing in dollars');
    await expectSkinTooltip(page, skin, name, 'The name of the thing in this row');

    await width(table, 1200);
    await expect.poll(() => titleShows(headerTitle(table, 'name'))).toBe('whole');
    await expect(name).toHaveAttribute('tooltip', 'What the row is about');
    await expect(price).toHaveAttribute('tooltip', '');
    await expectSkinTooltip(page, skin, name, 'What the row is about');
  });

  test(`the ${skin} header of a narrow host cuts its titles with an ellipsis and shows them in the tooltips`, async ({page}) => {
    // The host is no narrower than the paginator in one line, unless the application lowers its min width, as here
    const table = await mount(page, `
      el.style.width = '300px';
      el.style.setProperty('--bro-table-min-width', '0px');
      el.configure({cols: ${longCols}, rows, conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['b', 'a', 'c']);

    const name = sortHeader(table, 'name');

    await expect.poll(() => titleShows(headerTitle(table, 'name'))).toBe('ellipsis');
    await expect.poll(() => titleShows(headerTitle(table, 'price'))).toBe('ellipsis');
    await expect(name).toHaveAttribute('tooltip', 'The name of the thing in this row');
    await expect(sortHeader(table, 'price')).toHaveAttribute('tooltip', 'The price of the thing in dollars');
    await expectSkinTooltip(page, skin, name, 'The name of the thing in this row');
  });

  test(`the ${skin} header shows the whole title in the tooltip when the values of another column take the room`, async ({page}) => {
    const table = await mount(page, `
      const notes = 'A note long enough to take the whole room of the table and more than that, as a description does';

      el.style.width = '800px';
      el.configure({cols: [{title: 'The name of the thing in this row', name: 'name'}, {title: 'Notes', name: 'notes'}], rows: [{name: 'a', notes}], conf: {skin: '${skin}'}});
      document.body.append(el);
    `);

    await expect.poll(() => cellTexts(table, 2)).toEqual(['a']);

    // The header alone would fit the title; the rules of the body give the column less, and they are the shown widths
    await expect.poll(() => titleShows(headerTitle(table, 'name'))).toBe('ellipsis');
    await expect(sortHeader(table, 'name')).toHaveAttribute('tooltip', 'The name of the thing in this row');
    await expectSkinTooltip(page, skin, sortHeader(table, 'name'), 'The name of the thing in this row');
  });
}

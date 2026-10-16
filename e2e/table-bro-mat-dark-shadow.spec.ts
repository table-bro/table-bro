import {expect, test} from '@playwright/test';

import {mount} from './table-bro.mount';

// The shadow of a mat table of the stand in the dark theme: the black shadow of Material hardly shows on a dark page, so
// the styles of the stand take it four times as opaque; the mat skin keeps the shadow of Material in both themes. The
// class bro-dark-theme is on the body of the dark page or on the table host.

const light = /^rgba\(0, 0, 0, 0\.2\) 0px 8px 10px -5px/;
const dark = /^rgba\(0, 0, 0, 0\.8\) 0px 8px 10px -5px/;

const cases = [
  {page: 'light', theme: null, shadow: light},
  {page: 'dark', theme: null, shadow: dark},
  {page: 'dark', theme: 'light', shadow: light},
  {page: 'light', theme: 'dark', shadow: dark}
] as const;

for (const {page: scheme, theme, shadow} of cases) {
  test(`a mat table of the stand ${theme ? `with its own ${theme} theme ` : ''}on the ${scheme} page takes the ${shadow === dark ? 'dark' : 'light'} shadow`, async ({page}) => {
    await page.emulateMedia({colorScheme: scheme});

    const table = await mount(page, `
      el.configure({cols, rows, conf: {skin: 'mat'${theme ? `, theme: '${theme}'` : ''}}});
      document.body.append(el);
    `);

    await expect(table.locator('.mat-elevation-z16').first()).toHaveCSS('box-shadow', shadow);
  });
}

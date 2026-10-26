import type {BroFilterDrawerHTMLElement} from '@table-bro/core';

import {expect, type Locator, test} from '@playwright/test';

import {bodyTable, safariStyles} from './table-bro.fixtures';
import {mount}                   from './table-bro.mount';

// The widths of the columns, the motion of the row details and the modes of the filter drawer.

/** The table in a box of the stand: the box gives the width, and the table takes all of it. */
function inBox(width: string, script: string): string {
  return `
    document.querySelector('#e2e-box')?.remove();

    const box = document.createElement('div');

    box.id = 'e2e-box';
    box.style.width = '${width}';
    el.style.width = '100%';
    ${script}`;
}

/** The components of a column whose content is wider than they are: their column cuts them. */
function cutComponents(table: Locator, key: string): Promise<string[]> {
  return bodyTable(table).locator(`tbody > tr[data-row-number] > td[data-bro-column-key="${key}"] > :first-child`).evaluateAll(components => {
    return components.filter(component => component.scrollWidth > component.clientWidth + 1).map(component => component.textContent || '');
  });
}

/** The details of the table with a button in every row; the details component writes its own markup. */
function detailsTable(name: string, details: string, config: string = '', style: string = ''): string {
  return inBox('900px', `
    if (!customElements.get('bro-e2e-${name}')) {
      customElements.define('bro-e2e-${name}', class extends HTMLElement {
        connectedCallback() {
          ${details}

          // A server details component ends its loading later
          if (this.getAttribute('server') === 'true') {
            setTimeout(() => this.dispatchEvent(new CustomEvent('bro-details-server-loaded', {detail: 1})), 300);
          }
        }
      });
    }

    const button = {title: '', name: 'details', component: {
      selector: 'bro-details-button',
      attrs: {title: 'Details', name: 'bro-details-toggle'},
      event: 'action'
    }};

    ${style}
    box.append(el);
    document.body.append(box);
    el.configure({cols: [...cols, button], rows, conf: {skin: 'mat', rowDetailsComponent: 'bro-e2e-${name}'${config}}});
  `);
}

/**
 * Clicks the details button of the first row and gives the height of the details row in every frame, 0 before it
 * comes: the frames start at the click.
 */
function openDetails(table: Locator, duration: number): Promise<number[]> {
  return table.evaluate(async (el: HTMLElement, duration: number) => {
    const heights: number[] = [];
    const start = performance.now();

    el.querySelector<HTMLElement>('table.bro-table tbody > tr[data-row-number] bro-details-button button')!.click();

    await new Promise<void>(resolve => {
      const frame = () => {
        heights.push(el.querySelector('table.bro-table tr.bro-details_tr')?.getBoundingClientRect().height ?? 0);

        if (performance.now() - start < duration) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(frame);
    });

    return heights;
  }, duration);
}

test.describe('the widths of the columns', () => {
  test('a column of components takes the width of its widest component, not of its longest value', async ({page}) => {
    // The component of ab is 120 px wide, the one of abcdef 40 px: the row of the longest values has the narrow one
    const table = await mount(page, inBox('700px', `
      if (!customElements.get('bro-e2e-code')) {
        customElements.define('bro-e2e-code', class extends HTMLElement {
          static observedAttributes = ['code'];

          attributeChangedCallback() {
            const width = (this.getAttribute('code') === 'ab') ? 120 : 40;

            this.innerHTML = '<span style="display: inline-block; width: ' + width + 'px">' + this.getAttribute('code') + '</span>';
          }
        });
      }

      box.append(el);
      document.body.append(box);
      el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Code', name: 'code', component: {selector: 'bro-e2e-code', attrs: {code: (col, row) => row.code}}}], rows: [{name: 'a', code: 'abcdef'}, {name: 'b', code: 'ab'}, {name: 'c', code: 'abcdef'}], conf: {skin: 'mat'}});
    `));

    await expect(bodyTable(table).locator('bro-e2e-code')).toHaveCount(3);
    await expect.poll(() => cutComponents(table, 'code')).toEqual([]);
  });

  test('a component with a block host takes the width of its content, not of its column', async ({page}) => {
    const table = await mount(page, inBox('700px', `
      if (!customElements.get('bro-e2e-block')) {
        customElements.define('bro-e2e-block', class extends HTMLElement {
          connectedCallback() {
            this.style.display = 'block';
            this.innerHTML = '<span style="display: inline-block; width: 50px">block</span>';
          }
        });
      }

      box.append(el);
      document.body.append(box);
      el.configure({cols: [{title: 'Name', name: 'name'}, {title: 'Block', name: 'block', component: {selector: 'bro-e2e-block'}}], rows, conf: {skin: 'mat'}});
    `));

    const component = bodyTable(table).locator('bro-e2e-block').first();

    await expect(component).toBeVisible();
    await expect.poll(() => component.evaluate(element => element.getBoundingClientRect().width)).toBeLessThan(70);
  });

  test('the columns keep to a host that narrows in every frame, also by part of a pixel', async ({page}) => {
    const long = 'a long value that the column cuts with an ellipsis';
    const table = await mount(page, inBox('900px', `
      box.append(el);
      document.body.append(box);
      el.configure({cols: ['one', 'two', 'three', 'four', 'five'].map(name => ({title: name, name})), rows: Array.from({length: 5}, () => ({one: '${long}', two: '${long}', three: '${long}', four: '${long}', five: '${long}'})), conf: {skin: 'mat'}});
    `));

    await expect(bodyTable(table).locator('tbody > tr[data-row-number]')).toHaveCount(5);

    const {worst, end} = await table.evaluate(async (el: HTMLElement) => {
      const box = el.parentElement!;
      const body = el.querySelector('table.bro-table')!;
      let worst = 0;

      // After the observer of the table: the state that the frame paints. The body stands in the room of the shadows,
      // so its width tells how far it goes past the host
      const observer = new ResizeObserver(() => worst = Math.max(worst, body.getBoundingClientRect().width - el.getBoundingClientRect().width));

      observer.observe(el);

      box.style.transition = 'width 400ms';
      box.style.width = '600.8px';
      await new Promise(resolve => setTimeout(resolve, 700));

      // The last step of a motion may be part of a pixel
      box.style.transition = '';
      box.style.width = '600px';
      await new Promise(resolve => setTimeout(resolve, 200));

      observer.disconnect();

      return {worst, end: body.getBoundingClientRect().width - el.getBoundingClientRect().width};
    });

    expect(worst).toBeLessThan(0.5);
    expect(Math.abs(end)).toBeLessThan(0.01);
  });
});

test.describe('the motion of the row details', () => {
  test('details with paddings on their host open from nothing', async ({page}) => {
    const table = await mount(page, detailsTable('padded-details', `
      this.style.display = 'block';
      this.style.padding = '16px 24px';
      this.innerHTML = '<div style="height: 40px">Details</div>';
    `));

    await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();

    const heights = (await openDetails(table, 1500)).filter(Boolean);

    // The host of 72 px with its paddings of 32 px: the first frame is the first step of the motion, not the paddings
    expect(heights[0]).toBeLessThan(10);
    expect(heights.every((height, i) => !i || height >= heights[i - 1])).toBe(true);
    expect(heights[heights.length - 1]).toBeGreaterThanOrEqual(72);
  });

  test('server details come in closed: no frame shows them at their full height before they open', async ({page}) => {
    const table = await mount(page, detailsTable('server-details', `
      this.style.display = 'block';
      this.innerHTML = '<div style="height: 150px">Details from the server</div>';
    `, ', rowDetailsServer: true'));

    await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();

    const heights = (await openDetails(table, 2000)).filter(Boolean);

    // The first frame of the details of 150 px is the first step of their motion
    expect(heights[0]).toBeLessThan(10);
    expect(heights[heights.length - 1]).toBeGreaterThanOrEqual(150);
  });

  test('details lower than a row open to the height of a row', async ({page}) => {
    const table = await mount(page, detailsTable('low-details', `
      this.style.display = 'block';
      this.innerHTML = '<div style="height: 10px"></div>';
    `));

    const rowHeight = await bodyTable(table).locator('tbody > tr[data-row-number]').first().evaluate(row => row.getBoundingClientRect().height);
    const heights = await openDetails(table, 1500);

    expect(heights[heights.length - 1]).toBeGreaterThanOrEqual(rowHeight - 1);
  });

  test('eased details open in --bro-details-duration by the curve of --bro-details-easing', async ({page}) => {
    // The curve stays near the start for most of the time: a kinetic motion would be halfway by then
    const table = await mount(page, detailsTable('eased-details', `
      this.style.display = 'block';
      this.innerHTML = '<div style="height: 100px">Details</div>';
    `, ", rowDetailsMotion: 'eased'", `
      el.style.setProperty('--bro-details-duration', '400ms');
      el.style.setProperty('--bro-details-easing', 'cubic-bezier(1, 0, 1, 0)');
    `));

    await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();

    const heights = await table.evaluate(async (el: HTMLElement) => {
      const height = () => el.querySelector('table.bro-table tr.bro-details_tr')?.getBoundingClientRect().height ?? 0;

      el.querySelector<HTMLElement>('table.bro-table tbody > tr[data-row-number] bro-details-button button')!.click();

      await new Promise(resolve => setTimeout(resolve, 200));

      const half = height();

      await new Promise(resolve => setTimeout(resolve, 300));

      return {half, end: height()};
    });

    expect(heights.half).toBeLessThan(15);
    expect(heights.end).toBeGreaterThanOrEqual(100);
  });
});

test.describe('the modes of the filter drawer', () => {
  test('an opened drawer lies over a table that no longer fits next to it, and stands next to it again', async ({page}) => {
    const table = await mount(page, inBox('1400px', `
      const drawer = document.createElement('table-bro-filter-drawer-container');
      const filters = document.createElement('form');

      drawer.setAttribute('skin', 'bs');
      filters.slot = 'filters';
      filters.innerHTML = '<label>Name <input name="name"></label>';
      drawer.append(el, filters);
      box.append(drawer);
      document.body.append(box);
      el.configure({cols, rows, conf: {skin: 'bs'}});
    `));

    const drawer = page.locator('#e2e-box table-bro-filter-drawer-container');
    const box = page.locator('#e2e-box');

    await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();
    await drawer.evaluate((element: BroFilterDrawerHTMLElement) => element.opened = true);
    await expect(drawer).toHaveAttribute('opened', '');
    await expect(drawer).not.toHaveAttribute('modal');

    await box.evaluate((element: HTMLElement) => element.style.width = '760px');
    await expect(drawer).toHaveAttribute('modal', '');

    await box.evaluate((element: HTMLElement) => element.style.width = '1400px');
    await expect(drawer).not.toHaveAttribute('modal');
  });
});

test.describe('the motion of the filter drawer', () => {
  /** The toggles of the skins of the stand. */
  const skinToggles = {mat: 'Angular Material', bs: 'Vanilla Bootstrap', nv: 'Vanilla HTML'};

  for (const skin of ['mat', 'bs', 'nv'] as const) {
    test(`the filter drawer of the ${skin} skin opens and closes by its transition in every frame, also in Safari`, {tag: '@smoke'}, async ({page, browserName}) => {
      await page.setViewportSize({width: 1280, height: 800});
      await page.goto('/', {waitUntil: 'networkidle'});

      // WebKit of Linux, as in CI, now and then drops the transition of the drawer when the style sheets change, though
      // the script registers its properties: the drawer jumps to its end. WebKit of macOS keeps it
      test.skip(browserName === 'webkit' && !(await safariStyles(page)), 'WebKit of Linux drops the transition of the drawer');

      await page.getByText(skinToggles[skin]).click();

      const container = page.locator((skin === 'mat') ? 'table-bro-filter-drawer-container-ng' : 'table-bro-filter-drawer-container');
      const table = container.locator('table-bro');

      await expect(bodyTable(table).locator('tbody > tr[data-row-number]').first()).toBeVisible();

      // The filters in a color of their own: the width of the color in a frame is the part by which the drawer is opened
      const filters = container.locator((skin === 'mat') ? '.mat-drawer .bro-filter-drawer-card > :last-child' : ':scope > [slot="filters"]');

      await page.addStyleTag({content: `${(skin === 'mat') ? '.mat-drawer .bro-filter-drawer-card > :last-child' : 'table-bro-filter-drawer-container > [slot="filters"]'} { background: rgb(255, 0, 255); }`});

      // The frames of the screencast show the page as the window draws it. One screencast for both motions: a new one
      // in WebKit may give no frame for a while after its start
      const frames: Buffer[] = [];

      // A copy of each frame: Firefox may give the next frame in the same memory
      await page.screencast.start({onFrame: ({data}) => {
        frames.push(Buffer.from(data));
      }, size: {width: 1280, height: 800}, quality: 90});
      await page.waitForTimeout(500);

      /**
       * Clicks the button with the pointer, as the user does, and returns the frames of the screencast of the motion and
       * whether the transition of the drawer has its keyframes in every frame of the page. WebKit dropped the keyframes of
       * a transition of a property of an @property rule when the style sheets changed, as when the table wrote the widths
       * of its columns or Material added the styles of the tooltip of the button: the drawer jumped to its end, while
       * the columns moved for the whole duration.
       * @param button - the button that opens or closes the drawer
       */
      const motion = async (button: Locator) => {
        await page.evaluate(selector => {
          const element = document.querySelector(selector)!;
          const w = window as typeof window & {e2eKeyframes: number[]; e2eFrame?: number};

          w.e2eKeyframes = [];
          cancelAnimationFrame(w.e2eFrame ?? 0);

          const frame = () => {
            const transition = element.getAnimations().find(animation => (animation as CSSTransition).transitionProperty === '--bro-filter-drawer-opened');

            if (transition) {
              w.e2eKeyframes.push((transition.effect as KeyframeEffect).getKeyframes().length);
            }

            w.e2eFrame = requestAnimationFrame(frame);
          };

          w.e2eFrame = requestAnimationFrame(frame);
        }, (skin === 'mat') ? 'table-bro-filter-drawer-container-ng .bro-filter-drawer-card' : 'table-bro-filter-drawer-container');

        const first = frames.length;

        await button.click();
        await page.waitForTimeout(1000);

        return {frames: frames.slice(first), keyframes: await page.evaluate(() => (window as typeof window & {e2eKeyframes: number[]}).e2eKeyframes)};
      };

      /**
       * The widths of the color of the filters in the frames, on a line through their top padding.
       * @param frames - the frames of the screencast
       */
      const widths = async (frames: Buffer[]) => {
        const box = (await filters.boundingBox())!;

        return page.evaluate(async ([sources, top]) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', {willReadFrequently: true})!;

          return Promise.all(sources.map(async src => {
            const img = new Image();

            img.src = src;
            await img.decode();

            // The screencast may scale the page down to the width of the video of a test, as in Firefox
            const scale = img.naturalWidth / 1280;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            context.drawImage(img, 0, 0);

            const data = context.getImageData(0, Math.round(top * scale), img.naturalWidth, 1).data;
            let count = 0;

            for (let i = 0; i < data.length; i += 4) {
              count += (data[i] > 200 && data[i + 1] < 90 && data[i + 2] > 200) ? 1 : 0;
            }

            return Math.round(count / scale);
          }));
        }, [frames.map(frame => `data:image/jpeg;base64,${frame.toString('base64')}`), Math.round(box.y) + 3] as const);
      };

      const filtersButton = table.getByRole('button', {name: 'Filters', exact: true});
      const opening = await motion(filtersButton);
      const full = Math.round((await filters.boundingBox())!.width);
      const closing = await motion(container.getByRole('button', {name: 'Close', exact: true}));

      await page.screencast.stop();

      for (const [name, {frames, keyframes}] of Object.entries({opening, closing})) {
        const shown = await widths(frames);
        const between = shown.filter(width => width > 0.05 * full && width < 0.95 * full);

        // The drawer passes the widths between closed and opened in several frames, and the transition keeps its keyframes
        expect(between.length, `${name}: ${shown.join(' ')} of ${full}`).toBeGreaterThanOrEqual(3);
        expect(keyframes.length, name).toBeGreaterThan(3);
        expect(keyframes.filter(count => count !== 2), `${name}: ${keyframes.join(' ')}`).toEqual([]);
      }
    });
  }
});

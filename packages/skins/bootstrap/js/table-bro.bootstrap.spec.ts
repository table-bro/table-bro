import {type BroResolvedConfig, resolveTexts} from '@table-bro/core';

import {afterEach, describe, expect, it, vi} from 'vitest';

import {bootstrapSkinConfig, type BroBootstrapClasses, useBootstrap, withSwitch, withTags} from './table-bro.bootstrap';

// The optional elements, as a page with tags and switches defines them after the import of the skin
withTags();
withSwitch();

// The elements of the Bootstrap skin, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...bootstrapSkinConfig, skin: 'bs', texts: resolveTexts({noItems: 'Nothing', loadingProgress: 'Loading the rows'})};

// The Tooltip class of the tests whose elements show no tooltip
const tooltip: BroBootstrapClasses['Tooltip'] = {getOrCreateInstance: () => ({dispose: () => undefined})};

function element(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): HTMLElement {
  const el = document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

afterEach(() => document.body.replaceChildren());

describe('the Bootstrap progress bar', () => {
  it('has no values in its indeterminate mode, and a determinate one follows its value', () => {
    const indeterminate = element('bro-bs-progress-bar', {mode: 'indeterminate'}).querySelector('[role="progressbar"]')!;
    const determinate = element('bro-bs-progress-bar', {mode: 'determinate', value: '30'});
    const bar = determinate.querySelector('[role="progressbar"]')!;

    expect(indeterminate.getAttribute('aria-label')).toBe('Loading the rows');
    expect(['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].filter(name => indeterminate.hasAttribute(name))).toEqual([]);

    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    determinate.setAttribute('value', '60');
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
  });
});

describe('the Bootstrap progress of an unknown end', () => {
  afterEach(() => vi.useRealTimers());

  /** The bar of a progress of an unknown end in the time of the table, on fake frames. */
  function progress(durationScale: string, properties: Record<string, unknown> = {}): HTMLElement {
    vi.useFakeTimers({toFake: ['requestAnimationFrame', 'performance']});

    const el = document.createElement('bro-bs-progress-bar');

    Object.assign(el, {config, ...properties});
    el.setAttribute('mode', 'indeterminate');
    el.style.setProperty('--bro-duration-scale', durationScale);
    document.body.append(el);

    return el.querySelector<HTMLElement>('.progress-bar')!;
  }

  /** The width in whole percent after the given ms; the fake frames come every 16 ms. */
  function widthAfter(bar: HTMLElement, ms: number): number {
    vi.advanceTimersByTime(ms);

    return Math.round(parseFloat(bar.style.width));
  }

  it('grows by its schedule, half in the first second, and flashes at 98% after 12 seconds', () => {
    const bar = progress('1');

    expect(widthAfter(bar, 496)).toBe(25);
    expect(widthAfter(bar, 512)).toBe(50);
    expect(widthAfter(bar, 992)).toBe(58);
    expect(bar.classList.contains('bro-progress-bar-animated-n-flashing')).toBe(false);

    expect(widthAfter(bar, 10_000)).toBe(98);
    expect(bar.classList.contains('bro-progress-bar-animated-n-flashing')).toBe(true);
  });

  it('is full at once without the time of motion, and slower with a larger scale or with debugAnimation', () => {
    expect(widthAfter(progress('0'), 0)).toBe(100);

    document.body.replaceChildren();
    expect(widthAfter(progress('2'), 2016)).toBe(50);

    document.body.replaceChildren();
    expect(widthAfter(progress('1', {config: {...config, debugAnimation: true}}), 6000)).toBe(50);
  });

  it('goes on after a move in the DOM and stops when the element is removed', async () => {
    const bar = progress('1');
    const el = bar.closest('bro-bs-progress-bar')!;

    expect(widthAfter(bar, 1008)).toBe(50);

    // A sort moves the row with the bar: the element is disconnected and connected in one task
    document.body.prepend(document.createElement('div'));
    document.body.append(el);
    await Promise.resolve();

    expect(widthAfter(bar, 992)).toBe(58);

    el.remove();
    await Promise.resolve();

    expect(widthAfter(bar, 1000)).toBe(58);
  });
});

describe('the Bootstrap tags', () => {
  it('show the text of the config for a cell without items', () => {
    expect(element('bro-bs-tags', {}, {col: {name: 'tags'}, row: {tags: []}}).textContent).toBe('Nothing');
  });
});

describe('the Bootstrap classes of the skin', () => {
  /** A Bootstrap dropdown that remembers its toggles. */
  function fakeDropdown(toggles: Element[]) {
    return class {
      constructor(toggle: Element) {
        toggles.push(toggle);
      }

      dispose(): void {
        // Nothing to dispose
      }
    };
  }

  it('come from window.bootstrap without useBootstrap(), and from useBootstrap() after it', () => {
    const fromWindow: Element[] = [];
    const given: Element[] = [];
    const options = JSON.stringify([{value: '1', title: 'One'}]);

    Object.assign(window, {bootstrap: {'Dropdown': fakeDropdown(fromWindow), 'Tooltip': tooltip}});
    element('bro-bs-dropdown', {mode: 'dropdown', options});

    useBootstrap({'Dropdown': fakeDropdown(given), 'Tooltip': tooltip});
    element('bro-bs-dropdown', {mode: 'dropdown', options});

    expect(fromWindow.map(toggle => toggle.classList.contains('dropdown-toggle'))).toEqual([true]);
    expect(given.length).toBe(1);
    delete (<{bootstrap?: unknown}><unknown>window).bootstrap;
  });
});

describe('the Bootstrap list of values', () => {
  it('names its toggle by its label and the value that it shows, also after a choice', () => {
    // The element releases its dropdown when the test removes it
    useBootstrap({
      'Dropdown': class {
        dispose(): void {
          // Nothing to dispose
        }
      },
      'Tooltip': tooltip
    });

    const dropdown = element('bro-bs-dropdown', {mode: 'select', label: 'Items per page:', 'button-title': '5', options: JSON.stringify([{value: '5', title: '5'}, {value: '10', title: '10'}])});
    const toggle = dropdown.querySelector('.dropdown-toggle')!;

    expect(toggle.getAttribute('aria-label')).toBe('Items per page: 5');
    expect(dropdown.hasAttribute('aria-label')).toBe(false);

    dropdown.querySelector<HTMLElement>('[data-value="10"]')!.click();
    expect(toggle.getAttribute('aria-label')).toBe('Items per page: 10');
  });
});

describe('the Bootstrap list of the page sizes', () => {
  it('has the button class of the skin config from the first render of the paginator', () => {
    // After the test of the classes from window.bootstrap: useBootstrap() keeps its classes
    useBootstrap({'Dropdown': class {
      dispose(): void {
        // Nothing to dispose
      }
    }, 'Tooltip': tooltip});

    const paginator = element('bro-paginator', {'page-size': '5', length: '20', 'page-size-options': '[5, 10]'});

    expect(paginator.querySelector('.bro-paginator-page-size .dropdown-toggle')!.className).toBe('btn btn-outline-primary dropdown-toggle');
  });
});

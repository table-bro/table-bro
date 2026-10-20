import {type BroResolvedConfig, resolveTexts} from '@table-bro/core';

import {afterEach, describe, expect, it} from 'vitest';

import {bootstrapSkinConfig, type BroBootstrapClasses, useBootstrap, withSwitch, withTags} from './table-bro.bootstrap';

// The CSS of the skin from its build, which grows the bar of a progress of an unknown end; Vite gives it as a string
const skinCssModule: string = '../dist/table-bro.bootstrap.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);

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
  /** The bar of a progress of an unknown end in the time of the table, in a box of 200 px with the CSS of the skin. */
  function progress(durationScale: string, properties: Record<string, unknown> = {}): HTMLElement {
    const style = document.createElement('style');
    const el = document.createElement('bro-bs-progress-bar');

    style.textContent = skinCss;
    document.body.className = 'bs';
    document.body.append(style);

    Object.assign(el, {config, ...properties});
    el.setAttribute('mode', 'indeterminate');
    el.style.setProperty('--bro-duration-scale', durationScale);
    el.style.setProperty('display', 'block');
    el.style.setProperty('width', '200px');
    document.body.append(el);

    return el.querySelector<HTMLElement>('.progress-bar')!;
  }

  /** The CSS animation of a bar by its name. */
  function animation(bar: HTMLElement, name: string): CSSAnimation {
    return <CSSAnimation>bar.getAnimations().find(animation => (<CSSAnimation>animation).animationName === name);
  }

  /** The width in whole percent of the box at the given ms of the growth. */
  function widthAt(bar: HTMLElement, ms: number): number {
    animation(bar, 'bro-progress-bar-growth').currentTime = ms;

    return Math.round(parseFloat(getComputedStyle(bar).width) / 2);
  }

  /** The next frame, after the events of the animations that started. */
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  afterEach(() => document.body.removeAttribute('class'));

  it('grows by its schedule, half in the first second, and flashes at 98% after 12 seconds', () => {
    const bar = progress('1');

    expect(bar.hasAttribute('style')).toBe(false);
    expect(bar.classList.contains('bro-progress-bar-full')).toBe(false);
    expect(widthAt(bar, 500)).toBe(25);
    expect(widthAt(bar, 1000)).toBe(50);
    expect(widthAt(bar, 2000)).toBe(58);
    expect(widthAt(bar, 12_000)).toBe(98);
    expect(widthAt(bar, 20_000)).toBe(98);
    expect(animation(bar, 'bro-pulse').effect!.getComputedTiming().delay).toBe(12_000);
  });

  it('is slower with a larger scale or with debugAnimation', () => {
    expect(widthAt(progress('2'), 2000)).toBe(50);

    document.body.replaceChildren();
    expect(widthAt(progress('1', {config: {...config, debugAnimation: true}}), 6000)).toBe(50);
  });

  it('is full at once without animations in the time 0 of the table, as under reduced motion', async () => {
    const bar = progress('0');

    await frame();

    expect(parseFloat(getComputedStyle(bar).width)).toBe(200);
    expect(bar.getAnimations()).toEqual([]);
  });

  it('goes on after a move in the DOM, which starts its CSS animations again', async () => {
    const bar = progress('1');
    const el = bar.closest('bro-bs-progress-bar')!;

    await frame();

    const startTime = animation(bar, 'bro-progress-bar-growth').startTime;

    expect(startTime).not.toBeNull();

    // A sort moves the row with the bar: the element is disconnected and connected in one task
    document.body.prepend(document.createElement('div'));
    document.body.append(el);

    // The stripes are the keyframes of Bootstrap, which the CSS of the skin does not have
    expect(['bro-progress-bar-growth', 'bro-pulse'].map(name => animation(bar, name).startTime))
      .toEqual([startTime, startTime]);
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

import {type BroResolvedConfig, events, resolveTexts} from '@table-bro/core';

import {afterEach, describe, expect, it} from 'vitest';

import {bootstrapSkinConfig, type BroBootstrapClasses, useBootstrap, withSwitch, withTags} from './table-bro.bootstrap';

// The CSS of the skin from its build, which grows the bar of a progress of an unknown end; Vite gives it as a string
const skinCssModule: string = '../dist/table-bro.bootstrap.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);
// The CSS of the core from its build, which every skin needs: the rule of its class bro-visually-hidden
const coreCssModule: string = '../../../core/dist/table-bro.min.css?inline';
const {default: coreCss} = <{default: string}>await import(/* @vite-ignore */ coreCssModule);

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

describe('the Bootstrap menu of the toolbar', () => {
  it('adds the word of the texts to its title as visually hidden text', () => {
    // The element releases its dropdown when the test removes it
    useBootstrap({
      'Dropdown': class {
        dispose(): void {
          // Nothing to dispose
        }
      },
      'Tooltip': tooltip
    });

    const options = JSON.stringify([{value: 'print', title: 'Print'}]);
    const dropdown = element('bro-bs-dropdown', {mode: 'navbar-dropdown', 'button-title': 'More', options});
    const toggle = dropdown.querySelector('a.dropdown-toggle')!;

    expect(toggle.textContent!.replace(/\s+/g, ' ').trim()).toBe('More menu');
    expect(toggle.querySelector('.bro-visually-hidden')!.textContent).toBe(' menu');
    expect(dropdown.querySelector('a.dropdown-item')!.textContent).toBe('Print menu item');

    const withoutWord = element('bro-bs-dropdown', {mode: 'navbar-dropdown', 'button-title': 'More', options}, {config: {...config, texts: {...config.texts, menuRole: '', menuItemRole: ''}}});

    expect(withoutWord.querySelector('.bro-visually-hidden')).toBeNull();
  });

  it('sends the value of an item from a click on its hidden word', () => {
    const dropdown = element('bro-bs-dropdown', {mode: 'navbar-dropdown', 'button-title': 'More', options: JSON.stringify([{value: 'print', title: 'Print'}])});
    const values: string[] = [];

    dropdown.addEventListener('value', event => values.push((<CustomEvent>event).detail));
    dropdown.querySelector<HTMLElement>('a.dropdown-item .bro-visually-hidden')!.click();

    expect(values).toEqual(['print']);
  });
});

describe('the links of the Bootstrap toolbar', () => {
  // The texts that the audit link-text of Lighthouse 12 finds not descriptive, in English (core/audits/seo/link-text.js)
  const nonDescriptiveTexts = ['click here', 'click this', 'go', 'here', 'information', 'learn more', 'more', 'more info', 'more information', 'right here', 'read more', 'see more', 'start', 'this'];

  /**
   * The texts of the links of a toolbar whose application names its search, its button, its menu and its item as the
   * audit does not like, as the audit reads them: innerText, with the CSS of the core and of the skin.
   * @param texts - the texts of the config
   * @param toolbarTitle - the title of the toolbar
   */
  function linkTexts(texts: Partial<BroResolvedConfig['texts']>, toolbarTitle: string = ''): string[] {
    const style = document.createElement('style');

    style.textContent = coreCss + skinCss;
    document.body.className = 'bs';
    document.body.append(style);

    const buttons = [
      {buttonTitle: 'Read more', eventType: 'read'},
      {buttonTitle: 'More', mode: 'navbar-dropdown', options: [{value: 'details', title: 'Learn more'}]}
    ];
    const components = {...config.components, toolbarMain: {...config.components.toolbarMain, buttons}};
    const toolbar = element('bro-toolbar-main', {}, {config: {...config, components, toolbarTitle, texts: {...config.texts, search: 'Go', ...texts}}});

    return Array.from(toolbar.querySelectorAll('a'), link => link.innerText.replace(/\s+/g, ' ').trim().toLowerCase());
  }

  it('have descriptive texts for the audit link-text of Lighthouse with any title of the application', () => {
    useBootstrap({
      'Dropdown': class {
        dispose(): void {
          // Nothing to dispose
        }
      },
      'Tooltip': tooltip
    });

    const texts = linkTexts({});

    expect(texts).toEqual(['go for rows', 'read more button', 'more menu', 'learn more menu item']);
    expect(texts.filter(text => nonDescriptiveTexts.includes(text))).toEqual([]);

    // The words hide: the toolbar shows the titles only
    const word = document.querySelector<HTMLElement>('bro-toolbar-main .bro-visually-hidden')!;

    expect([word.offsetWidth, word.offsetHeight, getComputedStyle(word).clipPath]).toEqual([1, 1, 'inset(50%)']);
  });

  it('name the rows that the search searches by the title of the toolbar', () => {
    expect(linkTexts({}, 'Orders')[0]).toBe('go for orders');
  });

  it('keep the titles of the application without the words', () => {
    expect(linkTexts({searchRole: () => '', buttonRole: '', menuRole: '', menuItemRole: ''}, 'Orders')).toEqual(['go', 'read more', 'more', 'learn more']);
  });

  it('are buttons that act on the table, and the items of the menu are links, as the markup of Bootstrap has them', () => {
    linkTexts({}, 'Orders');

    const links = Array.from(document.querySelectorAll('bro-toolbar-main a'));

    expect(links.map(link => link.getAttribute('role'))).toEqual(['button', 'button', 'button', null]);

    // A screen reader hears the role of a button from the role, not twice: the word button stays in the text of the link only
    expect(Array.from(document.querySelectorAll('bro-toolbar-main .bro-visually-hidden'), word => [word.textContent, word.getAttribute('aria-hidden')])).toEqual([
      [' for Orders', null], [' button', 'true'], [' menu', null], [' menu item', null]
    ]);
  });

  it('take Space as buttons do', () => {
    linkTexts({});

    const toolbar = document.querySelector('bro-toolbar-main')!;
    const actions: unknown[] = [];

    toolbar.addEventListener(events.toolbarEvent, event => actions.push((<CustomEvent>event).detail));

    const space = new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true});

    toolbar.querySelectorAll('a')[1].dispatchEvent(space);

    expect([actions, space.defaultPrevented]).toEqual([['read'], true]);
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

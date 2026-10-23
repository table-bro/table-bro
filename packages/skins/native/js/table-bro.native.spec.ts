import {type BroConfigureOptions, type BroResolvedConfig, type BroTextsConfig, defineTableBroFilterDrawerContainer, prerenderTableBro, resolveTexts, type TableBroHTMLElement} from '@table-bro/core';

import {afterEach, describe, expect, it} from 'vitest';

import {nativeSkinConfig, setTagsTexts, withSwitch, withTags} from './table-bro.native';

// The optional elements, as a page with tags and switches defines them after the import of the skin
withTags();
withSwitch();

// The elements of the native skin and the shared vanilla elements, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...nativeSkinConfig, skin: 'nv', texts: resolveTexts({noItems: 'Nothing', itemsPerPage: 'Rows:', loadingProgress: 'Loading the rows', rangeLabel: (page, size, length) => `${page}/${size}/${length}`})};

function element<T extends HTMLElement>(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): T {
  const el = <T>document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

afterEach(() => document.body.replaceChildren());

describe('the native skin', () => {
  it('registers its config under its own name only', () => {
    // A table starts only with a registered skin
    const configure = (skin: 'nv' | 'bs') => () => (<TableBroHTMLElement>document.createElement('table-bro')).configure({cols: [], conf: {skin}});

    expect(configure('nv')).not.toThrow();
    expect(configure('bs')).toThrow('The skin "bs" is not registered');
  });
});

describe('the native progress bar', () => {
  it('is named by the texts of the table', () => {
    expect(element('bro-nv-progress-bar', {mode: 'indeterminate'}).querySelector('progress')!.getAttribute('aria-label')).toBe('Loading the rows');
  });
});

describe('the native dropdown', () => {
  it('takes disabled before its render, sends a chosen value, and keeps its titles as text', () => {
    const dropdown = element('bro-nv-dropdown', {mode: 'select', disabled: 'true', options: JSON.stringify([{value: '5', title: '<b>5</b>'}, {value: '10', title: '10'}])});
    const select = dropdown.querySelector('select')!;
    const values: string[] = [];

    dropdown.addEventListener('value', event => values.push((<CustomEvent<string>>event).detail));

    expect(select.disabled).toBe(true);
    expect(dropdown.querySelector('b')).toBeNull();
    expect(select.options[1].textContent).toBe('<b>5</b>');

    dropdown.setAttribute('disabled', 'false');
    select.value = '10';
    select.dispatchEvent(new Event('change'));

    expect(select.disabled).toBe(false);
    expect(values).toEqual(['10']);
  });
});

describe('the native tags', () => {
  it('show the items of the field of the column as text, and the text of the config without items', () => {
    const tags = element('bro-nv-tags', {}, {col: {name: 'tags'}, row: {tags: ['<i>a</i>', 'b']}});
    const empty = element('bro-nv-tags', {}, {col: {name: 'tags'}, row: {tags: []}});

    expect(Array.from(tags.querySelectorAll('mark')).map(mark => mark.textContent)).toEqual(['<i>a</i>', 'b']);
    expect(empty.textContent).toBe('Nothing');
  });

  it('take the text of a cell without items from setTagsTexts() over the one of the config, also in the DOM', () => {
    const tags = {col: {name: 'tags'}, row: {tags: []}};
    const empty = element('bro-nv-tags', {}, tags);
    const full = element('bro-nv-tags', {}, {col: {name: 'tags'}, row: {tags: ['a']}});

    setTagsTexts({empty: 'No tags'});

    expect([empty.textContent, full.textContent]).toEqual(['No tags', 'a']);
    expect(element('bro-nv-tags', {}, tags).textContent).toBe('No tags');

    // Tags out of the DOM take the new text when they connect again
    empty.remove();
    setTagsTexts({empty: 'Empty'});
    document.body.append(empty);

    expect(empty.textContent).toBe('Empty');

    setTagsTexts({empty: undefined});

    expect(element('bro-nv-tags', {}, tags).textContent).toBe('Nothing');
  });
});

describe('the vanilla paginator', () => {
  it('labels its range by the texts of the config and pages forward, and its disabled links say so', () => {
    const paginator = element('bro-paginator', {'page-size': '5', length: '12', 'page-index': '0', 'page-size-options': '[5, 10]'});
    const pages: number[] = [];

    paginator.addEventListener('page', event => pages.push((<CustomEvent<{pageIndex: number}>>event).detail.pageIndex));

    expect(paginator.querySelector('.bro-paginator-range-label')!.textContent!.trim()).toBe('0/5/12');
    expect(paginator.querySelector('.bro-paginator-page-size-label')!.textContent!.trim()).toBe('Rows:');

    paginator.querySelector<HTMLElement>('.bro-paginator-navigation-next')!.click();
    expect(pages).toEqual([1]);

    paginator.setAttribute('disabled', 'true');
    expect(paginator.querySelector('.bro-paginator-navigation-next')!.getAttribute('aria-disabled')).toBe('true');
  });
});

describe('the vanilla button', () => {
  it('sends its event, keeps its title as text, and as a link takes Space', () => {
    const button = element('bro-button', {'button-title': '<b>Go</b>', 'event-type': 'go', mode: 'link'});
    const link = button.querySelector('a')!;
    const actions: string[] = [];

    button.addEventListener('bro-action', event => actions.push((<CustomEvent<{action: string}>>event).detail.action));

    expect(button.querySelector('b')).toBeNull();
    expect(link.textContent!.trim()).toBe('<b>Go</b>');

    link.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
    expect(actions).toEqual(['go']);
  });

  it('gives the name of its attribute label to a button with an icon only, and keeps no aria-label itself', () => {
    const button = element('bro-button', {label: 'Back', 'icon-html': '<i></i>'});

    expect(button.querySelector('button')!.getAttribute('aria-label')).toBe('Back');
    expect(button.hasAttribute('aria-label')).toBe(false);
  });
});

describe('a prerendered native table', () => {
  it('keeps the markup of the prerender in the browser until configure() renders the table in its place', () => {
    const options: BroConfigureOptions<{name: string}> = {cols: [{title: 'Name', name: 'name'}], conf: {skin: 'nv'}};
    const prerendered = document.createElement('table-bro');
    const holder = document.createElement('div');

    // The prerender in a DOM with the elements of the skin, as happy-dom on a server: the elements render their markup
    document.body.append(prerendered);
    prerenderTableBro(prerendered, options);

    // The browser parses the prerender: the elements of the skin upgrade and keep their markup
    holder.innerHTML = prerendered.outerHTML;
    prerendered.remove();
    document.body.append(holder);

    const table = <HTMLElement & TableBroHTMLElement>holder.firstElementChild;
    const headers = () => [...table.querySelectorAll('bro-sort-header')].map(header => header.querySelectorAll('.bro-sort-header-container').length);
    const toolbars = () => table.querySelectorAll('bro-toolbar-main .bro-toolbar-content').length;

    expect(table.hasAttribute('data-bro-prerender')).toBe(true);
    expect(headers()).toEqual([1, 1]);
    expect(toolbars()).toBe(1);

    table.configure(options);

    expect(table.hasAttribute('data-bro-prerender')).toBe(false);
    expect(headers()).toEqual([1, 1]);
    expect(toolbars()).toBe(1);
  });
});

describe('the filter drawer of the core around a native table', () => {
  /** A drawer with its table on the page, as in the markup, and the title and the name of the close button of its header. */
  function drawerWithTable() {
    const drawer = document.createElement('table-bro-filter-drawer-container');
    const table = <HTMLElement & TableBroHTMLElement>drawer.appendChild(document.createElement('table-bro'));
    const filters = drawer.appendChild(document.createElement('form'));
    const header = () => [drawer.querySelector('.bro-filter-drawer-title')?.textContent, drawer.querySelector('.bro-filter-drawer-close')?.getAttribute('label'), filters.getAttribute('aria-label')];
    const configure = (texts?: BroTextsConfig) => table.configure({cols: [], conf: {skin: 'nv', texts}});

    drawer.setAttribute('skin', 'nv');
    filters.setAttribute('slot', 'filters');
    document.body.append(drawer);

    return {drawer, configure, header};
  }

  // The first test: the element is not defined yet
  it('takes the texts of a table that rendered before the element was defined', () => {
    const {configure, header} = drawerWithTable();

    configure({filterDrawer: {title: 'Refine'}});
    expect(header()).toEqual([undefined, undefined, null]);

    defineTableBroFilterDrawerContainer();
    expect(header()).toEqual(['Refine', 'Close', 'Refine']);
  });

  it('takes its title, the name of its close button and of its filters from the config of its table configured after it, when it opens', () => {
    const {drawer, configure, header} = drawerWithTable();

    configure({filterDrawer: {title: 'Refine', close: 'Dismiss'}});
    drawer.opened = true;
    expect(header()).toEqual(['Refine', 'Dismiss', 'Refine']);

    // A new config of the table shows at the next opening
    configure({filters: 'Narrow down'});
    drawer.toggle();
    drawer.toggle();
    expect(header()).toEqual(['Narrow down', 'Close', 'Narrow down']);
  });

  it('keeps the flat text or the English one under a text of the group that is undefined', () => {
    const {drawer, configure, header} = drawerWithTable();

    configure({filters: 'Refine', filterDrawer: {title: undefined, close: undefined}});
    drawer.opened = true;
    expect(header()).toEqual(['Refine', 'Close', 'Refine']);
  });

  it('shows the English texts when it opens before its table has a config', () => {
    const {drawer, header} = drawerWithTable();

    drawer.opened = true;
    expect(header()).toEqual(['Filters', 'Close', 'Filters']);
  });

  it('takes its own texts over the ones of the table while they are set', () => {
    const {drawer, configure, header} = drawerWithTable();

    configure({filterDrawer: {title: 'Refine'}});
    drawer.texts = {filterDrawer: {close: 'Hide'}};
    drawer.opened = true;
    expect(header()).toEqual(['Filters', 'Hide', 'Filters']);

    drawer.texts = undefined;
    expect(header()).toEqual(['Refine', 'Close', 'Refine']);
  });

  it('keeps a name of the filters that the page gave them', () => {
    const {drawer, configure, header} = drawerWithTable();

    drawer.querySelector('form')!.setAttribute('aria-label', 'Order filters');
    configure({filterDrawer: {title: 'Refine'}});
    drawer.opened = true;
    expect(header()).toEqual(['Refine', 'Close', 'Order filters']);
  });

  it('takes the texts of its own table, not of a table in the drawer after it', () => {
    const {drawer, configure, header} = drawerWithTable();
    const inner = <HTMLElement & TableBroHTMLElement>drawer.querySelector('form')!.appendChild(document.createElement('table-bro'));

    configure({filterDrawer: {title: 'Refine'}});
    inner.configure({cols: [], conf: {skin: 'nv', texts: {filterDrawer: {title: 'Details'}}}});
    drawer.opened = true;
    expect(header()).toEqual(['Refine', 'Close', 'Refine']);
  });
});

import {type BroResolvedConfig, events, resolveTexts, type TableBroHTMLElement} from '@table-bro/core';

import {afterEach, describe, expect, it, vi} from 'vitest';
import {createApp, h, onMounted, ref}        from 'vue';
import {createVuetify}                       from 'vuetify';
import {md3}                                 from 'vuetify/blueprints';
import 'vuetify/styles';

import {themeRules}                                                        from './bro-vuetify-element';
import {setTagsTexts, setVuetify, vuetifySkinConfig, withSwitch, withTags} from './table-bro.vue-vuetify';

// The CSS of the core and of the skin from their builds: the table measures its columns in them
const skinCssModule: string = '../dist/table-bro.vue-vuetify.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);
const coreCssModule: string = '../../../core/dist/table-bro.min.css?inline';
const {default: coreCss} = <{default: string}>await import(/* @vite-ignore */ coreCssModule);

// The optional elements, as a page with tags and switches defines them after the import of the skin, and the Vuetify of
// the application with the blueprint of Material 3
const vuetify = createVuetify({blueprint: md3});

withTags();
withSwitch();
setVuetify(vuetify);

// The elements of the Vuetify skin, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...vuetifySkinConfig, skin: 'vuetify', texts: resolveTexts({noItems: 'Nothing', loadingProgress: 'Loading the rows'})};

function element(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): HTMLElement {
  const el = document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

/** The CSS of the core and of the skin, in the body: the head keeps the styles of Vuetify. */
function styles(): void {
  const style = document.createElement('style');

  style.textContent = coreCss + skinCss;
  document.body.append(style);
}

/**
 * The channels of a color of a theme of Vuetify, as #6750a4, in the order of red, green and blue.
 * @param name - the name of the theme
 */
function surfaceChannels(name: string): number[] {
  const color = <string>vuetify.theme.computedThemes.value[name].colors.surface;

  return [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
}

afterEach(() => document.body.replaceChildren());

describe('the Vuetify button', () => {
  it('renders at once in the context of the Vuetify of the application, with its defaults', () => {
    const button = element('bro-vuetify-button', {'button-title': 'Details', icon: 'expand_more', 'event-type': 'open'});

    // The button of the blueprint of Material 3 is rounded and primary: the defaults of the Vuetify of the application
    expect(button.querySelector('.v-btn')!.classList).toContain('rounded-xl');
    expect(button.querySelector('.v-btn')!.classList).toContain('text-primary');
    expect(button.querySelector('.v-btn')!.classList).toContain(`v-theme--${vuetify.theme.name.value}`);
  });

  it('renders a text button with its title, or an icon button named by its label, and sends its event type', () => {
    const titled = element('bro-vuetify-button', {'button-title': 'Details', icon: 'expand_more', 'event-type': 'open'});
    const icon = element('bro-vuetify-button', {icon: 'close', label: 'Close'});
    const actions: string[] = [];

    titled.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));
    titled.querySelector('button')!.click();

    expect(titled.querySelector('button')!.textContent).toBe('expand_moreDetails');
    expect(titled.querySelector(vuetifySkinConfig.components.button.iconSelector)!.classList).toContain('material-icons');
    expect(icon.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(actions).toEqual(['open']);
  });

  it('shows its icon in the font of the class of setVuetify()', () => {
    setVuetify(vuetify, {iconClass: 'material-symbols-rounded'});

    const button = element('bro-vuetify-button', {icon: 'close', label: 'Close'});

    setVuetify(vuetify);

    expect(button.querySelector('.v-icon')!.classList).toContain('material-symbols-rounded');
    expect(button.querySelector('.v-icon')!.classList).not.toContain('material-icons');
  });

  it('keeps its Vue tree through a move in the DOM and drops it out of the DOM', async () => {
    const button = element('bro-vuetify-button', {icon: 'close', label: 'Close'});
    const rendered = button.querySelector('button');

    document.body.prepend(button);
    await Promise.resolve();

    expect(button.querySelector('button')).toBe(rendered);

    button.remove();
    await Promise.resolve();

    expect(button.childElementCount).toBe(0);
  });
});

describe('the Vuetify progress bar', () => {
  it('has the name of the config and follows its value in the determinate mode', () => {
    const indeterminate = element('bro-vuetify-progress-bar', {mode: 'indeterminate'}).querySelector('[role="progressbar"]')!;
    const determinate = element('bro-vuetify-progress-bar', {mode: 'determinate', value: '30'});

    expect(indeterminate.getAttribute('aria-label')).toBe('Loading the rows');
    expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false);

    expect(determinate.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('30');
    determinate.setAttribute('value', '60');
    expect(determinate.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('60');
  });
});

describe('the Vuetify tags', () => {
  it('renders the items of the field as chips, and the text of an empty cell that setTagsTexts() changes', () => {
    const col = {name: 'tags', title: 'Tags'};
    const tags = element('bro-vuetify-tags', {}, {col, row: {tags: ['red', 'green']}});
    const empty = element('bro-vuetify-tags', {}, {col, row: {tags: []}});

    expect([...tags.querySelectorAll('.v-chip__content')].map(chip => chip.textContent)).toEqual(['red', 'green']);
    expect(empty.querySelector('.v-chip__content')!.textContent).toBe('Nothing');

    setTagsTexts({empty: 'No tags'});

    expect(empty.querySelector('.v-chip__content')!.textContent).toBe('No tags');
  });

  it('end the text of the first chip with an ellipsis in a narrow cell', () => {
    const cell = document.createElement('div');

    styles();
    cell.className = 'vuetify';
    cell.style.width = '60px';
    document.body.append(cell);

    const tags = document.createElement('bro-vuetify-tags');

    Object.assign(tags, {config, col: {name: 'tags', title: 'Tags'}, row: {tags: ['Engineering', 'Marketing']}});
    cell.append(tags);

    const label = tags.querySelector<HTMLElement>('.bro-vuetify-tags-label')!;

    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    expect(tags.querySelector('.v-chip')!.getBoundingClientRect().right).toBeLessThanOrEqual(cell.getBoundingClientRect().right);
  });
});

describe('the Vuetify switch', () => {
  it('shows the boolean of the row, is named by the title of the column and sends its action', () => {
    const toggle = element('bro-vuetify-switch', {name: 'toggle-active'}, {col: {name: 'active', title: 'Active'}, row: {active: true}});
    const input = toggle.querySelector('input')!;
    const actions: string[] = [];

    toggle.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));

    expect(input.checked).toBe(true);

    input.click();

    expect(input.getAttribute('aria-label')).toBe('Active');
    expect(input.checked).toBe(false);
    expect(actions).toEqual(['toggle-active']);
  });
});

describe('the Vuetify sort header', () => {
  it('sorts descending, ascending, then not, and a sort of another column resets its arrow', () => {
    const header = <HTMLElement & {activeSort?: unknown}>element('bro-vuetify-sort-header', {'header-title': 'Price', 'sort-id': 'price', 'arrow-position': 'before'});
    const sorts: unknown[] = [];

    header.addEventListener('bro-action', event => sorts.push((<CustomEvent>event).detail.data));

    const label = () => header.querySelector<HTMLElement>('.bro-vuetify-sort-header')!;

    label().click();
    expect(label().classList).toContain('bro-vuetify-sort-header_desc');
    label().click();
    label().click();

    expect(sorts).toEqual([
      {sortKey: 'price', sortDirection: 'desc'},
      {sortKey: 'price', sortDirection: 'asc'},
      {sortKey: 'price', sortDirection: undefined}
    ]);

    label().click();
    header.activeSort = {sortKey: 'name', sortDirection: 'asc'};

    expect(label().classList).not.toContain('bro-vuetify-sort-header_sorted');
    expect(label().classList).toContain('bro-vuetify-sort-header_before');
    expect(header.querySelector('.bro-vuetify-sort-header-content')!.textContent).toBe('Price');
  });
});

describe('the Vuetify paginator', () => {
  it('shows the range of the texts of the table and sends the event page', () => {
    const paginator = element('bro-vuetify-paginator', {}, {pageIndex: 0, pageSize: 5, length: 12, pageSizeOptions: [5, 10], showFirstLastButtons: true});
    const pages: unknown[] = [];

    paginator.addEventListener('page', event => pages.push((<CustomEvent>event).detail));
    paginator.querySelector<HTMLElement>('.bro-paginator-navigation-next')!.click();

    expect(paginator.querySelector('.bro-vuetify-paginator-range')!.textContent).toBe(config.texts.rangeLabel(1, 5, 12));
    expect(paginator.querySelector('.bro-paginator-navigation-next')!.getAttribute('aria-label')).toBe(config.texts.nextPage);
    expect(pages).toEqual([{pageIndex: 1, previousPageIndex: 0, pageSize: 5, length: 12}]);

    (<HTMLElement & {disabled: boolean}>paginator).disabled = true;

    expect(paginator.querySelector<HTMLButtonElement>('.bro-paginator-navigation-previous')!.disabled).toBe(true);
  });
});

describe('the Vuetify toolbar', () => {
  it('takes the nodes of the table before and after it renders', () => {
    const toolbar = document.createElement('bro-vuetify-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const before = document.createElement('input');
    const after = document.createElement('span');

    toolbar.appendToolbarContent(before);
    document.body.append(toolbar);
    toolbar.appendToolbarContent(after);

    expect([...toolbar.querySelector('.v-toolbar__content')!.children]).toEqual([before, after]);
  });

  it('renders an element of the skin among its nodes at once, as the close button of the filter drawer', () => {
    const errors = vi.spyOn(console, 'error');
    const warnings = vi.spyOn(console, 'warn');
    const toolbar = document.createElement('bro-vuetify-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const close = document.createElement('bro-vuetify-button');

    close.setAttribute('icon', 'close');
    close.setAttribute('label', 'Close');
    toolbar.appendToolbarContent(close);
    document.body.append(toolbar);

    expect(close.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();

    errors.mockRestore();
    warnings.mockRestore();
  });

  it('sends the search and the buttons of the config as the event of the toolbar', () => {
    const toolbar = element('bro-vuetify-toolbar-main', {title: 'Orders', buttons: JSON.stringify([{buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list'}])});
    const actions: string[] = [];

    toolbar.addEventListener(events.toolbarEvent, event => actions.push((<CustomEvent<string>>event).detail));
    toolbar.querySelector<HTMLElement>('.bro-toolbar-button-search')!.click();
    toolbar.querySelector<HTMLElement>('button[aria-label="Filters"]')!.click();

    expect(toolbar.querySelector('.bro-toolbar-title')!.textContent).toBe('Orders');
    expect(actions).toEqual([events.toolbarSearchOpenEvent, events.filtersToggleEvent]);
  });
});

describe('the themes of the skin vuetify', () => {
  it('give a table with a theme of its own the variables of that theme of the application', () => {
    const rules = themeRules(vuetify.theme.styles.value, vuetify.theme.prefix);

    expect(rules).toContain(':is(table-bro, table-bro-filter-drawer-container)[data-vuetify-theme="dark"], '
      + ':is(table-bro, table-bro-filter-drawer-container)[data-vuetify-theme="dark"] [class*="v-theme--"] {');
    expect(rules).toContain('color-scheme: dark');
    expect(rules).toContain(`--v-theme-surface: ${surfaceChannels('dark').join(',')}`);
  });
});

describe('a table of the skin vuetify', () => {
  it('renders the components of Vuetify with the theme of the application', () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'vuetify', toolbarTitle: 'Orders'}});

    expect(table.querySelector('bro-vuetify-toolbar-main .v-toolbar')).not.toBeNull();
    expect(table.querySelectorAll('.bro-vuetify-sort-header-content').length).toBeGreaterThan(0);
    expect(table.querySelector('bro-vuetify-paginator .bro-vuetify-paginator')).not.toBeNull();
  });

  it('takes the dark theme of the application with the theme of its own', async () => {
    const table = document.createElement('table-bro');

    styles();
    table.setAttribute('theme', 'dark');
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}], conf: {skin: 'vuetify'}});

    await vi.waitFor(() => expect(table.getAttribute('data-vuetify-theme')).toBe('dark'));
    expect(getComputedStyle(table.querySelector('bro-vuetify-paginator')!).backgroundColor).toBe(`rgb(${surfaceChannels('dark').join(', ')})`);
  });

  it('renders its elements when Vue configures it in onMounted', async () => {
    const errors = vi.spyOn(console, 'error');
    const host = document.createElement('div');
    const table = ref<TableBroHTMLElement>();

    styles();
    document.body.append(host);

    const app = createApp({
      setup() {
        onMounted(() => table.value!.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'vuetify', toolbarTitle: 'Orders'}}));

        return () => h('table-bro', {ref: table});
      }
    });

    app.use(vuetify).mount(host);
    await vi.waitFor(() => expect(table.value?.querySelector('bro-vuetify-paginator .bro-vuetify-paginator')).toBeInstanceOf(HTMLElement));

    expect([...table.value!.querySelectorAll('.bro-vuetify-sort-header-content')].map(content => content.textContent)).toContain('Price');
    expect(errors).not.toHaveBeenCalled();

    app.unmount();
    errors.mockRestore();
  });
});

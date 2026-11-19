import {type BroConfigureOptions, type BroResolvedConfig, defineTableBroFilterDrawerContainer, events, resolveTexts, type TableBroHTMLElement} from '@table-bro/core';

import {mount, unmount}                      from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {userEvent}                           from 'vitest/browser';

import OrdersTable                                                                     from './orders-table.fixture.svelte';
import {attachM3SvelteTooltip, m3SvelteSkinConfig, setTagsTexts, withSwitch, withTags} from './table-bro.svelte-m3';

// The CSS of the core and of the skin from their builds: the table measures its columns in them. The theme of M3
// Svelte is the one of the application: its styles come with its components, which the specs compile
const skinCssModule: string = '../dist/table-bro.svelte-m3.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);
const coreCssModule: string = '../../../core/dist/table-bro.min.css?inline';
const {default: coreCss} = <{default: string}>await import(/* @vite-ignore */ coreCssModule);

// The optional elements, as a page with tags and switches defines them after the import of the skin
withTags();
withSwitch();

// The elements of the skin m3-svelte, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...m3SvelteSkinConfig, skin: 'm3-svelte', texts: resolveTexts({noItems: 'Nothing', loadingProgress: 'Loading the rows'})};

/** A table of the skin with one number column. */
const orders: BroConfigureOptions<{price: number}> = {cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'm3-svelte', toolbarTitle: 'Orders'}};

function element(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): HTMLElement {
  const el = document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

/** The CSS of the core and of the skin, in the body: the head keeps the styles of M3 Svelte. */
function styles(): void {
  const style = document.createElement('style');

  style.textContent = coreCss + skinCss;
  document.body.append(style);
}

afterEach(() => document.body.replaceChildren());

describe('the M3 button', () => {
  it('renders a text button with its title, or an icon button named by its label, and sends its event type', () => {
    const titled = element('bro-m3-svelte-button', {'button-title': 'Details', icon: 'expand_more', 'event-type': 'open'});
    const icon = element('bro-m3-svelte-button', {icon: 'close', label: 'Close'});
    const actions: string[] = [];

    titled.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));
    titled.querySelector('button')!.click();

    expect(titled.querySelector('button')!.textContent).toBe('expand_moreDetails');
    expect(titled.querySelector(m3SvelteSkinConfig.components.button.iconSelector)).not.toBeNull();
    expect(icon.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(actions).toEqual(['open']);
  });

  it('keeps its component through a move in the DOM and drops it out of the DOM', async () => {
    const button = element('bro-m3-svelte-button', {icon: 'close', label: 'Close'});
    const rendered = button.querySelector('button');

    document.body.prepend(button);
    await Promise.resolve();

    expect(button.querySelector('button')).toBe(rendered);

    button.remove();
    await Promise.resolve();

    expect(button.childElementCount).toBe(0);
  });
});

describe('the M3 progress bar', () => {
  it('has the name of the config and follows its value in the determinate mode', () => {
    const indeterminate = element('bro-m3-svelte-progress-bar', {mode: 'indeterminate'}).querySelector('[role="progressbar"]')!;
    const determinate = element('bro-m3-svelte-progress-bar', {mode: 'determinate', value: '30'});
    const percent = () => determinate.querySelector<HTMLElement>('[role="progressbar"] > :first-child')!.style.width;

    expect(indeterminate.getAttribute('aria-label')).toBe('Loading the rows');
    expect(determinate.querySelector('[role="progressbar"]')!.getAttribute('aria-label')).toBe('Loading the rows');

    expect(percent()).toBe('30%');
    determinate.setAttribute('value', '60');
    expect(percent()).toBe('60%');
  });
});

describe('the M3 tags', () => {
  it('renders the items of the field as chips, and the text of an empty cell that setTagsTexts() changes', () => {
    const col = {name: 'tags', title: 'Tags'};
    const tags = element('bro-m3-svelte-tags', {}, {col, row: {tags: ['red', 'green']}});
    const empty = element('bro-m3-svelte-tags', {}, {col, row: {tags: []}});

    expect([...tags.querySelectorAll('label.m3-container')].map(chip => chip.textContent!.trim())).toEqual(['red', 'green']);
    expect(empty.querySelector('label.m3-container')!.textContent!.trim()).toBe('Nothing');

    setTagsTexts({empty: 'No tags'});

    expect(empty.querySelector('label.m3-container')!.textContent!.trim()).toBe('No tags');
  });
});

describe('the M3 switch', () => {
  it('shows the boolean of the row, is named by the title of the column and sends its action', () => {
    const toggle = element('bro-m3-svelte-switch', {name: 'toggle-active'}, {col: {name: 'active', title: 'Active'}, row: {active: true}});
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

describe('the M3 sort header', () => {
  it('sorts descending, ascending, then not, and a sort of another column resets its arrow', () => {
    const header = <HTMLElement & {activeSort?: unknown}>element('bro-m3-svelte-sort-header', {'header-title': 'Price', 'sort-id': 'price', 'arrow-position': 'before'});
    const sorts: unknown[] = [];

    header.addEventListener('bro-action', event => sorts.push((<CustomEvent>event).detail.data));

    const control = () => header.querySelector<HTMLElement>('.bro-m3-svelte-sort-header')!;

    control().click();
    expect(control().classList.contains('bro-m3-svelte-sort-header_sorted')).toBe(true);
    control().click();
    control().dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

    expect(sorts).toEqual([
      {sortKey: 'price', sortDirection: 'desc'},
      {sortKey: 'price', sortDirection: 'asc'},
      {sortKey: 'price', sortDirection: undefined}
    ]);

    control().click();
    header.activeSort = {sortKey: 'name', sortDirection: 'asc'};

    expect(control().classList.contains('bro-m3-svelte-sort-header_sorted')).toBe(false);
    expect(control().classList.contains('bro-m3-svelte-sort-header_before')).toBe(true);
    expect(header.querySelector('.bro-m3-svelte-sort-header-content')!.textContent).toBe('Price');
  });
});

describe('the M3 tooltip', () => {
  const tooltipOf = (host: Element) => host.querySelector<HTMLElement>('.bro-m3-svelte-tooltip');

  it('shows the whole value of a cut cell above it on the hover of a mouse, and hides it when the mouse leaves', async () => {
    styles();

    const ellipsis = element('bro-m3-svelte-text-ellipsis', {value: 'A long name'});
    const container = <HTMLElement>ellipsis.firstElementChild;

    ellipsis.style.cssText = 'display: block; margin-top: 200px';
    container.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));

    const tooltip = tooltipOf(ellipsis)!;

    expect(tooltip.textContent).toBe('A long name');
    expect(tooltip.matches(':popover-open')).toBe(true);
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(container.getAttribute('aria-describedby')).toBe(tooltip.id);
    // Above its target, 8px away, as the tooltip of Angular Material, once it has grown in
    await vi.waitFor(() => expect(container.getBoundingClientRect().top - tooltip.getBoundingClientRect().bottom).toBeCloseTo(8, 0));

    container.dispatchEvent(new PointerEvent('pointerleave', {pointerType: 'mouse'}));

    await vi.waitFor(() => expect(tooltipOf(ellipsis)).toBeNull());
    expect(container.hasAttribute('aria-describedby')).toBe(false);
  });

  it('takes the opposite side without room above the target, and shows nothing for a touch until a long press', () => {
    styles();

    const ellipsis = element('bro-m3-svelte-text-ellipsis', {value: 'A long name'});
    const container = <HTMLElement>ellipsis.firstElementChild;

    document.body.prepend(ellipsis);
    container.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'touch'}));

    expect(tooltipOf(ellipsis)).toBeNull();

    container.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));

    expect(tooltipOf(ellipsis)!.classList.contains('bro-m3-svelte-tooltip_below')).toBe(true);
    expect(tooltipOf(ellipsis)!.getBoundingClientRect().top).toBeGreaterThan(container.getBoundingClientRect().bottom);
  });

  it('shows the tooltip of a sort header on the right on a focus of the keyboard, and hides it on Escape', async () => {
    styles();

    const header = element('bro-m3-svelte-sort-header', {'header-title': 'Price', 'sort-id': 'price', tooltip: 'The price of the order'});

    header.style.cssText = 'display: block; width: 200px';

    const control = header.querySelector<HTMLElement>('.bro-m3-svelte-sort-header')!;
    const escape = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true});

    // A key before the focus makes it a focus of the keyboard
    await userEvent.keyboard('{Shift}');
    control.focus();

    expect(tooltipOf(header)!.textContent).toBe('The price of the order');
    expect(tooltipOf(header)!.classList.contains('bro-m3-svelte-tooltip_right')).toBe(true);

    control.dispatchEvent(escape);

    expect(escape.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(tooltipOf(header)).toBeNull());
  });

  it('is the public tooltip of the skin for the nodes of an application, held by the parent of the target', async () => {
    styles();

    const cell = document.createElement('div');
    const button = document.createElement('button');

    cell.style.cssText = 'margin-top: 200px';
    button.textContent = 'Edit';
    cell.append(button);
    document.body.append(cell);

    const release = attachM3SvelteTooltip(button, 'Edit the order');

    button.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));

    // The parent holds the popover: a click on the tooltip does not reach the button
    expect(tooltipOf(cell)!.parentElement).toBe(cell);
    expect(tooltipOf(cell)!.textContent).toBe('Edit the order');
    expect(getComputedStyle(tooltipOf(cell)!).position).toBe('fixed');
    expect(tooltipOf(cell)!.classList.contains('bro-m3-svelte-tooltip_above')).toBe(true);

    release();

    expect(tooltipOf(cell)).toBeNull();

    button.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));

    expect(tooltipOf(cell)).toBeNull();
  });

  it('gives a target of a server DOM no tooltip', () => {
    const server = document.implementation.createHTMLDocument('');
    const ellipsis = server.createElement('bro-m3-svelte-text-ellipsis');
    const target = server.createElement('span');

    ellipsis.append(target);
    server.body.append(ellipsis);
    target.dispatchEvent(new PointerEvent('pointerenter', {pointerType: 'mouse'}));

    expect(tooltipOf(ellipsis)).toBeNull();
  });
});

describe('the M3 paginator', () => {
  it('shows the range of the texts of the table and sends the event page', () => {
    const paginator = element('bro-m3-svelte-paginator', {}, {pageIndex: 0, pageSize: 5, length: 12, pageSizeOptions: [5, 10], showFirstLastButtons: true});
    const pages: unknown[] = [];

    paginator.addEventListener('page', event => pages.push((<CustomEvent>event).detail));
    paginator.querySelector<HTMLElement>('.bro-paginator-navigation-next')!.click();

    expect(paginator.querySelector('.bro-m3-svelte-paginator-range')!.textContent).toBe(config.texts.rangeLabel(1, 5, 12));
    expect(paginator.querySelector('.bro-m3-svelte-paginator-page-size-label')!.textContent).toBe(config.texts.itemsPerPage);
    expect([...paginator.querySelectorAll('option')].map(option => option.value)).toEqual(['5', '10']);
    expect(pages).toEqual([{pageIndex: 1, previousPageIndex: 0, pageSize: 5, length: 12}]);

    const select = paginator.querySelector('select')!;

    select.value = '10';
    select.dispatchEvent(new Event('change', {bubbles: true}));

    expect(pages[1]).toEqual({pageIndex: 0, previousPageIndex: 1, pageSize: 10, length: 12});

    (<HTMLElement & {disabled: boolean}>paginator).disabled = true;

    expect(paginator.querySelector<HTMLButtonElement>('.bro-paginator-navigation-previous')!.disabled).toBe(true);
    expect(paginator.querySelector<HTMLButtonElement>('.bro-paginator-navigation-previous')!.getAttribute('aria-label')).toBe(config.texts.previousPage);
  });
});

describe('the M3 toolbar', () => {
  it('takes the nodes of the table before and after it renders', () => {
    const toolbar = document.createElement('bro-m3-svelte-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const before = document.createElement('input');
    const after = document.createElement('span');

    toolbar.appendToolbarContent(before);
    document.body.append(toolbar);
    toolbar.appendToolbarContent(after);

    expect([...toolbar.querySelector('.bro-m3-svelte-toolbar')!.children]).toEqual([before, after]);
  });

  it('sends the search, the buttons and the items of the menu of the config as the event of the toolbar', () => {
    const buttons = [
      {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list'},
      {buttonTitle: 'More', mode: 'navbar-dropdown', options: [{title: 'Export', value: 'export'}, {divider: true}, {title: 'Print', value: 'print'}]}
    ];
    const toolbar = element('bro-m3-svelte-toolbar-main', {title: 'Orders', buttons: JSON.stringify(buttons)});
    const actions: string[] = [];

    toolbar.addEventListener(events.toolbarEvent, event => actions.push((<CustomEvent<string>>event).detail));
    toolbar.querySelector<HTMLElement>('.bro-toolbar-button-search')!.click();
    toolbar.querySelector<HTMLElement>('button[aria-label="Filters"]')!.click();
    toolbar.querySelector<HTMLElement>('button[aria-label="More"]')!.click();

    expect(toolbar.querySelector('.bro-m3-svelte-toolbar-menu')!.matches(':popover-open')).toBe(true);

    [...toolbar.querySelectorAll<HTMLElement>('.bro-m3-svelte-toolbar-menu button')].at(-1)!.click();

    expect(toolbar.querySelector('.bro-toolbar-title')!.textContent).toBe('Orders');
    expect(toolbar.querySelector('.bro-m3-svelte-toolbar-menu')!.matches(':popover-open')).toBe(false);
    expect(actions).toEqual([events.toolbarSearchOpenEvent, events.filtersToggleEvent, 'print']);
  });
});

describe('a table of the skin m3-svelte', () => {
  it('renders the components of M3 Svelte at once', () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);
    table.configure(orders);

    expect(table.querySelector('bro-m3-svelte-toolbar-main .bro-m3-svelte-toolbar')).not.toBeNull();
    expect([...table.querySelectorAll('.bro-m3-svelte-sort-header-content')].map(content => content.textContent)).toContain('Price');
    expect(table.querySelector('bro-m3-svelte-paginator select')).not.toBeNull();
  });

  it('renders its elements when a component of Svelte configures it in onMount', async () => {
    const errors = vi.spyOn(console, 'error');
    const host = document.createElement('div');
    let table: TableBroHTMLElement | null = null;

    styles();
    document.body.append(host);

    const component = mount(OrdersTable, {target: host, props: {configure: (element: TableBroHTMLElement) => {
      table = element;
      element.configure(orders);
    }}});

    await vi.waitFor(() => expect(table?.querySelector('bro-m3-svelte-paginator select')).toBeInstanceOf(HTMLElement));

    expect([...table!.querySelectorAll('.bro-m3-svelte-sort-header-content')].map(content => content.textContent)).toContain('Price');
    expect(errors).not.toHaveBeenCalled();

    errors.mockRestore();
    void unmount(component);
  });

  it('keeps the onMount of a component of Svelte whose filter drawer renders the elements of the skin in its mount', async () => {
    const host = document.createElement('div');
    let table: TableBroHTMLElement | null = null;

    defineTableBroFilterDrawerContainer();
    styles();
    document.body.append(host);

    const component = mount(OrdersTable, {target: host, props: {drawer: true, configure: (element: TableBroHTMLElement) => {
      table = element;
      element.configure(orders);
    }}});

    // The close button of the drawer renders in the mount of the component, before its onMount configures the table
    expect(host.querySelector('.bro-filter-drawer-header bro-m3-svelte-button button')).toBeInstanceOf(HTMLElement);

    await vi.waitFor(() => expect(table?.querySelector('bro-m3-svelte-paginator select')).toBeInstanceOf(HTMLElement));

    void unmount(component);
  });
});

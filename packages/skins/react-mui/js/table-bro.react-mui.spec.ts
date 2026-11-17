import {type BroResolvedConfig, events, resolveTexts, type TableBroHTMLElement} from '@table-bro/core';

import {createTheme}                         from '@mui/material/styles';
import {createElement, useEffect, useRef}    from 'react';
import {createRoot}                          from 'react-dom/client';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {muiSkinConfig, setMuiTheme, setTagsTexts, withSwitch, withTags} from './table-bro.react-mui';

// The CSS of the core and of the skin from their builds: the table measures its columns in them
const skinCssModule: string = '../dist/table-bro.react-mui.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);
const coreCssModule: string = '../../../core/dist/table-bro.min.css?inline';
const {default: coreCss} = <{default: string}>await import(/* @vite-ignore */ coreCssModule);

// The optional elements, as a page with tags and switches defines them after the import of the skin, and the theme of
// the application with the CSS variables of MUI
withTags();
withSwitch();
setMuiTheme(createTheme({cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'}, colorSchemes: {light: true, dark: true}}));

// The elements of the MUI skin, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...muiSkinConfig, skin: 'mui', texts: resolveTexts({noItems: 'Nothing', loadingProgress: 'Loading the rows'})};

function element(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): HTMLElement {
  const el = document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

/** The CSS of the core and of the skin, in the body: the head keeps the styles of MUI. */
function styles(): void {
  const style = document.createElement('style');

  style.textContent = coreCss + skinCss;
  document.body.append(style);
}

afterEach(() => document.body.replaceChildren());

describe('the MUI button', () => {
  it('renders a text button with its title, or an icon button named by its label, and sends its event type', () => {
    const titled = element('bro-mui-button', {'button-title': 'Details', icon: 'expand_more', 'event-type': 'open'});
    const icon = element('bro-mui-button', {icon: 'close', label: 'Close'});
    const actions: string[] = [];

    titled.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));
    titled.querySelector('button')!.click();

    expect(titled.querySelector('button')!.textContent).toBe('expand_moreDetails');
    expect(titled.querySelector(muiSkinConfig.components.button.iconSelector)).not.toBeNull();
    expect(icon.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(actions).toEqual(['open']);
  });

  it('keeps its React tree through a move in the DOM and drops it out of the DOM', async () => {
    const button = element('bro-mui-button', {icon: 'close', label: 'Close'});
    const rendered = button.querySelector('button');

    document.body.prepend(button);
    await Promise.resolve();

    expect(button.querySelector('button')).toBe(rendered);

    button.remove();
    await Promise.resolve();

    expect(button.childElementCount).toBe(0);
  });
});

describe('the MUI progress bar', () => {
  it('has the name of the config and follows its value in the determinate mode', () => {
    const indeterminate = element('bro-mui-progress-bar', {mode: 'indeterminate'}).querySelector('[role="progressbar"]')!;
    const determinate = element('bro-mui-progress-bar', {mode: 'determinate', value: '30'});

    expect(indeterminate.getAttribute('aria-label')).toBe('Loading the rows');
    expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false);

    expect(determinate.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('30');
    determinate.setAttribute('value', '60');
    expect(determinate.querySelector('[role="progressbar"]')!.getAttribute('aria-valuenow')).toBe('60');
  });
});

describe('the MUI tags', () => {
  it('renders the items of the field as chips, and the text of an empty cell that setTagsTexts() changes', () => {
    const col = {name: 'tags', title: 'Tags'};
    const tags = element('bro-mui-tags', {}, {col, row: {tags: ['red', 'green']}});
    const empty = element('bro-mui-tags', {}, {col, row: {tags: []}});

    expect([...tags.querySelectorAll('.MuiChip-label')].map(chip => chip.textContent)).toEqual(['red', 'green']);
    expect(empty.querySelector('.MuiChip-label')!.textContent).toBe('Nothing');

    setTagsTexts({empty: 'No tags'});

    expect(empty.querySelector('.MuiChip-label')!.textContent).toBe('No tags');
  });
});

describe('the MUI switch', () => {
  it('shows the boolean of the row, is named by the title of the column and sends its action', () => {
    const toggle = element('bro-mui-switch', {name: 'toggle-active'}, {col: {name: 'active', title: 'Active'}, row: {active: true}});
    const input = toggle.querySelector('input')!;
    const actions: string[] = [];

    toggle.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));
    input.click();

    expect(input.getAttribute('aria-label')).toBe('Active');
    expect(actions).toEqual(['toggle-active']);
  });
});

describe('the MUI sort header', () => {
  it('sorts descending, ascending, then not, and a sort of another column resets its arrow', () => {
    const header = <HTMLElement & {activeSort?: unknown}>element('bro-mui-sort-header', {'header-title': 'Price', 'sort-id': 'price', 'arrow-position': 'before'});
    const sorts: unknown[] = [];

    header.addEventListener('bro-action', event => sorts.push((<CustomEvent>event).detail.data));

    const label = () => header.querySelector<HTMLElement>('.MuiTableSortLabel-root')!;

    label().click();
    expect(label().classList.contains('Mui-active')).toBe(true);
    label().click();
    label().click();

    expect(sorts).toEqual([
      {sortKey: 'price', sortDirection: 'desc'},
      {sortKey: 'price', sortDirection: 'asc'},
      {sortKey: 'price', sortDirection: undefined}
    ]);

    label().click();
    header.activeSort = {sortKey: 'name', sortDirection: 'asc'};

    expect(label().classList.contains('Mui-active')).toBe(false);
    expect(label().classList.contains('bro-mui-sort-header_before')).toBe(true);
    expect(header.querySelector('.bro-mui-sort-header-content')!.textContent).toBe('Price');
  });
});

describe('the MUI paginator', () => {
  it('shows the range of the texts of the table and sends the event page', () => {
    const paginator = element('bro-mui-paginator', {}, {pageIndex: 0, pageSize: 5, length: 12, pageSizeOptions: [5, 10], showFirstLastButtons: true});
    const pages: unknown[] = [];

    paginator.addEventListener('page', event => pages.push((<CustomEvent>event).detail));
    paginator.querySelector<HTMLElement>(`button[aria-label="${config.texts.nextPage}"]`)!.click();

    expect(paginator.querySelector('.MuiTablePagination-displayedRows')!.textContent).toBe(config.texts.rangeLabel(1, 5, 12));
    expect(pages).toEqual([{pageIndex: 1, previousPageIndex: 0, pageSize: 5, length: 12}]);

    (<HTMLElement & {disabled: boolean}>paginator).disabled = true;

    expect(paginator.querySelector<HTMLButtonElement>(`button[aria-label="${config.texts.previousPage}"]`)!.disabled).toBe(true);
  });
});

describe('the MUI toolbar', () => {
  it('takes the nodes of the table before and after it renders', () => {
    const toolbar = document.createElement('bro-mui-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const before = document.createElement('input');
    const after = document.createElement('span');

    toolbar.appendToolbarContent(before);
    document.body.append(toolbar);
    toolbar.appendToolbarContent(after);

    expect([...toolbar.querySelector('.MuiToolbar-root')!.children]).toEqual([before, after]);
  });

  it('renders an element of the skin among its nodes at once, as the close button of the filter drawer', () => {
    const errors = vi.spyOn(console, 'error');
    const toolbar = document.createElement('bro-mui-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const close = document.createElement('bro-mui-button');

    close.setAttribute('icon', 'close');
    close.setAttribute('label', 'Close');
    toolbar.appendToolbarContent(close);
    document.body.append(toolbar);

    expect(close.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(errors).not.toHaveBeenCalled();

    errors.mockRestore();
  });

  it('sends the search and the buttons of the config as the event of the toolbar', () => {
    const toolbar = element('bro-mui-toolbar-main', {title: 'Orders', buttons: JSON.stringify([{buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list'}])});
    const actions: string[] = [];

    toolbar.addEventListener(events.toolbarEvent, event => actions.push((<CustomEvent<string>>event).detail));
    toolbar.querySelector<HTMLElement>('.bro-toolbar-button-search')!.click();
    toolbar.querySelector<HTMLElement>('button[aria-label="Filters"]')!.click();

    expect(toolbar.querySelector('.bro-toolbar-title')!.textContent).toBe('Orders');
    expect(actions).toEqual([events.toolbarSearchOpenEvent, events.filtersToggleEvent]);
  });
});

describe('a table of the skin mui', () => {
  it('renders the components of MUI with the theme of the application', () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'mui', toolbarTitle: 'Orders'}});

    expect(table.querySelector('bro-mui-toolbar-main .MuiToolbar-root')).not.toBeNull();
    expect(table.querySelectorAll('.bro-mui-sort-header-content').length).toBeGreaterThan(0);
    expect(table.querySelector('bro-mui-paginator .MuiTablePagination-root')).not.toBeNull();
  });

  it('renders its elements when React configures it in an effect through a microtask, after the commit of React', async () => {
    const errors = vi.spyOn(console, 'error');
    const host = document.createElement('div');
    let table: TableBroHTMLElement | null = null;

    styles();
    document.body.append(host);

    function Orders() {
      const ref = useRef<TableBroHTMLElement>(null);

      useEffect(() => {
        table = ref.current!;
        queueMicrotask(() => table!.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'mui', toolbarTitle: 'Orders'}}));
      }, []);

      return createElement('table-bro', {ref});
    }

    createRoot(host).render(createElement(Orders));
    await vi.waitFor(() => expect(table?.querySelector('bro-mui-paginator .MuiTablePagination-root')).toBeInstanceOf(HTMLElement));

    expect([...table!.querySelectorAll('.bro-mui-sort-header-content')].map(content => content.textContent)).toContain('Price');
    expect(errors).not.toHaveBeenCalled();

    errors.mockRestore();
  });
});

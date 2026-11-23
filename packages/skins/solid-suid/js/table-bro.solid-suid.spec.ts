import {type BroResolvedConfig, events, resolveTexts, type TableBroHTMLElement} from '@table-bro/core';

import {createPalette, createTheme}             from '@suid/material/styles';
import {createComponent, createSignal, onMount} from 'solid-js';
import {Dynamic, render}                        from 'solid-js/web';
import {afterEach, describe, expect, it, vi}    from 'vitest';

import {setServerRender}                                                                                         from './bro-suid-element';
import {attachSuidTooltip, setSuidTheme, setTagsTexts, suidSkinConfig, suidThemeVariables, withSwitch, withTags} from './table-bro.solid-suid';

// The CSS of the core and of the skin from their builds: the table measures its columns in them
const skinCssModule: string = '../dist/table-bro.solid-suid.min.css?inline';
const {default: skinCss} = <{default: string}>await import(/* @vite-ignore */ skinCssModule);
const coreCssModule: string = '../../../core/dist/table-bro.min.css?inline';
const {default: coreCss} = <{default: string}>await import(/* @vite-ignore */ coreCssModule);

// The optional elements, as a page with tags and switches defines them after the import of the skin, and the theme of
// the application, whose palette follows a signal of its color scheme
withTags();
withSwitch();

const [dark, setDark] = createSignal(false);
const palette = () => createPalette({mode: dark() ? 'dark' : 'light'});

setSuidTheme(createTheme({palette}));

// The elements of the SUID skin, as the table creates them: with the config of a table
const config = <BroResolvedConfig><unknown>{...suidSkinConfig, skin: 'suid', texts: resolveTexts({noItems: 'Nothing', loadingProgress: 'Loading the rows'})};

function element(tag: string, attributes: Record<string, string> = {}, properties: Record<string, unknown> = {}): HTMLElement {
  const el = document.createElement(tag);

  Object.assign(el, {config, ...properties});
  Object.entries(attributes).forEach(([name, value]) => el.setAttribute(name, value));
  document.body.append(el);

  return el;
}

/** The CSS of the core and of the skin, in the body: the head keeps the styles of SUID. */
function styles(): void {
  const style = document.createElement('style');

  style.textContent = coreCss + skinCss;
  document.body.append(style);
}

afterEach(() => document.body.replaceChildren());

describe('the SUID theme', () => {
  it('writes the CSS variables of the theme for the tables, again when its palette changes', () => {
    const table = element('table-bro');
    const background = () => getComputedStyle(table).getPropertyValue('--suid-palette-background-paper');

    table.classList.add('suid');

    expect(background()).toBe('#fff');

    setDark(true);

    expect(background()).toBe('#121212');

    setDark(false);
  });

  it('gives the CSS variables of a theme for a rule of the application, as of the dark theme of a prerendered page', () => {
    const variables = suidThemeVariables(createTheme({palette: createPalette({mode: 'dark', background: {paper: '#211f22'}})}));

    expect(variables).toContain('--suid-palette-background-paper: #211f22;');
    expect(variables).toContain('--suid-palette-text-primary: #fff;');
  });
});

describe('the tooltip of the skin', () => {
  it('gives an element of the application the tooltip, which its release takes off', () => {
    const button = document.createElement('button');

    document.body.append(button);

    const release = attachSuidTooltip(button, 'Edit');

    button.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe('Edit');

    release();

    expect(document.querySelector('.bro-suid-tooltip')).toBeNull();

    button.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelector('.bro-suid-tooltip')).toBeNull();
  });

  it('takes its text from a function each time it shows, on the side of its options, also out of a table', async () => {
    const button = document.createElement('button');
    let text = 'Edit';

    document.body.append(button);
    attachSuidTooltip(button, () => text, {placement: 'right'});
    button.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe('Edit');
    await vi.waitFor(() => expect(document.querySelector('.bro-suid-tooltip-popper')!.getAttribute('data-popper-placement')).toBe('right'));

    button.dispatchEvent(new MouseEvent('mouseleave'));
    text = 'Save';
    button.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe('Save');
  });

  it('shows none on a disabled element', () => {
    const button = document.createElement('button');

    button.disabled = true;
    document.body.append(button);
    attachSuidTooltip(button, 'Edit');
    button.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelector('.bro-suid-tooltip')).toBeNull();
  });
});

describe('a table with a theme of its own', () => {
  it('takes the variables and the theme of SUID of its scheme in a light application', async () => {
    const table = document.createElement('table-bro');

    styles();
    table.setAttribute('theme', 'dark');
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}], conf: {skin: 'suid', toolbarTitle: 'Orders'}});

    const search = table.querySelector<HTMLElement>('bro-suid-toolbar-main .bro-toolbar-button-search')!;

    expect(table.getAttribute('data-suid-theme')).toBe('dark');
    expect(getComputedStyle(table).getPropertyValue('--suid-palette-background-paper')).toBe('#121212');
    // The action color of the dark palette of SUID, white, on the icon button of the toolbar
    await vi.waitFor(() => expect(getComputedStyle(search).color).toBe('rgb(255, 255, 255)'));

    table.setAttribute('theme', 'light');

    expect(getComputedStyle(table).getPropertyValue('--suid-palette-background-paper')).toBe('#fff');
    await vi.waitFor(() => expect(getComputedStyle(search).color).toBe('rgba(0, 0, 0, 0.54)'));
  });
});

describe('the SUID button', () => {
  it('renders a text button with its title, or an icon button named by its label, and sends its event type', () => {
    const titled = element('bro-suid-button', {'button-title': 'Details', icon: 'expand_more', 'event-type': 'open'});
    const icon = element('bro-suid-button', {icon: 'close', label: 'Close'});
    const actions: string[] = [];

    titled.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));
    titled.querySelector('button')!.click();

    expect(titled.querySelector('button')!.textContent).toBe('expand_moreDetails');
    expect(titled.querySelector(suidSkinConfig.components.button.iconSelector)).not.toBeNull();
    expect(icon.querySelector('button')!.getAttribute('aria-label')).toBe('Close');
    expect(actions).toEqual(['open']);
  });

  it('keeps its Solid tree through a move in the DOM and drops it out of the DOM', async () => {
    const button = element('bro-suid-button', {icon: 'close', label: 'Close'});
    const rendered = button.querySelector('button');

    document.body.prepend(button);
    await Promise.resolve();

    expect(button.querySelector('button')).toBe(rendered);

    button.remove();
    await Promise.resolve();

    expect(button.childElementCount).toBe(0);
  });

  it('renders its markup in a server DOM once, also when it connects there again', async () => {
    // The render of the server entry, as a prerender on the server has it: a server DOM has a window of its own
    setServerRender(() => '<button></button>');

    const server = document.implementation.createHTMLDocument('');
    const button = document.createElement('bro-suid-button');

    Object.assign(button, {config});
    server.body.append(button);
    button.remove();
    await Promise.resolve();
    server.body.append(button);

    expect(button.querySelectorAll('.bro-suid-root')).toHaveLength(1);
  });
});

describe('the SUID progress bar', () => {
  it('has the name of the config and follows its value in the determinate mode', () => {
    const indeterminate = element('bro-suid-progress-bar', {mode: 'indeterminate'}).querySelector('[role="progressbar"]')!;
    const determinate = element('bro-suid-progress-bar', {mode: 'determinate', value: '30'});
    const bar = determinate.querySelector('[role="progressbar"]')!;

    expect(indeterminate.getAttribute('aria-label')).toBe('Loading the rows');
    expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false);

    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    determinate.setAttribute('value', '60');

    // The same node of the progress follows the value
    expect(determinate.querySelector('[role="progressbar"]')).toBe(bar);
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
  });

  it('continues the animation of the prerendered progress bar, whose keyframes SUID names with another id', async () => {
    const host = document.createElement('table-bro');
    const prerendered = <HTMLElement & {connectedCallback(): void}>document.createElement('bro-suid-progress-bar');

    // The markup of the prerender: the bar of SUID with the keyframes of the server render
    host.setAttribute('data-bro-prerender', '');
    prerendered.innerHTML = '<style>@keyframes indeterminate1-server {to {left: 100%}}</style>'
      + '<span style="position: absolute; animation: indeterminate1-server 2.1s infinite"></span>';
    host.append(prerendered);
    document.body.append(host);

    const [animation] = prerendered.getAnimations({subtree: true});

    await animation.ready;

    const {startTime} = animation;

    // The definition of the skin upgrades the prerendered element of the page once its animation runs
    prerendered.connectedCallback();

    // The table renders its own progress bar in the place of the prerendered one
    host.removeAttribute('data-bro-prerender');
    host.replaceChildren();

    const bar = Object.assign(document.createElement('bro-suid-progress-bar'), {config});

    bar.setAttribute('mode', 'indeterminate');
    host.append(bar);

    const continued = <CSSAnimation>bar.getAnimations({subtree: true}).find(item => (<CSSAnimation>item).animationName.startsWith('indeterminate1-'));

    expect(continued.animationName).not.toBe('indeterminate1-server');
    expect(startTime).not.toBeNull();
    expect(continued.startTime).toBe(startTime);
  });
});

describe('the SUID tags', () => {
  it('renders the items of the field as chips, and the text of an empty cell that setTagsTexts() changes', () => {
    const col = {name: 'tags', title: 'Tags'};
    const tags = element('bro-suid-tags', {}, {col, row: {tags: ['red', 'green']}});
    const empty = element('bro-suid-tags', {}, {col, row: {tags: []}});

    expect([...tags.querySelectorAll('.MuiChip-label')].map(chip => chip.textContent)).toEqual(['red', 'green']);
    expect(empty.querySelector('.MuiChip-label')!.textContent).toBe('Nothing');

    setTagsTexts({empty: 'No tags'});

    expect(empty.querySelector('.MuiChip-label')!.textContent).toBe('No tags');
  });
});

describe('the SUID switch', () => {
  it('shows the boolean of the row, is named by the title of the column and sends its action', () => {
    const toggle = element('bro-suid-switch', {name: 'toggle-active'}, {col: {name: 'active', title: 'Active'}, row: {active: true}});
    const input = toggle.querySelector('input')!;
    const actions: string[] = [];

    toggle.addEventListener('action', event => actions.push((<CustomEvent<string>>event).detail));

    expect(input.checked).toBe(true);

    input.click();

    expect(input.getAttribute('aria-label')).toBe('Active');
    expect(actions).toEqual(['toggle-active']);
  });
});

describe('the list of the page sizes', () => {
  it('shows the page size on the select of SUID and sends the chosen one', () => {
    const options = JSON.stringify([{value: '5', title: '5'}, {value: '10', title: '10'}]);
    const dropdown = element('bro-suid-dropdown', {mode: 'select', 'button-title': '5', options, label: 'Items per page:', disabled: 'false'});
    const values: string[] = [];

    dropdown.addEventListener('value', event => values.push((<CustomEvent<string>>event).detail));

    expect(dropdown.querySelector('.MuiSelect-select')!.textContent).toBe('5');

    dropdown.setAttribute('disabled', 'true');

    expect(dropdown.querySelector('.MuiSelect-select')!.classList.contains('Mui-disabled')).toBe(true);
  });
});

describe('the SUID toolbar', () => {
  it('takes the nodes of the table before and after it renders', () => {
    const toolbar = document.createElement('bro-suid-toolbar') as HTMLElement & {appendToolbarContent(...nodes: Node[]): void};
    const before = document.createElement('input');
    const after = document.createElement('span');

    toolbar.appendToolbarContent(before);
    document.body.append(toolbar);
    toolbar.appendToolbarContent(after);

    expect([...toolbar.querySelector('.MuiToolbar-root')!.children]).toEqual([before, after]);
  });

  it('sends the search and the buttons of the config as the event of the toolbar', () => {
    const buttons = [{buttonTitle: 'Filters', buttonTooltip: 'Show the filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list'}];
    const toolbar = element('bro-suid-toolbar-main', {title: 'Orders', buttons: JSON.stringify(buttons)});
    const actions: string[] = [];
    const filters = toolbar.querySelector<HTMLElement>('button[aria-label="Filters"]')!;

    toolbar.addEventListener(events.toolbarEvent, event => actions.push((<CustomEvent<string>>event).detail));
    toolbar.querySelector<HTMLElement>('.bro-toolbar-button-search')!.click();
    filters.click();

    expect(toolbar.querySelector('.bro-toolbar-title')!.textContent).toBe('Orders');
    expect(actions).toEqual([events.toolbarSearchOpenEvent, events.filtersToggleEvent]);
  });

  it('shows the tooltip of a button of the config on hover, describes the button by it, and hides it on Escape', () => {
    const buttons = [{buttonTitle: 'Filters', buttonTooltip: 'Show the filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list'}];
    const toolbar = element('bro-suid-toolbar-main', {title: 'Orders', buttons: JSON.stringify(buttons)});
    const filters = toolbar.querySelector<HTMLElement>('button[aria-label="Filters"]')!;

    filters.dispatchEvent(new MouseEvent('mouseenter'));

    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"] .bro-suid-tooltip')!;

    expect(tooltip.textContent).toBe('Show the filters');
    expect(filters.getAttribute('aria-describedby')).toBe(tooltip.id);

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

    expect(document.querySelector('.bro-suid-tooltip')).toBeNull();
    expect(filters.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('a table of the skin suid', () => {
  it('renders the components of SUID, and the paginator and the sort header of the vanilla skins', () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'suid', toolbarTitle: 'Orders'}});

    expect(table.querySelector('bro-suid-toolbar-main .MuiToolbar-root')).not.toBeNull();
    expect([...table.querySelectorAll('bro-suid-sort-header .bro-sort-header-content')].map(content => content.textContent!.trim())).toContain('Price');
    expect(table.querySelector('bro-suid-paginator .bro-paginator-navigation-next')).not.toBeNull();
    expect(table.querySelector('bro-suid-paginator bro-suid-dropdown .MuiSelect-select')).not.toBeNull();
  });

  it('shows the tooltips of the sort headers on the right and of the buttons of the paginator above, as the skin mat', async () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);

    // Twelve rows give the paginator a next page: a disabled button shows no tooltip, as in the paginator of mat
    const rows = Array.from({length: 12}, (_, i) => ({price: i}));

    table.configure({cols: [{name: 'price', title: 'Price', tooltip: 'The price of the order', dataType: 'number'}], rows, conf: {skin: 'suid', toolbarTitle: 'Orders'}});

    const header = table.querySelector<HTMLElement>('bro-suid-sort-header[sort-id="price"] [role="button"]')!;

    // A tooltip without room on its side goes to the other one, as the tooltip of mat: the column is at the right edge
    header.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.waitFor(() => expect(document.querySelector('.bro-suid-tooltip-popper')!.getAttribute('data-popper-placement')).toMatch(/^(right|left)$/));
    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe('The price of the order');
    header.dispatchEvent(new MouseEvent('mouseleave'));

    const next = table.querySelector<HTMLElement>('bro-suid-paginator .bro-paginator-navigation-next')!;

    // The paginator takes the length of the rows when the table renders them
    await vi.waitFor(() => expect(next.closest('.disabled')).toBeNull());
    next.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.waitFor(() => expect(document.querySelector('.bro-suid-tooltip-popper')!.getAttribute('data-popper-placement')).toMatch(/^(top|bottom)$/));
    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe(next.getAttribute('aria-label'));
  });

  it('keeps the tooltips of the paginator through a move in the DOM and takes them out of the body with the paginator', async () => {
    const table = document.createElement('table-bro');

    styles();
    document.body.append(table);
    table.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: Array.from({length: 12}, (_, i) => ({price: i})), conf: {skin: 'suid', toolbarTitle: 'Orders'}});

    const paginator = table.querySelector<HTMLElement>('bro-suid-paginator')!;
    const next = paginator.querySelector<HTMLElement>('.bro-paginator-navigation-next')!;

    await vi.waitFor(() => expect(next.closest('.disabled')).toBeNull());

    // A move connects the paginator again in the same task: its buttons keep their tooltips
    paginator.parentElement!.append(paginator);
    await Promise.resolve();
    next.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('.bro-suid-tooltip')!.textContent).toBe(next.getAttribute('aria-label'));

    // A table that takes new columns removes its paginator under the pointer, which gets no mouseleave
    paginator.remove();
    await Promise.resolve();
    expect(document.querySelector('.bro-suid-tooltip')).toBeNull();
  });

  it('renders its elements at once when Solid configures it in onMount', () => {
    const errors = vi.spyOn(console, 'error');
    const host = document.createElement('div');
    let table: TableBroHTMLElement | undefined;

    styles();
    document.body.append(host);

    const dispose = render(() => {
      onMount(() => table!.configure({cols: [{name: 'price', title: 'Price', dataType: 'number'}], rows: [{price: 1}, {price: 2}], conf: {skin: 'suid', toolbarTitle: 'Orders'}}));

      return createComponent(Dynamic, {component: 'table-bro', ref: (element: TableBroHTMLElement) => table = element});
    }, host);

    expect(table!.querySelector('bro-suid-toolbar-main .MuiToolbar-root')).toBeInstanceOf(HTMLElement);
    expect(table!.querySelector('bro-suid-paginator bro-suid-dropdown .MuiSelect-select')).toBeInstanceOf(HTMLElement);
    expect(errors).not.toHaveBeenCalled();

    dispose();
    errors.mockRestore();
  });
});

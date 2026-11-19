import {type BroButton, type BroConfiguredElement, BroDom, type BroDropdown, BroHTML, type BroResolvedConfig, events} from '@table-bro/core';

import {Button, Divider, Menu, MenuItem} from 'm3-svelte';
import {createRawSnippet}                from 'svelte';

import {BroM3SvelteElement, BroM3SvelteMarkup, type BroM3SvelteProps, iconHTML} from '../bro-m3-svelte-element';
import {attachM3SvelteTooltip}                                                  from '../m3-tooltip';

/** The space between the menu of the toolbar and its button, as the menus of Material 3. */
const menuSpace: number = 4;

/**
 * The toolbar of a table, the element bro-m3-svelte-toolbar-main: its title, its search and the buttons and the menu of the
 * config, in the top app bar of Material 3. The buttons are the icon buttons of M3 Svelte; the menu is the menu of M3
 * Svelte with its items in a popover, which closes on a click outside it and on Escape.
 */
export class BroM3SvelteToolbarMainComponent extends BroM3SvelteElement implements BroConfiguredElement {
  /** The config of the table: the name of the search button. */
  config?: BroResolvedConfig;

  /** Removes the tooltips of the buttons when the element leaves the DOM. */
  private releases: (() => void)[] = [];

  protected render(container: HTMLElement): void {
    const dom = new BroDom(this.ownerDocument);
    const toolbar = dom.createElement('div');
    // The table sets the buttons and the title before the element connects: the buttons as the JSON of the config
    const buttons: (BroButton | BroDropdown)[] = JSON.parse(this.getAttribute('buttons') ?? '[]');
    const dropdown = <BroDropdown | undefined>buttons.find(button => button.mode === 'navbar-dropdown');
    const send = (action: string) => this.emit(events.toolbarEvent, action);

    toolbar.className = 'bro-m3-svelte-toolbar';
    container.append(toolbar);

    // The hidden menu button keeps the place of the navigation icon of a top app bar before the title
    this.iconButton(toolbar, 'menu', {tabindex: -1, 'aria-hidden': 'true'}, 'bro-toolbar-placeholder');

    const title = dom.createElement('span');
    const space = dom.createElement('span');

    title.className = 'bro-toolbar-title';
    title.textContent = this.getAttribute('title');
    space.className = 'bro-toolbar-space';
    toolbar.append(title, space);

    this.iconButton(toolbar, 'search', {'aria-label': this.config?.texts.search, onclick: () => send(events.toolbarSearchOpenEvent)}, 'bro-toolbar-button-search');

    (<BroButton[]>buttons.filter(button => button.mode !== 'navbar-dropdown')).forEach(button => {
      const node = this.iconButton(toolbar, button.iconHTML ?? '', {'aria-label': button.buttonTitle, onclick: () => send(button.eventType)});

      this.releases.push(attachM3SvelteTooltip(node, () => button.buttonTooltip ?? '', {host: this}));
    });

    if (dropdown) {
      this.menu(toolbar, dropdown, send);
    }
  }

  protected refresh(): void {
    // The toolbar renders the title and the buttons of the config once: the table renders a new toolbar for a new config
  }

  protected override unmounted(): void {
    this.releases.forEach(release => release());
    this.releases = [];
  }

  /**
   * Mounts an icon button of M3 Svelte at the end of the toolbar.
   * @param toolbar - the node of the toolbar
   * @param icon - the name of the icon
   * @param props - the attributes and the click of the button
   * @param className - a class of the table for the button, as of the search button, which the table finds by it
   * @returns the node of the button
   */
  private iconButton(toolbar: HTMLElement, icon: string, props: BroM3SvelteProps, className?: string): HTMLElement {
    this.mountPart(Button, toolbar, {variant: 'text', iconType: 'full', ...props, children: new BroM3SvelteMarkup().of(iconHTML(icon))});

    // The button of M3 Svelte writes its own classes, which a class among the props would replace: the class of the
    // table goes to its node, and the classes of the button stay, since its variant, size and icon do not change
    const button = <HTMLElement>toolbar.lastElementChild;

    if (className) {
      button.classList.add(className);
    }

    return button;
  }

  /**
   * Mounts the menu of the toolbar: its icon button with the title of the menu as its name, and the menu of M3 Svelte
   * in a popover under it, with the items that send their values.
   * @param toolbar - the node of the toolbar
   * @param dropdown - the menu of the config, a button of toolbarMain.buttons with the mode navbar-dropdown
   * @param send - sends the value of an item
   */
  private menu(toolbar: HTMLElement, dropdown: BroDropdown, send: (action: string) => void): void {
    const popover = new BroDom(this.ownerDocument).createElement('div');

    popover.className = 'bro-m3-svelte-toolbar-menu';
    popover.popover = 'auto';

    const button = this.iconButton(toolbar, 'more_vert', {
      'aria-label': dropdown.buttonTitle,
      'aria-haspopup': 'menu',
      onclick: () => {
        popover.togglePopover();

        // The popover is out of the flow: its end edge takes the one of the button, under it
        const anchor = button.getBoundingClientRect();

        popover.style.left = `${anchor.right - popover.offsetWidth}px`;
        popover.style.top = `${anchor.bottom + menuSpace}px`;
      }
    });

    this.releases.push(attachM3SvelteTooltip(button, () => dropdown.buttonTooltip ?? '', {host: this}));
    toolbar.append(popover);

    // The menu holds a node of its own, which takes its items after it renders
    this.mountPart(Menu, popover, {children: createRawSnippet(() => ({render: () => '<div class="bro-m3-svelte-toolbar-menu-items" role="menu"></div>'}))});

    const items = <HTMLElement>popover.querySelector('.bro-m3-svelte-toolbar-menu-items');

    dropdown.options.forEach(option => {
      if (option.divider) {
        this.mountPart(Divider, items, {});

        return;
      }

      const label = `<span class="bro-m3-svelte-menu-item-label">${option.iconHTML ? iconHTML(option.iconHTML) : ''}${BroHTML.escape(option.title ?? '')}</span>`;

      this.mountPart(MenuItem, items, {
        onclick: () => {
          popover.hidePopover();
          send(option.value ?? '');
        },
        children: new BroM3SvelteMarkup().of(label)
      });
    });
  }
}

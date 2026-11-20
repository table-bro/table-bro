import {type BroButton, type BroConfiguredElement, type BroDropdown, type BroResolvedConfig, events} from '@table-bro/core';

import Divider                   from '@suid/material/Divider';
import Icon                      from '@suid/material/Icon';
import IconButton                from '@suid/material/IconButton';
import ListItemIcon              from '@suid/material/ListItemIcon';
import ListItemText              from '@suid/material/ListItemText';
import Menu                      from '@suid/material/Menu';
import MenuItem                  from '@suid/material/MenuItem';
import Toolbar                   from '@suid/material/Toolbar';
import {createSignal, onCleanup} from 'solid-js';

import {BroSuidElement, suid, tag} from '../bro-suid-element';
import {attachSuidTooltip}         from '../bro-suid-tooltip';

/**
 * Gives a button of the toolbar its tooltip above it, as the toolbar of the skin mat, while the button is rendered.
 * @param message - the tooltip of the button of the config
 */
function tooltipRef(message: string | undefined): (button: HTMLElement) => void {
  return button => onCleanup(attachSuidTooltip(button, message ?? ''));
}

/**
 * The text of the items of the menu: the label large text of Material 3, as the menu of mat, by the subtitle2 text of the
 * theme, 14px in the medium weight, on a line of 20px. The items of SUID have the body1 text of 16px.
 */
const menuItemText = {variant: 'subtitle2', sx: {lineHeight: '1.25rem'}} as const;

/**
 * The menu of the toolbar: an icon button with the title of the menu as its name, and the items of the menu of SUID
 * that send their values, and the tooltip of the button above it.
 * @param dropdown - the menu of the config, a button of toolbarMain.buttons with the mode navbar-dropdown
 * @param onAction - sends the value of an item
 */
function toolbarMenu(dropdown: BroDropdown, onAction: (action: string) => void) {
  const [anchor, setAnchor] = createSignal<HTMLElement | null>(null);

  const items = dropdown.options.map(option => option.divider
    ? suid(Divider, {})
    : suid(MenuItem, {
        onClick: () => {
          setAnchor(null);
          onAction(option.value ?? '');
        },
        children: [
          option.iconHTML ? suid(ListItemIcon, {children: suid(Icon, {children: option.iconHTML})}) : null,
          suid(ListItemText, {primaryTypographyProps: menuItemText, children: option.title})
        ]
      }));

  return [
    suid(IconButton, {
      ref: tooltipRef(dropdown.buttonTooltip),
      'aria-label': dropdown.buttonTitle,
      'aria-haspopup': 'menu',
      onClick: (event: MouseEvent) => setAnchor(<HTMLElement>event.currentTarget),
      children: suid(Icon, {children: 'more_vert'})
    }),
    suid(Menu, {
      get anchorEl() {
        return anchor();
      },
      get open() {
        return !!anchor();
      },
      onClose: () => setAnchor(null),
      children: items
    })
  ];
}

/**
 * The toolbar of a table, the element bro-suid-toolbar-main: its title, its search and the buttons and the menu of the
 * config, with the tooltips of the buttons of the config above them.
 */
export class BroSuidToolbarMainComponent extends BroSuidElement implements BroConfiguredElement {
  /** The config of the table: the name of the search button. */
  config?: BroResolvedConfig;

  protected content() {
    // The table sets the buttons and the title before the element connects: the buttons as the JSON of the config
    const buttons: (BroButton | BroDropdown)[] = JSON.parse(this.getAttribute('buttons') ?? '[]');
    const dropdown = <BroDropdown | undefined>buttons.find(button => button.mode === 'navbar-dropdown');
    const send = (action: string) => this.emit(events.toolbarEvent, action);

    const mainButtons = (<BroButton[]>buttons.filter(button => button.mode !== 'navbar-dropdown')).map(button => suid(IconButton, {
      ref: tooltipRef(button.buttonTooltip),
      'aria-label': button.buttonTitle,
      onClick: () => send(button.eventType),
      children: suid(Icon, {children: button.iconHTML})
    }));

    // The hidden menu button keeps the place of the navigation icon of a Material toolbar before the title
    return suid(Toolbar, {children: [
      suid(IconButton, {class: 'bro-toolbar-placeholder', tabIndex: -1, 'aria-hidden': true, children: suid(Icon, {children: 'menu'})}),
      tag('span', {class: 'bro-toolbar-title', children: this.getAttribute('title')}),
      tag('span', {class: 'bro-toolbar-space'}),
      suid(IconButton, {
        class: 'bro-toolbar-button-search',
        'aria-label': this.config?.texts.search,
        onClick: () => send(events.toolbarSearchOpenEvent),
        children: suid(Icon, {children: 'search'})
      }),
      mainButtons,
      dropdown ? toolbarMenu(dropdown, send) : null
    ]});
  }
}

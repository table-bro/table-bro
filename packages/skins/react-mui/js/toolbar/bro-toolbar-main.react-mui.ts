import {type BroButton, type BroConfiguredElement, type BroDropdown, type BroResolvedConfig, events} from '@table-bro/core';

import Divider                                        from '@mui/material/Divider';
import Icon                                           from '@mui/material/Icon';
import IconButton                                     from '@mui/material/IconButton';
import ListItemIcon                                   from '@mui/material/ListItemIcon';
import ListItemText                                   from '@mui/material/ListItemText';
import Menu                                           from '@mui/material/Menu';
import MenuItem                                       from '@mui/material/MenuItem';
import Toolbar                                        from '@mui/material/Toolbar';
import Tooltip                                        from '@mui/material/Tooltip';
import {createElement as h, type ReactNode, useState} from 'react';

import {BroMuiElement} from '../bro-mui-element';

/**
 * The menu of the toolbar: an icon button with the title of the menu as its name, and the items of the menu of MUI
 * that send their values.
 * @param props - the menu of the config and the function that sends the value of an item
 * @param props.dropdown - the menu of the config, a button of toolbarMain.buttons with the mode navbar-dropdown
 * @param props.onAction - sends the value of an item
 */
function BroMuiToolbarMenu({dropdown, onAction}: {dropdown: BroDropdown; onAction: (action: string) => void}): ReactNode {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const items = dropdown.options.map((option, i) => option.divider
    ? h(Divider, {key: i})
    : h(MenuItem, {
        key: i,
        onClick: () => {
          setAnchor(null);
          onAction(option.value ?? '');
        }
      }, option.iconHTML ? h(ListItemIcon, null, h(Icon, null, option.iconHTML)) : null, h(ListItemText, null, option.title)));

  return [
    h(Tooltip, {key: 'button', title: dropdown.buttonTooltip ?? '', placement: 'top',
      children: h(IconButton, {'aria-label': dropdown.buttonTitle, 'aria-haspopup': 'menu', onClick: event => setAnchor(event.currentTarget)}, h(Icon, null, 'more_vert'))}),
    h(Menu, {key: 'menu', anchorEl: anchor, open: !!anchor, onClose: () => setAnchor(null)}, items)
  ];
}

/**
 * The toolbar of a table, the element bro-mui-toolbar-main: its title, its search and the buttons and the menu of the
 * config.
 */
export class BroMuiToolbarMainComponent extends BroMuiElement implements BroConfiguredElement {
  /** The config of the table: the name of the search button. */
  config?: BroResolvedConfig;

  protected content() {
    // The table sets the buttons and the title before the element connects: the buttons as the JSON of the config
    const buttons: (BroButton | BroDropdown)[] = JSON.parse(this.getAttribute('buttons') ?? '[]');
    const dropdown = <BroDropdown | undefined>buttons.find(button => button.mode === 'navbar-dropdown');
    const send = (action: string) => this.emit(events.toolbarEvent, action);

    const mainButtons = (<BroButton[]>buttons.filter(button => button.mode !== 'navbar-dropdown')).map((button, i) => h(Tooltip, {
      key: i,
      title: button.buttonTooltip ?? '',
      placement: 'top',
      children: h(IconButton, {'aria-label': button.buttonTitle, onClick: () => send(button.eventType)}, h(Icon, null, button.iconHTML))
    }));

    // The hidden menu button keeps the place of the navigation icon of a Material toolbar before the title
    return h(Toolbar, null,
      h(IconButton, {className: 'bro-toolbar-placeholder', tabIndex: -1, 'aria-hidden': true}, h(Icon, null, 'menu')),
      h('span', {className: 'bro-toolbar-title'}, this.getAttribute('title')),
      h('span', {className: 'bro-toolbar-space'}),
      h(IconButton, {
        className: 'bro-toolbar-button-search',
        'aria-label': this.config?.texts.search,
        onClick: () => send(events.toolbarSearchOpenEvent)
      }, h(Icon, null, 'search')),
      mainButtons,
      dropdown ? h(BroMuiToolbarMenu, {dropdown, onAction: send}) : null);
  }
}

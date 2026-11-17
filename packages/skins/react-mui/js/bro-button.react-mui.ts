import Button               from '@mui/material/Button';
import Icon                 from '@mui/material/Icon';
import IconButton           from '@mui/material/IconButton';
import {createElement as h} from 'react';

import {BroMuiElement} from './bro-mui-element';

/**
 * The button of the skin, the element bro-mui-button with the attributes of BroButton: a text button of MUI with its
 * title, else an icon button named by the attribute label. The icon is the name of a ligature of Material Icons.
 */
export class BroMuiButtonComponent extends BroMuiElement {
  protected content() {
    const className = this.getAttribute('button-class') ?? undefined;
    const icon = this.getAttribute('icon');
    const title = this.getAttribute('button-title');
    const onClick = () => this.emit('action', this.getAttribute('event-type') ?? '');

    if (title) {
      // The icon of a text button is its start icon, at the space of Material from the title
      return h(Button, {className, type: 'button', startIcon: icon ? h(Icon, null, icon) : undefined, onClick}, title);
    }

    // The name of a button without a title: the table gives it as the attribute label, not aria-label on the element
    return icon ? h(IconButton, {className, type: 'button', 'aria-label': this.getAttribute('label') ?? undefined, onClick}, h(Icon, null, icon)) : null;
  }
}

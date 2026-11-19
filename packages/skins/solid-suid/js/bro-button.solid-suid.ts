import Button     from '@suid/material/Button';
import Icon       from '@suid/material/Icon';
import IconButton from '@suid/material/IconButton';

import {BroSuidElement, suid} from './bro-suid-element';

/**
 * The button of the skin, the element bro-suid-button with the attributes of BroButton: a text button of SUID with its
 * title, else an icon button named by the attribute label. The icon is the name of a ligature of Material Icons.
 */
export class BroSuidButtonComponent extends BroSuidElement {
  protected content() {
    const className = this.getAttribute('button-class') ?? undefined;
    const icon = this.getAttribute('icon');
    const title = this.getAttribute('button-title');
    const onClick = () => this.emit('action', this.getAttribute('event-type') ?? '');

    if (title) {
      // The icon of a text button is its start icon, at the space of Material from the title
      return suid(Button, {class: className, type: 'button', startIcon: icon ? suid(Icon, {children: icon}) : undefined, onClick, children: title});
    }

    // The name of a button without a title: the table gives it as the attribute label, not aria-label on the element
    return icon ? suid(IconButton, {class: className, type: 'button', 'aria-label': this.getAttribute('label') ?? undefined, onClick, children: suid(Icon, {children: icon})}) : null;
  }
}

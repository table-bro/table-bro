import {h}    from 'vue';
import {VBtn} from 'vuetify/components/VBtn';

import {BroVuetifyElement, icon} from './bro-vuetify-element';

/**
 * The button of the skin, the element bro-vuetify-button with the attributes of BroButton: a text button of Vuetify
 * with its title, else an icon button named by the attribute label. The icon is the name of a ligature of Material
 * Icons.
 */
export class BroVuetifyButtonComponent extends BroVuetifyElement {
  protected content() {
    const className = this.getAttribute('button-class') ?? undefined;
    const name = this.getAttribute('icon');
    const title = this.getAttribute('button-title');
    const onClick = () => this.emit('action', this.getAttribute('event-type') ?? '');

    if (title) {
      // The icon of a text button comes before its title, at the space of Vuetify
      return h(VBtn, {class: className, type: 'button', variant: 'text', onClick}, {
        prepend: name ? () => icon(name) : undefined,
        default: () => title
      });
    }

    // The name of a button without a title: the table gives it as the attribute label, not aria-label on the element.
    // An icon button is in a toolbar, as the close button of the filter drawer: an empty color, not the default color of
    // the application, as the buttons of a toolbar of Vuetify, whose defaults it does not take in a root of its own; the
    // skin gives its icon the color of the icons
    return name ? h(VBtn, {class: className, type: 'button', icon: true, variant: 'text', color: '', 'aria-label': this.getAttribute('label') ?? undefined, onClick}, () => icon(name)) : null;
  }
}

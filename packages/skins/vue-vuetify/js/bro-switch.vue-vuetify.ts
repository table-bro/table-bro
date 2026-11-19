import type {BroCellElement, BroCol, BroRow} from '@table-bro/core';

import {type Component, h} from 'vue';
import {VSwitch}           from 'vuetify/components/VSwitch';

import {BroVuetifyElement} from './bro-vuetify-element';

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name in the event action, which the
 * table turns into bro-action with the column and the row (event: 'action' of the column); the title of the column
 * names the switch for screen readers.
 */
export class BroVuetifySwitchComponent extends BroVuetifyElement implements BroCellElement {
  col?: BroCol;
  row?: BroRow;

  /** The state of the switch, which turns at once, as the slide toggle of the skin mat. */
  private checked: boolean | null = null;

  protected content() {
    const name = this.col?.name;
    const action = this.getAttribute('name');

    this.checked ??= !!(name && this.row?.[name]);

    // The inset switch of Vuetify is the switch of Material 3; the application changes the row by the action. The
    // generic types of the switch fit no overload of h(), which takes it as a component
    return h(<Component>VSwitch, {
      modelValue: this.checked,
      'aria-label': this.col?.title,
      color: 'primary',
      density: 'compact',
      hideDetails: true,
      inset: true,
      'onUpdate:modelValue': (checked: boolean | null) => {
        this.checked = !!checked;
        this.update();

        if (action) {
          this.emit('action', action);
        }
      }
    });
  }
}

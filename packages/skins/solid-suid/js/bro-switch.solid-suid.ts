import type {BroCellElement, BroCol, BroRow} from '@table-bro/core';

import Switch from '@suid/material/Switch';

import {BroSuidElement, suid} from './bro-suid-element';

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name in the event action, which the
 * table turns into bro-action with the column and the row (event: 'action' of the column); the title of the column
 * names the switch for screen readers.
 */
export class BroSuidSwitchComponent extends BroSuidElement implements BroCellElement {
  col?: BroCol;
  row?: BroRow;

  protected content() {
    const name = this.col?.name;
    const action = this.getAttribute('name');

    // The switch turns at once, as the slide toggle of the skin mat: the application changes the row by the action
    return suid(Switch, {
      defaultChecked: !!(name && this.row?.[name]),
      inputProps: {'aria-label': this.col?.title},
      onChange: () => {
        if (action) {
          this.emit('action', action);
        }
      }
    });
  }
}

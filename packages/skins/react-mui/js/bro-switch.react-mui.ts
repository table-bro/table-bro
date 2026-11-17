import type {BroCellElement, BroCol, BroRow} from '@table-bro/core';

import Switch               from '@mui/material/Switch';
import {createElement as h} from 'react';

import {BroMuiElement} from './bro-mui-element';

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name in the event action, which the
 * table turns into bro-action with the column and the row (event: 'action' of the column); the title of the column
 * names the switch for screen readers.
 */
export class BroMuiSwitchComponent extends BroMuiElement implements BroCellElement {
  col?: BroCol;
  row?: BroRow;

  protected content() {
    const name = this.col?.name;
    const action = this.getAttribute('name');

    // The switch turns at once, as the slide toggle of the skin mat: the application changes the row by the action
    return h(Switch, {
      defaultChecked: !!(name && this.row?.[name]),
      slotProps: {input: {'aria-label': this.col?.title}},
      onChange: () => {
        if (action) {
          this.emit('action', action);
        }
      }
    });
  }
}

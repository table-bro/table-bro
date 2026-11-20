import {type BroCellElement, type BroCol, BroDom, type BroRow} from '@table-bro/core';

import {Switch} from 'm3-svelte';

import {BroM3SvelteElement, type BroM3SveltePart, type BroM3SvelteProps} from './bro-m3-svelte-element';

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name in the event action, which the
 * table turns into bro-action with the column and the row (event: 'action' of the column); the title of the column
 * names the switch for screen readers.
 */
export class BroM3SvelteSwitchComponent extends BroM3SvelteElement implements BroCellElement {
  col?: BroCol;
  row?: BroRow;

  private input: BroM3SveltePart | null = null;

  protected render(container: HTMLElement): void {
    // The switch of M3 Svelte is a checkbox in a label, which takes the clicks on its track
    const label = new BroDom(this.ownerDocument).createElement('label');

    label.className = 'bro-m3-svelte-switch';
    container.append(label);

    this.input = this.mountPart(Switch, label, this.props());
  }

  protected refresh(): void {
    this.input?.set(this.props());
  }

  protected override unmounted(): void {
    this.input = null;
  }

  /** The props of the switch from the column and the row. */
  private props(): BroM3SvelteProps {
    const name = this.col?.name;
    const action = this.getAttribute('name');

    // The switch turns at once, as the slide toggle of the skin mat: the application changes the row by the action. Its
    // handle has no icon, as the slide toggle with hideIcon of the skin mat
    return {
      checked: !!(name && this.row?.[name]),
      icons: 'none',
      'aria-label': this.col?.title,
      onchange: () => {
        if (action) {
          this.emit('action', action);
        }
      }
    };
  }
}

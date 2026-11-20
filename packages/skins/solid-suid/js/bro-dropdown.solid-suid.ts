import type {BroDropdownOption} from '@table-bro/core';

import MenuItem                         from '@suid/material/MenuItem';
import Select, {type SelectChangeEvent} from '@suid/material/Select';
import {createSignal}                   from 'solid-js';
import {isServer}                       from 'solid-js/web';

import {BroSuidElement, suid, tag} from './bro-suid-element';

/**
 * The list of the page sizes of the paginator, the element bro-suid-dropdown with the attributes of BroDropdown in the
 * mode select: the select of SUID without an underline, as in the table pagination of MUI. A choice sends the event
 * value with the value of the item, which the paginator of the skin takes as its page size. The select of the menu of
 * SUID 0.19 fails in the server render of Solid, so the server renders the native select of SUID, with the same value
 * and look, which the browser replaces.
 */
export class BroSuidDropdownComponent extends BroSuidElement {
  static get observedAttributes(): string[] {
    return ['disabled'];
  }

  /** The paginator turns the list off and on with its own state. */
  attributeChangedCallback(): void {
    this.update();
  }

  protected content() {
    const options: BroDropdownOption[] = JSON.parse(this.getAttribute('options') ?? '[]');
    const [value, setValue] = createSignal(this.getAttribute('button-title') ?? '');
    const disabled = () => this.attribute('disabled') === 'true';

    return suid(Select, {
      native: isServer,
      variant: <const>'standard',
      disableUnderline: true,
      get value() {
        return value();
      },
      get disabled() {
        return disabled();
      },
      inputProps: {'aria-label': this.getAttribute('label') ?? undefined},
      onChange: (event: SelectChangeEvent<string>) => {
        setValue(event.target.value);
        this.emit('value', event.target.value);
      },
      // A getter, as the JSX of Solid gives children: the select reads the values and the titles of its items from it
      get children() {
        return options.map(option => isServer
          ? tag('option', {value: option.value, children: option.title})
          : suid(MenuItem, {value: option.value, children: option.title}));
      }
    });
  }
}

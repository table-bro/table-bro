import {type BroConfiguredElement, type BroDropdown, type BroDropdownOption, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroView} from '@table-bro/core';

const {escape} = BroHTML;

export class BroNativeDropdownComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroDropdown {
  template(): string {
    this.buttonTitle = this.getAttribute('button-title') || '';
    this.name = this.getAttribute('name') || 'action';
    this.mode = <BroDropdown['mode']>this.getAttribute('mode') || 'dropdown';

    try {
      this.options = JSON.parse(<string>this.getAttribute('options'));
    } catch (err) {
      this.options = [];

      if (this.config.debug) {
        console.log(err);
      }
    }

    // The select takes the name that the element gets, such as the label of the page size, else its title, as More
    const label = this.getAttribute('label') || this.buttonTitle;
    // The titles, the values and the names of the config are text in the markup
    const ariaLabel = label ? ` aria-label="${escape(label)}"` : '';

    if (this.mode === 'select' || this.mode === 'dropdown') {
      return `
        <select name="${escape(this.name)}"${ariaLabel}>
          <option value="" hidden>${escape(this.buttonTitle)}</option>
          ${this.templateDropdown(this.options)}
        </select>`;
    } else {
      // navbar-dropdown
      return `
        <li class="bro-nav-item bro-dropdown">
          <select name="${escape(this.name)}"${ariaLabel}>
            <option value="" hidden>${escape(this.buttonTitle)}</option>
            ${this.templateDropdown(this.options)}
          </select>
        </li>`;
    }
  }

  static get observedAttributes() {
    return [
      'disabled'
    ];
  }

  config!: BroResolvedConfig;

  buttonTitle!: string;
  name!: string;

  mode!: BroDropdown['mode'];
  options!: BroDropdownOption[];

  private eventName = 'value';

  private dropdownToggleEl!: HTMLElement;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  /**
   * The select sends its value. A menu (navbar-dropdown) shows its title again after a choice, and acts only on a choice:
   * the keys of a closed select change its value on Windows, so a value that came from the keyboard waits for Enter.
   */
  events() {
    const select = <HTMLSelectElement>this.querySelector('select');
    const menu = (this.mode === 'navbar-dropdown');

    let keyboard = false;
    let pending: string | null = null;

    this.dropdownToggleEl = select;
    this.renderDisabled();

    const send = (value: string) => {
      pending = null;

      if (menu) {
        select.selectedIndex = 0;
      }

      this.dispatchEvent(
        new CustomEvent(this.eventName, {
          bubbles: true,
          composed: true,
          detail: value
        })
      );
    };

    if (menu) {
      select.addEventListener('pointerdown', () => {
        keyboard = false;
      });

      select.addEventListener('keydown', (event: KeyboardEvent) => {
        keyboard = (event.key !== 'Enter');

        if (event.key === 'Enter' && pending !== null) {
          send(pending);
        }
      });

      // A value that the keyboard chose and did not confirm leaves with the focus
      select.addEventListener('blur', () => {
        if (pending !== null) {
          pending = null;
          select.selectedIndex = 0;
        }
      });
    }

    select.addEventListener('change', () => {
      if (menu && keyboard) {
        pending = select.value;
      } else {
        send(select.value);
      }
    });
  }

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    this.events();
  }

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }

  attributeChangedCallback(name: string) {
    // Before its render the element has no select: the render takes the attribute
    if (name === 'disabled' && this.dropdownToggleEl) {
      this.renderDisabled();
    }
  }

  private templateDropdown(options: BroDropdownOption[]): string {
    return `
      ${options.map((option: BroDropdownOption) => {
        if ('value' in option && 'title' in option) {
          return `
             <option value="${escape(option.value)}">${escape(option.title)}</option>`;
        } else if ('divider' in option) {
          return `
            <hr>`;
        } else if ('header' in option) {
          return `
            <optgroup label="${escape(option.header)}"></optgroup>`;
        }
      }).join('')}`;
  }

  /** The select is disabled by the attribute disabled="true". */
  private renderDisabled(): void {
    this.dropdownToggleEl.toggleAttribute('disabled', this.getAttribute('disabled') === 'true');
  }
}

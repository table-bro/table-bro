import {type BroConfiguredElement, type BroDropdown, type BroDropdownOption, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroView} from '@table-bro/core';

import {bootstrapClasses} from './bootstrap-classes';

const {escape} = BroHTML;

export class BroBootstrapDropdownComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroDropdown {
  template(): string {
    this.buttonTitle = this.getAttribute('button-title') || '';
    this.buttonClassName = this.getAttribute('button-class') || this.config.components.dropdown?.css?.button.className || '';
    this.label = this.getAttribute('label') || '';
    this.mode = <BroDropdown['mode']>this.getAttribute('mode') || 'dropdown';

    try {
      this.options = JSON.parse(<string>this.getAttribute('options'));
    } catch (err) {
      this.options = [];

      if (this.config.debug) {
        console.log(err);
      }
    }

    // The titles and the values of the config are text in the markup

    if (this.mode === 'select' || this.mode === 'dropdown') {
      return `
        <div class="dropdown">
          <button class="btn ${escape(this.buttonClassName)} dropdown-toggle" type="button"
                  data-bs-toggle="dropdown" aria-expanded="false">
            ${escape(this.buttonTitle)}
          </button>

          ${this.templateDropdown(this.options)}
        </div>`;
    } else if (this.mode === 'navbar-dropdown') {
      return `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href=""
             role="button" data-bs-toggle="dropdown" aria-expanded="false">
            ${escape(this.buttonTitle)}
          </a>

          ${this.templateDropdown(this.options)}
        </li>`;
    }

    return '';
  }

  static get observedAttributes() {
    return [
      'disabled'
    ];
  }

  config!: BroResolvedConfig;

  buttonClassName!: string | null;
  buttonTitle!: string;
  label!: string;

  mode!: BroDropdown['mode'];
  options!: BroDropdownOption[];

  private eventName = 'value';

  private bsDropdown?: {dispose(): void};
  private disabledTimer?: number;
  private dropdownToggleEl!: HTMLElement;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events() {
    const dropdownMenuEl = <HTMLElement>this.querySelector('.dropdown-menu');

    dropdownMenuEl.addEventListener('click', (event: Event) => {
      event.preventDefault();

      const value = (<HTMLElement>event.target)?.getAttribute('data-value');

      if (this.mode === 'select') {
        this.dropdownToggleEl.innerText = this.options.find(option => option.value === value)?.title ?? '';
        this.renderName();
      }

      this.dispatchEvent(
        new CustomEvent(this.eventName, {
          bubbles: true,
          composed: true,
          detail: value
        })
      );
    });
  }

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    this.dropdownToggleEl = <HTMLElement>this.querySelector('.dropdown-toggle');
    this.bsDropdown = new (bootstrapClasses().Dropdown)(this.dropdownToggleEl);

    this.renderName();
    this.events();
  }

  connectedCallback(): void {
    if (this.rendered) {
      // Connected again after its removal: Bootstrap gets the toggle back
      if (!this.bsDropdown) {
        this.bsDropdown = new (bootstrapClasses().Dropdown)(this.dropdownToggleEl);
      }

      return;
    }

    this.rendered = true;

    this.render();
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task; only a removed element releases Bootstrap
    queueMicrotask(() => {
      if (!this.isConnected) {
        clearTimeout(this.disabledTimer);

        this.bsDropdown?.dispose();
        this.bsDropdown = undefined;
      }
    });
  }

  attributeChangedCallback(name: string, previousValue: string, currentValue: string) {
    if (name === 'disabled') {
      clearTimeout(this.disabledTimer);

      this.disabledTimer = window.setTimeout(() => { // postpone to the next event loop after `bootstrap.Dropdown`-updates
        if (currentValue === 'true') {
          this.dropdownToggleEl.setAttribute('disabled', currentValue);
        } else {
          this.dropdownToggleEl.removeAttribute('disabled');
        }
      });
    }
  }

  private templateDropdown(options: BroDropdownOption[]): string {
    return `
      <ul class="dropdown-menu">
        ${options.map((option: BroDropdownOption) => {
          if ('value' in option && 'title' in option) {
            return `
              <li>
                 <a class="dropdown-item" href=""
                    data-value="${escape(option.value)}">${escape(option.title)}</a>
              </li>`;
          } else if ('divider' in option) {
            return `
              <li>
                 <hr class="dropdown-divider">
              </li>`;
          } else if ('header' in option) {
            return `
              <li>
                 <h6 class="dropdown-header">${escape(option.header)}</h6>
              </li>`;
          }
        }).join('')}
      </ul>`;
  }

  /**
   * A list with a label says it with the value that it shows, as a select does: Items per page: 5. Without a label the
   * toggle takes its name from its title.
   */
  private renderName(): void {
    if (this.label) {
      this.dropdownToggleEl.setAttribute('aria-label', `${this.label} ${this.dropdownToggleEl.textContent?.trim() ?? ''}`);
    }
  }
}

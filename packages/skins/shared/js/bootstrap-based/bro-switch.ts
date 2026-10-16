import {type BroCol, type BroConfiguredElement, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroSkinComponents, type BroView} from '@table-bro/core';

const {escape} = BroHTML;

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name, as the event action that the table
 * turns into bro-action with the column and the row (event: 'action' of the column); the title of the column names
 * the switch for screen readers.
 */
export class BroSwitchComponent extends BroHTMLElement implements BroView, BroConfiguredElement {
  template(): string {
    this.css = this.config.components.switch?.css;

    this.checked = this.getAttribute('checked');

    const checked = (this.checked === 'true');

    return `
      <div ${this.css ? `class="${escape(this.css.div.className)}"` : ''}>
        <input type="checkbox"
               ${this.css ? `class="${escape(this.css.div.input.className)}"` : ''}
               role="switch"
               ${checked ? ' checked' : ''}>
      </div>`;
  }

  config!: BroResolvedConfig;
  /** The column of the cell, which the table sets. */
  col?: BroCol;

  checked!: string | null;

  private css: NonNullable<BroSkinComponents['switch']>['css'];
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events() {
    const input = <HTMLInputElement>this.querySelector('input');
    const name = this.getAttribute('name');

    input.setAttribute('aria-label', this.col?.title ?? '');

    input.addEventListener('change', () => {
      if (name) {
        this.dispatchEvent(new CustomEvent('action', {detail: name}));
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
}

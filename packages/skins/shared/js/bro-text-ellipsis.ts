import {type BroCellElement, broCellSelectors, type BroCol, type BroConfiguredElement, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroRow, type BroTextEllipsis, type BroView} from '@table-bro/core';

const {escape, text} = BroHTML;

export class BroTextEllipsisComponent extends BroHTMLElement implements BroView, BroCellElement, BroConfiguredElement, BroTextEllipsis {
  template(): string {
    this.containerClassName = this.getAttribute('container-class');
    this.value = this.getAttribute('value') || '';

    return `
      <span class="${broCellSelectors.ellipsisContainer}${this.containerClassName ? ` ${escape(this.containerClassName)}` : ''}">
        <span class="${broCellSelectors.ellipsis}"></span>
      </span>`;
  }

  row?: BroRow;
  col?: BroCol;
  // The table sets the config before the element connects
  config!: BroResolvedConfig;

  containerClassName!: string | null;
  tooltip!: string;
  value!: string;

  /** Cleanup returned by afterRender of the skin, for example the removal of a tooltip. */
  private release?: void | (() => void);
  private released: boolean = false;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    const valueEl = <Element>this.querySelector(`.${broCellSelectors.ellipsis}`);

    // The value is markup only for a column with html: true
    if (this.col?.html) {
      valueEl.innerHTML = this.value;
      this.tooltip = text(this.value);
    } else {
      valueEl.textContent = this.value;
      this.tooltip = this.value;
    }

    this.afterRender();
  }

  connectedCallback(): void {
    if (this.rendered) {
      if (this.released) {
        this.released = false;

        this.afterRender();
      }

      return;
    }

    this.rendered = true;

    this.render();
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task; only a removed element releases the skin callback
    queueMicrotask(() => {
      if (!this.isConnected) {
        if (typeof this.release === 'function') {
          this.release();
        }

        this.release = undefined;
        this.released = true;
      }
    });
  }

  private afterRender(): void {
    const tooltipEl = this.children[0];

    if (this.config.components.textEllipsis.afterRender) {
      this.release = this.config.components.textEllipsis.afterRender(tooltipEl, this.tooltip);
    }
  }
}

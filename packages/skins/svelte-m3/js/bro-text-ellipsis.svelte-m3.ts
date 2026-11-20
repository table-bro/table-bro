import {type BroCellElement, broCellSelectors, type BroCol, BroDom, BroHTML, BroHTMLElement} from '@table-bro/core';

import {attachM3SvelteTooltip} from './m3-tooltip';

/**
 * A value wider than its column, with the whole value in the plain tooltip of Material 3: the element
 * bro-m3-svelte-text-ellipsis of BroTextEllipsis. It has no component of M3 Svelte, so it renders plain nodes.
 */
export class BroM3SvelteTextEllipsisComponent extends BroHTMLElement implements BroCellElement {
  /** The column of the cell: with html: true the value is markup. */
  col?: BroCol;

  /** Removes the tooltip when the element leaves the DOM. */
  private release: (() => void) | null = null;

  connectedCallback(): void {
    if (!this.firstChild) {
      this.render();
    }

    this.release ??= attachM3SvelteTooltip(<HTMLElement>this.firstElementChild, () => this.tooltip(), {host: this});
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task: only a removed element drops its tooltip
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.release?.();
        this.release = null;
      }
    });
  }

  /** The whole value of the cell as text. */
  private tooltip(): string {
    const value = this.getAttribute('value') ?? '';

    return this.col?.html ? BroHTML.text(value) : value;
  }

  /** Renders the value in the ellipsis of the cell. */
  private render(): void {
    const dom = new BroDom(this.ownerDocument);
    const container = dom.createElement('span');
    const text = dom.createElement('span');
    const value = this.getAttribute('value') ?? '';
    const containerClass = this.getAttribute('container-class');

    container.className = containerClass ? `${broCellSelectors.ellipsisContainer} ${containerClass}` : broCellSelectors.ellipsisContainer;
    text.className = broCellSelectors.ellipsis;

    if (this.col?.html) {
      text.innerHTML = value;
    } else {
      text.textContent = value;
    }

    container.append(text);
    this.append(container);
  }
}

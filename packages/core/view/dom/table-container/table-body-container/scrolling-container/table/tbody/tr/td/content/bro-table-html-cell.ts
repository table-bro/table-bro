import {BroHTMLElement}                                                               from '../../../../../../../../../../shared/html';
import type {BroCellElement, BroCol, BroConfiguredElement, BroResolvedConfig, BroRow} from '../../../../../../../../../../types/table-bro';
import type {BroView}                                                                 from '../../../../../../../../../../types/view';

export class BroTableHTMLCellComponent extends BroHTMLElement implements BroView, BroCellElement, BroConfiguredElement {
  template(): string {
    this.value = this.getAttribute('value') || '';

    return `<div>${this.value}</div>`;
  }

  row?: BroRow;
  col?: BroCol;
  config?: BroResolvedConfig;

  value!: string;

  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());
  }

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }
}

import {appObject}                                 from '../../../../../shared/app-objects';
import {BroHTML, classAttr, createComponent}       from '../../../../../shared/html';
import type {BroContext}                           from '../../../../../types/context';
import type {BroCol, BroRow, BroRowDetailsElement} from '../../../../../types/table-bro';
import type {BroView}                              from '../../../../../types/view';

const {createElement, escape} = BroHTML;

export class BroTdDetails implements BroView {
  template(col: BroCol) {
    return `
      <td ${classAttr(this.ctx.config.css.table?.tbody?.tr?.td?.className)} role="cell"
        ${col.colSpan ? `colspan="${escape(col.colSpan)}"` : ''}>
      </td>`;
  }

  static createDetails(selector: string, row: BroRow, server: boolean): HTMLElement {
    const details = createComponent<HTMLElement & BroRowDetailsElement>(selector);

    details.row = appObject(row);
    details.setAttribute('server', JSON.stringify(server));

    return details;
  }

  constructor(protected readonly ctx: BroContext,
              private col: BroCol,
              private row: BroRow) {
  }

  render(details?: HTMLElement) {
    const td = createElement(this.template(this.col));
    // The table opens the details by the height of its own element: the paddings and borders of the details stay inside it
    const container = document.createElement('div');

    td.appendChild(container);

    if (!details) {
      details = BroTdDetails.createDetails(<string>this.ctx.config.rowDetailsComponent, this.row, !!this.ctx.config.rowDetailsServer);

      container.appendChild(details);
    }

    return td;
  }
}

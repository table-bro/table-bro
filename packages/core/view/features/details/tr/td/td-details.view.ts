import {appObject}                                 from '../../../../../shared/app-objects';
import type {BroDom}                               from '../../../../../shared/dom';
import {BroHTML, classAttr}                        from '../../../../../shared/html';
import type {BroContext}                           from '../../../../../types/context';
import type {BroCol, BroRow, BroRowDetailsElement} from '../../../../../types/table-bro';
import type {BroView}                              from '../../../../../types/view';

const {escape} = BroHTML;

export class BroTdDetails implements BroView {
  template(col: BroCol) {
    return `
      <td ${classAttr(this.ctx.config.css.table?.tbody?.tr?.td?.className)} role="cell"
        ${col.colSpan ? `colspan="${escape(col.colSpan)}"` : ''}>
      </td>`;
  }

  static createDetails(selector: string, row: BroRow, server: boolean, dom: BroDom): HTMLElement {
    const details = dom.createElement<BroRowDetailsElement>(selector);

    details.row = appObject(row);
    details.setAttribute('server', JSON.stringify(server));

    return details;
  }

  constructor(protected readonly ctx: BroContext,
              private col: BroCol,
              private row: BroRow) {
  }

  render(details?: HTMLElement) {
    const td = this.ctx.dom.createFromHTML(this.template(this.col));
    // The table opens the details by the height of its own element: the paddings and borders of the details stay inside it
    const container = this.ctx.dom.createElement('div');

    td.appendChild(container);

    if (!details) {
      details = BroTdDetails.createDetails(<string>this.ctx.config.rowDetailsComponent, this.row, !!this.ctx.config.rowDetailsServer, this.ctx.dom);

      container.appendChild(details);
    }

    return td;
  }
}

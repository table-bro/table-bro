import {classAttr}       from '../../../../../../../../shared/html';
import type {BroContext} from '../../../../../../../../types/context';
import type {BroCol}     from '../../../../../../../../types/table-bro';
import type {BroView}    from '../../../../../../../../types/view';
import {BroTheadTh}      from './th/th.view';

export class BroTheadTr implements BroView {
  template(): string {
    return `
      <tr ${classAttr(this.ctx.config.css.table?.thead?.tr?.className)} role="row"></tr>`;
  }

  /**
   * @param ctx - the context of the table
   * @param cols - the columns of the row
   * @param header - the header row of the table, not an aux one: the records of the columns keep its sort headers
   */
  constructor(protected readonly ctx: BroContext,
              private cols: BroCol[],
              private readonly header?: boolean) {
  }

  render(): HTMLElement {
    const tr = this.ctx.dom.createFromHTML(this.template());

    // The header row is the first row of the table for screen readers
    if (this.header) {
      tr.setAttribute('aria-rowindex', '1');
    }

    // A header row has a cell for every column, in their order: the full titles, the short ones or the tooltips
    this.cols.forEach((col, i) => {
      tr.appendChild(
        new BroTheadTh(this.ctx, col, this.ctx.columns[i], this.header).render()
      );
    });

    return tr;
  }
}

import {type BroValueWidths, emptyRow} from '../../../../../../../../model/row-slots';
import type {BroFrame}                 from '../../../../../../../../shared/frame';
import {BroHTML, classAttr}            from '../../../../../../../../shared/html';
import {cssRowsHeight}                 from '../../../../../../../../shared/styles';
import {selectors}                     from '../../../../../../../../table-bro-selectors';
import type {BroContext}               from '../../../../../../../../types/context';
import type {BroCol, BroRow}           from '../../../../../../../../types/table-bro';
import type {BroView}                  from '../../../../../../../../types/view';
import {BroTd}                         from './td/td.view';

const {createElement} = BroHTML;

export class BroTbodyTr implements BroView {
  template(dataRowNumber?: number): string {
    // A row counts after the header row for screen readers, which see only the rows of the page; an empty row is no row for them
    return `
      <tr ${classAttr(this.ctx.config.css.table?.tbody?.tr?.className)} role="row"
        ${dataRowNumber ? `${selectors.rowNumberAttribute}="${dataRowNumber}" aria-rowindex="${dataRowNumber + 1}"` : ''}
        ${this.row === emptyRow ? 'aria-hidden="true"' : ''}></tr>`;
  }

  /**
   * @param ctx - the context of the table
   * @param cols - the columns of the row
   * @param row - the row, or null for the row of a state: one cell across the columns
   * @param valueWidths - the widths of the values of the row from its slot, for the cells that measure their values
   */
  constructor(protected readonly ctx: BroContext,
              private readonly cols: BroCol[],
              private row: BroRow | null,
              private readonly valueWidths?: BroValueWidths) {
  }

  /**
   * @param dataRowNumber - the position of the row in the displayed rows, from 1; an empty row has none
   * @param height - the height of the row; without it the row height of the skin
   * @param frame - the frame of the update, in which the cells of the body table measure their values
   */
  render(dataRowNumber?: number, height?: number, frame?: BroFrame): HTMLElement {
    const tr = createElement(
      this.template(dataRowNumber)
    );

    // A style attribute in the markup breaks a Content Security Policy without 'unsafe-inline'; a property of style does not.
    // The prerender renders only the row of its loading state, of the height of the page, in CSS
    tr.style.height = this.ctx.config.prerender ? cssRowsHeight(this.ctx.state.pagination.pageSize, false) : `${height || this.ctx.styles.rowHeight}px`;

    const row = this.row;

    if (row) {
      // The rows of the table columns get the classes and the keys of the columns; the aux rows of the details have one cell of their own
      const columns = (this.cols === this.ctx.cols) ? this.ctx.columns : null;

      this.cols.forEach((col, i) => {
        tr.appendChild(
          new BroTd(this.ctx, col, row, columns?.[i], this.valueWidths).render(frame)
        );
      });
    } else {
      const emptyCol: BroCol = {
        title: '',
        colSpan: this.cols.length
      };

      tr.appendChild(
        new BroTd(this.ctx, emptyCol, {}).render()
      );
    }

    return tr;
  }
}

import type {BroColumnModel}           from '../../../../../../../../../model/columns';
import {type BroValueWidths, emptyRow} from '../../../../../../../../../model/row-slots';
import type {BroFrame}                 from '../../../../../../../../../shared/frame';
import {BroHTML, classAttr}            from '../../../../../../../../../shared/html';
import {selectors}                     from '../../../../../../../../../table-bro-selectors';
import type {BroContext}               from '../../../../../../../../../types/context';
import type {BroCol, BroRow}           from '../../../../../../../../../types/table-bro';
import type {BroView}                  from '../../../../../../../../../types/view';
import {BroTdContent}                  from './content/td-content.view';

const {createElement, escape} = BroHTML;

export class BroTd implements BroView {
  template(col: BroCol) {
    return `
      <td ${classAttr(this.ctx.config.css.table?.tbody?.tr?.td?.className, col.className)} role="cell"
        ${col.colSpan ? `colspan="${escape(col.colSpan)}"` : ''}>
      </td>`;
  }

  /**
   * @param ctx - the context of the table
   * @param col - the column of the application
   * @param row - the row of the cell
   * @param column - the record of the column, which gives the cell its class and its key; the cells of the aux rows have none
   * @param valueWidths - the widths of the values of the row, for a cell that measures its value
   */
  constructor(protected readonly ctx: BroContext,
              private col: BroCol,
              private row: BroRow,
              private readonly column?: BroColumnModel,
              private readonly valueWidths?: BroValueWidths) {
  }

  render(frame?: BroFrame): HTMLElement {
    const td = createElement(this.template(this.col));

    if (this.column) {
      td.classList.add(this.column.className);
      td.setAttribute(selectors.columnKeyAttribute, this.column.key);
    }

    if (this.row === emptyRow) {
      td.classList.add(selectors.tableCellEmpty);
    }

    const tdContent: Node = new BroTdContent(this.ctx, this.col, this.row, this.column, this.valueWidths).render(frame);

    td.appendChild(tdContent);

    return td;
  }
}

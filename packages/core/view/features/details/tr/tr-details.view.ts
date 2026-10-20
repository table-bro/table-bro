import {BroHTML}                     from '../../../../shared/html';
import {selectors}                   from '../../../../shared/shared-selectors';
import {selectors as tableSelectors} from '../../../../table-bro-selectors';
import type {BroContext}             from '../../../../types/context';
import type {BroCol, BroRow}         from '../../../../types/table-bro';
import type {BroView}                from '../../../../types/view';
import {BroTdDetails}                from './td/td-details.view';

const {escape} = BroHTML;

export class BroTrDetails implements BroView {
  template(dataRowNumber: number, slotId: number): string {
    // The id lets the details button of the row point at the details with aria-controls; the slot keeps it when the row moves
    return `
      <tr class="${selectors.detailsTr}" id="${escape(this.ctx.host.id)}-details-${slotId}" role="row"
          ${tableSelectors.rowNumberAttribute}="${dataRowNumber}" data-action="expand"></tr>`;
  }

  constructor(protected readonly ctx: BroContext,
              private row: BroRow) {
  }

  /**
   * @param dataRowNumber - the position of the row of the details in the displayed rows, from 1
   * @param slotId - the id of the slot of the row, for the id of the details row
   * @param details - the loaded component of server details, which moves into the details row
   */
  render(dataRowNumber: number, slotId: number, details?: HTMLElement): HTMLElement {
    const tr = this.ctx.dom.createFromHTML(this.template(dataRowNumber, slotId));

    // Not in the markup: a strict Content Security Policy blocks a style attribute
    tr.style.height = '0';

    const emptyCol: BroCol = {
      title: '',
      colSpan: this.ctx.cols.length
    };

    tr.appendChild(
      new BroTdDetails(this.ctx, emptyCol, this.row).render(details)
    );

    return tr;
  }
}

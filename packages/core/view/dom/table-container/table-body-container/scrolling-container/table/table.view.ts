import type {BroFrame}                  from '../../../../../../shared/frame';
import {classAttr}                      from '../../../../../../shared/html';
import {selectors as sharedSelectors}   from '../../../../../../shared/shared-selectors';
import type {BroContext}                from '../../../../../../types/context';
import type {BroResolvedConfig, BroRow} from '../../../../../../types/table-bro';
import type {BroView}                   from '../../../../../../types/view';
import {BroTbody}                       from './tbody/tbody.view';
import {BroThead}                       from './thead/thead.view';

export class BroTable implements BroView {
  static template(config: BroResolvedConfig, tableHeaderContainer?: boolean, props?: {className?: string; ariaHidden?: boolean}): string {
    let className: string | undefined;
    let ariaHidden: boolean | undefined;

    if (tableHeaderContainer) {
      className = sharedSelectors.header;
    } else if (props) {
      className = props.className;
      ariaHidden = props.ariaHidden;
    }

    // The header and the body tables are parts of one table for screen readers, the table container; the aux table is hidden
    return `
      <table ${classAttr(config.css.table?.className, className)}
        ${ariaHidden ? `aria-hidden="${ariaHidden}"` : 'role="presentation"'}></table>`;
  }

  /** The row group of the titles of a header table, once it renders. */
  thead?: BroThead;
  /** The row group of the rows of a body table, once it renders. */
  tbody?: BroTbody;

  constructor(protected readonly ctx: BroContext,
              private rows: BroRow[] | null | undefined) {
  }

  /**
   * @param tableHeaderContainer - the table of the header container, with the header row of the table
   * @param frame - the frame of the update, in which the cells of the body table measure their values
   */
  render(tableHeaderContainer?: boolean, frame?: BroFrame): HTMLElement {
    const {cols, config, layout, view} = this.ctx;

    const props = {className: layout.bodyClassName};

    const table = this.ctx.dom.createFromHTML(BroTable.template(config, tableHeaderContainer, props));

    if (tableHeaderContainer) {
      this.thead = new BroThead(this.ctx);
      view.thead = this.thead;

      table.appendChild(
        this.thead.render()
      );
    }

    if (!tableHeaderContainer) {
      this.tbody = new BroTbody(this.ctx, cols, this.rows, 'tr');
      view.tbody = this.tbody;

      table.appendChild(
        this.tbody.render(frame)
      );
    }

    return table;
  }
}

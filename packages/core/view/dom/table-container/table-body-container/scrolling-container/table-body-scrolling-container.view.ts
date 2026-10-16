import type {BroFrame}    from '../../../../../shared/frame';
import {BroHTML}          from '../../../../../shared/html';
import {selectors}        from '../../../../../table-bro-selectors';
import type {BroContext}  from '../../../../../types/context';
import type {BroRow}      from '../../../../../types/table-bro';
import type {BroView}     from '../../../../../types/view';
import {BroTableAux}      from './table-aux/table-aux.view';
import type {BroTbodyAux} from './table-aux/tbody/tbody-aux.view';
import {BroTable}         from './table/table.view';
import type {BroTbody}    from './table/tbody/tbody.view';

const {createElement} = BroHTML;

export class BroTableBodyScrollingContainer implements BroView {
  template(): string {
    return `
      <div class="bro-table-body_scrolling-container ${selectors.tableBody}"></div>`;
  }

  el!: HTMLElement;

  /** The vertical offset of the rows in px, as setTop() last wrote it. */
  top: number = 0;

  /** The aux table, which measures the widths of the columns and holds the refresh overlay. */
  tableAux!: BroTableAux;
  /** The table of the rows, once it renders. */
  private table?: BroTable;

  constructor(protected readonly ctx: BroContext,
              private rows: BroRow[] | null | undefined) {
  }

  render(): HTMLElement {
    this.el = createElement(this.template());

    // The auxiliary table measures column widths and holds the refresh overlay, so every table has it
    this.tableAux = new BroTableAux(this.ctx, this.rows);
    this.ctx.view.tableAux = this.tableAux;

    this.el.appendChild(
      this.tableAux.render()
    );

    return this.el;
  }

  /** The row group of the rows of the body table. */
  get tbody(): BroTbody {
    return <BroTbody>this.table?.tbody;
  }

  /** The row group of the rows of the aux table. */
  get tbodyAux(): BroTbodyAux {
    return this.tableAux.tbodyAux;
  }

  renderTable(frame: BroFrame): void {
    this.table = new BroTable(this.ctx, this.rows);

    this.el.insertBefore(
      this.table.render(false, frame),
      this.tableAux.el
    );

    if (this.rows?.length) {
      this.tableAux.tbodyAux.renderTable(this.rows);
    }
  }

  /**
   * Moves the rows by a transform: the compositor moves the layer of the rows in every frame of the page scroll,
   * without a layout of all the loaded rows that a change of top needs.
   */
  setTop(targetTop: number): void {
    this.top = targetTop;
    this.el.style.transform = `translate3d(0, ${targetTop}px, 0)`;
  }

  /** One frame of the page scroll: the rows move, and the layout of the body follows the window of the page with them. */
  scrollFrame(progress: number, previousTop: number, targetTop: number): void {
    if (progress === 0) {
      return;
    }

    this.setTop(previousTop + (targetTop - previousTop) * progress);

    this.ctx.layout.windowMoved();
  }

  /**
   * The rows stand at the current page at once, after the rows of the body changed in place: the layout of the body
   * resets the window and follows it again.
   * @param tableTop - the top of the rows at the current page
   */
  placeRows(tableTop: number): void {
    this.ctx.layout.windowReset();

    this.scrollFrame(1, tableTop, tableTop);
  }
}

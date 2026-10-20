import type {BroPagination}           from '../../../../../model/pagination';
import type {BroRowSlot}              from '../../../../../model/row-slots';
import {selectors as sharedSelectors} from '../../../../../shared/shared-selectors';
import type {BroContext}              from '../../../../../types/context';
import type {BroView}                 from '../../../../../types/view';

/**
 * The container of the shadows of the body. The layout of the body (ctx.layout) puts the shadows into it: one shadow
 * along the window of the page, or the decorations of the rows of an extension of the layout. The container keeps the
 * geometry of the rows that it adds and removes with their shadows.
 */
export class BroTableBodyShadowContainer implements BroView {
  template(): string {
    return `
      <div class="${sharedSelectors.tableShadows}"
           aria-hidden="true"></div>`;
  }

  el!: HTMLElement;

  pageSize: number;
  page: number;

  /**
   * @param ctx - the context of the table
   * @param rowsLength - the number of the displayed rows
   * @param pagination - the pagination for the shadow heights; differs from ctx.state.pagination only in a table state
   */
  constructor(protected readonly ctx: BroContext,
              private rowsLength: number,
              pagination: BroPagination = ctx.state.pagination) {
    // A body that loads has no rows yet
    this.rowsLength = this.rowsLength || 0;

    this.page = pagination.page;
    this.pageSize = pagination.pageSize;
  }

  /**
   * Creates the container with the shadows that the layout of the body puts into it.
   * The geometry has the rows already: BroRowHeights.init() adds them.
   * @param height - height of the shadows on the current page; the state of the table passes its own height
   */
  render(height?: number): HTMLElement {
    this.el = this.ctx.dom.createFromHTML(this.template());

    this.ctx.layout.rowsRendered(this.el, this.rowsLength, this.firstRow(), this.lastRow(), height);

    return this.el;
  }

  /** Renders the container in place of the previous one, with the window of a state of the height. */
  replace(previous: BroTableBodyShadowContainer, height?: number): void {
    previous.el.replaceWith(this.render(height));
  }

  renderLoadedRows(loadedRowsLength: number): void {
    // The loaded rows come without shadows: the page scroll to them sizes them
    this.ctx.layout.rowsAdded(this.rowsLength + 1, loadedRowsLength);

    this.rowsLength += loadedRowsLength;
  }

  renderEmptyRowShadows(rowsLength: number, emptyRowsToAdd: number): void {
    this.ctx.layout.rowsAdded(rowsLength - emptyRowsToAdd + 1, emptyRowsToAdd, this.firstRow(), this.lastRow());
  }

  /** A new row of a body that changes in place: the layout of the body follows it. */
  renderRow(slot: BroRowSlot): void {
    this.ctx.layout.rowAdded(slot);
  }

  /**
   * After the rows of the body changed in place: the container follows the number of rows and the page, and the layout
   * of the body follows the order of the rows. The gaps and the empty rows follow afterwards.
   */
  remap(rowsLength: number): void {
    const {layout, state} = this.ctx;

    this.rowsLength = rowsLength;
    this.page = state.pagination.page;
    this.pageSize = state.pagination.pageSize;

    layout.rowsMoved(rowsLength);
  }

  /**
   * Removes the shadows of the empty rows that follow the real rows.
   */
  removeEmptyRowShadows(rowsLength: number, emptyRows: number): void {
    this.ctx.layout.rowsRemoved(rowsLength + 1, emptyRows);
  }

  /** The first and the last row of the page of the container. */
  private firstRow(): number {
    return 1 + (this.page - 1) * this.pageSize;
  }

  private lastRow(): number {
    return this.page * this.pageSize;
  }
}

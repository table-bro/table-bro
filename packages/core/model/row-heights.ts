import type {BroContext}    from '../types/context';
import type {BroPagination} from './pagination';

/**
 * The geometry of the rows of the body: the height of every row with its details, by their positions. The rows move
 * by it from page to page, with the gaps that the layout of the body has between them.
 */
export class BroRowHeights {
  /** The heights in px: the row number n at n - 1. */
  heights: number[] = [];

  /**
   * @param ctx - the context of the table
   * @param rowsLength - the number of the displayed rows
   * @param gapsBefore - the height of the gaps of the layout of the body above a page that starts after the row number
   */
  constructor(private readonly ctx: BroContext,
              private rowsLength: number,
              private readonly gapsBefore: (rowNumber: number) => number) {
  }

  /** The pagination of the state: new rows that keep the body bring a new one. */
  private get pagination(): BroPagination {
    return this.ctx.state.pagination;
  }

  setRowsLength(rowsLength: number): void {
    this.rowsLength = rowsLength;
  }

  init(rowsLength?: number): void {
    if (rowsLength) {
      this.setRowsLength(rowsLength);
    }

    this.heights = [];

    for (let rowNumber = 1; rowNumber <= this.rowsLength; rowNumber++) {
      this.addRow(rowNumber);
    }
  }

  addRow(rowNumber: number): void {
    this.heights[rowNumber - 1] = this.ctx.styles.rowHeight;
  }

  removeRow(rowNumber: number): void {
    delete this.heights[rowNumber - 1];
  }

  /**
   * Rows that follow the others: the loaded rows of appendRows, or the empty rows of the last page.
   * @param rowsLength - the rows before them
   * @param count - the number of the new rows
   */
  addRows(rowsLength: number, count: number): void {
    for (let rowNumber = rowsLength + 1; rowNumber <= rowsLength + count; rowNumber++) {
      this.addRow(rowNumber);
    }

    this.setRowsLength(rowsLength + count);
  }

  /**
   * The rows after the number left: the empty rows of the last page.
   * @param rowsLength - the rows that stay
   * @param count - the number of the rows that left
   */
  removeRows(rowsLength: number, count: number): void {
    for (let rowNumber = rowsLength + 1; rowNumber <= rowsLength + count; rowNumber++) {
      this.removeRow(rowNumber);
    }

    this.setRowsLength(rowsLength);
  }

  expandRowByDetails(rowNumber: number, currentDetailsHeight: number): void {
    this.heights[rowNumber - 1] = this.ctx.styles.rowHeight + currentDetailsHeight;
  }

  /**
   * The offset of the current page: the rows before it with their details, and the gaps of the layout of the body
   * between them.
   */
  calcTableHeight(): number {
    const lastRow = this.pagination.pageStart;

    let tableHeight: number = 0;

    for (let rowNumber = 1; rowNumber <= lastRow; rowNumber++) {
      tableHeight += this.heights[rowNumber - 1];
    }

    return tableHeight + this.gapsBefore(lastRow);
  }
}

export class BroPagination {
  /** The number of the current page, from 1. */
  page: number = 1;
  /** The number of the rows on a page. */
  pageSize: number;

  /**
   * The number of the rows of all pages: the rows of the table in the local mode, the total that the server gives
   * in the server mode; undefined until the rows come.
   */
  total?: number;

  /** @param config - the page size of the resolved config, or the one that the table shows */
  constructor(config: {pageSize: number}) {
    this.pageSize = config.pageSize;
  }

  /** The rows before the page: the start of the page in the rows, from 0. */
  get pageStart(): number {
    return (this.page - 1) * this.pageSize;
  }

  /** The rows up to the end of the page: the end of the page in the rows, the number of its last row. */
  get pageEnd(): number {
    return this.page * this.pageSize;
  }

  /** The number of the first row on the page, formerly `getFirstRowNumberOnThePage`. */
  firstRow(): number {
    return this.pageStart + 1;
  }

  /**
   * The number of the page, from 1, that shows a row at the current page size.
   * @param rowNumber - the number of the row, from 1
   */
  getPageByRowNumber(rowNumber: number): number {
    const {pageSize} = this;

    return Math.ceil(rowNumber / pageSize);
  }
}

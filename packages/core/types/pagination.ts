/**
 * The data of the actions of the paginator: the page and the page size that the user chose.
 * @group Rows and query
 */
export interface BroPageChange {
  /** The page that the user chose, from 1. */
  page: number;
  /** The page size that the user chose. */
  pageSize: number;
}

/** What the paginator shows: the page, the page size, the number of the rows and whether it is disabled. */
export interface BroPaginatorOptions {
  /** The page to show, from 1. */
  page?: number;
  /** The number of the rows on a page. */
  pageSize?: number;

  /** The number of the rows of all pages; it also limits the page size options. */
  total?: number;

  /** Whether the paginator is disabled; the controller sets it from the status of the table. */
  disabled?: boolean;
}

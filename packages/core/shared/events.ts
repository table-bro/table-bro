/**
 * The names of the events that the table and its skins dispatch, as actionEvent for bro-action.
 * @group Events
 * @module
 */
export const actionEvent = 'bro-action';

/** Toolbar */
export const toolbarEvent = 'bro-toolbar';
export const toolbarSearchOpenEvent = 'bro-toolbar-search-open';
export const toolbarSearchCloseEvent = 'bro-toolbar-search-close';
export const toolbarMoreExportEvent = 'bro-toolbar-more-export';

/** Filters */
export const filtersFilterEvent = 'bro-filters-filter';
export const filtersToggleEvent = 'bro-filters-toggle';
export const filtersOpenEvent = 'bro-filters-open';
export const filtersCloseEvent = 'bro-filters-close';
export const filtersSortEvent = 'bro-filters-sort';
export const filtersServerLoadedEvent = 'bro-filters-server-loaded';

/** Columns: a known new width of the table in px, such as next to an opened filter drawer */
export const columnsWidthEvent = 'bro-columns-width';

/** Row details */
export const detailsToggleEvent = 'bro-details-toggle';
export const detailsServerLoadedEvent = 'bro-details-server-loaded';
export const detailsServerFailedEvent = 'bro-details-server-failed';

/** Paginator */
export const paginatorPageEvent = 'bro-paginator-page';

export const themeChangeEvent = 'bro-theme-change';

/** An error of the table for the application; detail is BroErrorDetail. */
export const errorEvent = 'bro-error';

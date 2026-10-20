// The names of the production build: the same as the names of the development build, so that the styles of an
// application work with both builds. A build from the sources may shorten them here.
export const enum selectors {
  tableBodyContainer = 'bro-table-body_container',
  tableBody = 'bro-table-body',
  tableCellEmpty = 'bro-cell-empty',

  shadow = 'bro-shadow',

  // State
  stateMessage = 'bro-state-message',

  /** The key of the column on its header and body cells: the rules of the column widths find the cells by it. */
  columnKeyAttribute = 'data-bro-column-key',
  /** The instance of the table on its host: the rules of its <style> elements find it by it, also when another table has its id. */
  instanceAttribute = 'data-bro-instance',
  /** The table of the prerender on its host, until the browser renders it: the elements of the skin in it keep their markup. */
  prerenderAttribute = 'data-bro-prerender',

  // Names the application sees keep their names in production
  rowNumberAttribute = 'data-row-number',
  /** The row counter column of the table: its name, its sort key and the field of a row, formerly `tableColRowCounter`. */
  rowCounter = 'bro-row-counter'
}

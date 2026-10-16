export const enum selectors {
  tableBodyContainer = 'bro-table-body_container',
  tableBody = 'bro-table-body',
  tableCellEmpty = 'bro-cell-empty',

  shadow = 'bro-shadow',

  // State
  stateMessage = 'bro-state-message',
  /** The live region of the table: screen readers say its text. */
  liveStatus = 'bro-live-status',

  /** The key of the column on its header and body cells: the rules of the column widths find the cells by it. */
  columnKeyAttribute = 'data-bro-column-key',
  /** The instance of the table on its host: the rules of its <style> elements find it by it, also when another table has its id. */
  instanceAttribute = 'data-bro-instance',

  // Names the application sees keep their names in production
  rowNumberAttribute = 'data-row-number',
  /** The row counter column of the table: its name, its sort key and the field of a row, formerly `tableColRowCounter`. */
  rowCounter = 'bro-row-counter'
}

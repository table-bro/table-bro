/**
 * A row of the table: an object with the fields of the columns and an optional id.
 * @group Rows and query
 */
export interface BroRow extends Record<string, unknown> {
  /** The id of the row that keys it in the render; a row without an id or with a repeated id is keyed by its object. */
  id?: string | number;
}

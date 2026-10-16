import type {BroFilters}                          from '../../../shared/query';
import type {BroCol, BroFiltersTransform, BroRow} from '../../../types/table-bro';

/** The search of the local mode: a row stays when a string field of a column of the table contains the search. */
export class BroRowsSearch {
  /**
   * @param cols - columns of the table: the search looks only at the fields they display
   */
  constructor(private cols: BroCol[]) {
  }

  /**
   * Local search in the string fields of the declared columns. Row numbers are set by the controller.
   */
  readonly transform: BroFiltersTransform = (rows: BroRow[], filters: BroFilters): BroRow[] => {
    if (!rows || !rows.length || !filters) {
      return rows;
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      const names = this.cols.map(col => col.name).filter((name): name is string => !!name);

      return rows.filter((row: BroRow) => {
        return names.some(name => typeof row[name] === 'string' && row[name].toLowerCase().includes(search));
      });
    } else {
      return rows;
    }
  };
}

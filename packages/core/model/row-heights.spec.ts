import {describe, expect, it} from 'vitest';

import type {BroContext} from '../types/context';
import type {BroConfig}  from '../types/table-bro';
import {BroPagination}   from './pagination';
import {BroRowHeights}   from './row-heights';

const rowHeight: number = 10;
const pageSize: number = 5;

/**
 * A model of the given rows. The layout of the body of the spec gives 6 px of gaps before every page but the first.
 * @param rowsLength - the number of the rows
 * @param gaps - the layout of the body has gaps
 */
function setup(rowsLength: number, gaps: boolean = true): {rowHeights: BroRowHeights; pagination: BroPagination} {
  const pagination: BroPagination = new BroPagination(<BroConfig>{pageSize});
  const ctx = <BroContext><unknown>{
    state: {pagination},
    styles: {rowHeight}
  };
  const rowHeights: BroRowHeights = new BroRowHeights(ctx, rowsLength, (rowNumber: number) => (gaps && rowNumber) ? 6 : 0);

  rowHeights.init();

  return {rowHeights, pagination};
}

describe('BroRowHeights.calcTableHeight', () => {
  it('starts the page below the rows before it, with their details and the gaps of the layout', () => {
    const {rowHeights, pagination} = setup(30);

    rowHeights.expandRowByDetails(3, 20);
    rowHeights.expandRowByDetails(8, 20);
    pagination.page = 2;

    // Rows 1 to 5, the details of row 3 and the gaps; the details of row 8 lie on the page
    expect(rowHeights.calcTableHeight()).toBe(50 + 20 + 6);
  });

  it('starts the page below the rows before it and their details only, without gaps', () => {
    const {rowHeights, pagination} = setup(30, false);

    rowHeights.expandRowByDetails(3, 20);
    pagination.page = 2;

    expect(rowHeights.calcTableHeight()).toBe(50 + 20);
  });

  it('starts the first page at the top of the table', () => {
    const {rowHeights} = setup(30);

    rowHeights.expandRowByDetails(1, 20);

    expect(rowHeights.calcTableHeight()).toBe(0);
  });
});

describe('BroRowHeights.addRows and removeRows', () => {
  it('adds the rows that follow the others with the row height and takes them away again', () => {
    const {rowHeights} = setup(3);

    rowHeights.addRows(3, 2);

    expect(rowHeights.heights).toEqual([10, 10, 10, 10, 10]);

    rowHeights.removeRows(3, 2);

    expect(rowHeights.heights.filter(height => height !== undefined)).toEqual([10, 10, 10]);
  });
});

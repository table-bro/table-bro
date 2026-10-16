import {describe, expect, it} from 'vitest';

import {selectors}                                                          from '../table-bro-selectors';
import type {BroCol}                                                        from '../types/table-bro';
import {type BroColumnMeasure, createColumns, layoutColumns, longestValues} from './columns';

describe('createColumns', () => {
  it('keys a column by its name, else by its sort key, else by its position', () => {
    const cols: BroCol[] = [{title: 'Name', name: 'name'}, {title: 'Date', sortKey: 'ts'}, {title: ''}];

    expect(createColumns(cols).map(({key, className}) => ({key, className}))).toEqual([
      {key: 'name', className: 'bro-col--name'},
      {key: 'ts', className: 'bro-col--ts'},
      {key: '3', className: 'bro-col--3'}
    ]);
  });

  it('numbers a key that repeats, so every column has its own', () => {
    const cols: BroCol[] = [{title: 'Price', name: 'price'}, {title: 'Price again', name: 'price'}, {title: 'Third', name: 'price'}];

    expect(createColumns(cols).map(({key}) => key)).toEqual(['price', 'price-2', 'price-3']);
  });

  it('keeps the column objects and turns whitespace into a dash in the class', () => {
    const cols: BroCol[] = [{title: 'Full name', name: 'full name'}];
    const [column] = createColumns(cols);

    expect(column.col).toBe(cols[0]);
    expect(column).toMatchObject({key: 'full name', className: 'bro-col--full-name'});
  });
});

/** Body measurements: the content is the cell, and every cell has paddings of 10 px. */
function body(...widths: number[]): BroColumnMeasure[] {
  return widths.map((width, i) => ({key: `${i + 1}`, clientWidth: width, contentWidth: width, targetWidth: width, paddings: 10}));
}

describe('layoutColumns', () => {
  it('keeps the narrow columns that fit into half of the table and shares the rest between the others', () => {
    // 50 and 100 with their paddings take 170 of 600; 430 are left for two columns, 215 each without the paddings
    expect(layoutColumns(body(300, 50, 400, 100), 600)).toEqual([205, 50, 205, 100]);
  });

  it('gives a column of the rest no more than its own width', () => {
    // 410 are left for the last two columns: the one of 200 keeps its own width, and the other takes the rest, 210
    expect(layoutColumns(body(50, 100, 200, 210), 600)).toEqual([50, 100, 200, 210]);
  });

  it('gives a column narrower than its title the least width of the title', () => {
    // The titles make the first two columns take 180: 420 are left, 200 for each of the other two
    expect(layoutColumns(body(50, 60, 300, 400), 600, [80, 80, 80, 80])).toEqual([80, 80, 200, 200]);
  });

  it('keeps the least width for a component without a width of its own, as a progress bar', () => {
    // The bar of 0 takes its title of 70 and its paddings: of 520, the other two take 250 each without the paddings
    expect(layoutColumns(body(300, 400, 0), 600, [0, 0, 70], [false, false, true])).toEqual([250, 250, 70]);
  });

  it('keeps the sort icon of a header out of the shared width', () => {
    const header: BroColumnMeasure[] = body(50, 100, 300, 400).map(col => ({...col, contentWidth: col.clientWidth - 20}));

    expect(layoutColumns(header, 600)).toEqual([50, 100, 185, 185]);
  });

  it('keeps the widths of the component columns that fit into half of the table and shares the rest between the others', () => {
    // The components of 100 and 120 take 240 with their paddings, the component of 250 does not fit into 300 with them.
    // Of the 360 left, the column of 50 takes 60, and the other two share 300: 140 each without the paddings
    const components = [false, true, true, true, false];

    expect(layoutColumns(body(400, 100, 120, 250, 50), 600, undefined, components)).toEqual([140, 100, 120, 140, 50]);
  });

  it('gives no negative width to the columns of a table narrower than their paddings and icons', () => {
    // Ten header columns of 100 with an icon of 24 and paddings of 16 in 400: the first keeps its width, the rest get 0
    const header: BroColumnMeasure[] = Array.from({length: 10}, (_, i) => ({key: `${i + 1}`, clientWidth: 100, contentWidth: 76, targetWidth: 100, paddings: 16}));

    expect(layoutColumns(header, 400)).toEqual([100, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('gives a column of the shared width the width of its short title at least', () => {
    // 600 without the paddings is 570: the first column keeps 100, the one with the title of 300 keeps it, the last takes 170
    expect(layoutColumns(body(100, 400, 500), 600, [0, 300, 0])).toEqual([100, 300, 170]);
  });

  it('shortens the short titles of a table narrower than them, and keeps its width', () => {
    // 370 without the paddings is 350, half of the short titles of 400 and 300: they share it by 200 and 150
    expect(layoutColumns(body(500, 500), 370, [400, 300])).toEqual([200, 150]);
  });

  it('keeps the own width of a column without a title out of the shared width', () => {
    // The buttons of 150 with their paddings take 160: of 440, the other two take 210 each without their paddings
    expect(layoutColumns(body(300, 400, 150), 600, undefined, [false, false, true], [false, false, true])).toEqual([210, 210, 150]);
  });

  it('gives every column of the shared width its own paddings', () => {
    // The last column has the space of the row at its right: 600 without the paddings of 10 and 30 is 560, 280 each
    const columns: BroColumnMeasure[] = body(300, 400).map((col, i) => ({...col, paddings: i ? 30 : 10}));

    expect(layoutColumns(columns, 600)).toEqual([280, 280]);
  });

  it('widens a body column to its full title while the table has room', () => {
    // The values of 50 take 120 of 600 with the paddings, the titles of 200 and 150 fit into the rest
    expect(layoutColumns(body(50, 50), 600, [80, 80], undefined, undefined, [200, 150])).toEqual([200, 150]);
  });

  it('shares the room that is left between the body columns narrower than their full titles', () => {
    // 300 without the paddings is 280; the short titles of 80 leave 120, which takes the columns to 140 each
    expect(layoutColumns(body(50, 50), 300, [80, 80], undefined, undefined, [200, 300])).toEqual([140, 140]);
  });

  it('keeps the short titles of a table without room for the full ones', () => {
    expect(layoutColumns(body(50, 50), 180, [80, 80], undefined, undefined, [200, 300])).toEqual([80, 80]);
  });

  it('lays a table without components out as before', () => {
    expect(layoutColumns(body(300, 50, 400, 100), 600, undefined, [false, false, false, false])).toEqual([205, 50, 205, 100]);
  });
});

describe('longestValues', () => {
  it('takes the longest value of each field, also of rows whose row counter comes first', () => {
    const rows = [
      {[selectors.rowCounter]: 1, name: 'ab', note: null},
      {[selectors.rowCounter]: 2, name: 'abcd', note: 'x'},
      {[selectors.rowCounter]: 3, name: 'abc', note: undefined}
    ];

    expect(longestValues(rows, true, 120)).toEqual({[selectors.rowCounter]: 999, name: 'abcd', note: 'x'});
  });
});

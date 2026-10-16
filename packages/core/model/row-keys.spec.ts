import {describe, expect, it} from 'vitest';

import {copyAppObject}     from '../shared/app-objects';
import type {BroRow}       from '../types/table-bro';
import {diffKeys, rowKeys} from './row-keys';

describe('rowKeys', () => {
  it('keys a row by its id, else by its object of the application, also through a copy of the table', () => {
    const plain: BroRow = {name: 'b'};
    const rows: BroRow[] = [{id: 7, name: 'a'}, copyAppObject(plain), copyAppObject(copyAppObject(plain), {counter: 2})];

    const keys = rowKeys(rows);

    expect(keys[0]).toBe(7);
    expect(keys[1]).toBe(plain);
    // The same application row twice: the second copy keys itself
    expect(keys[2]).toBe(rows[2]);
  });

  it('keys the rows of a repeated id by their objects of the application, whatever their order', () => {
    const first: BroRow = {id: 1, name: 'first'};
    const second: BroRow = {id: 1, name: 'second'};
    const rows: BroRow[] = [copyAppObject(first), copyAppObject(second), {id: 2}];

    expect(rowKeys(rows)).toEqual([first, second, 2]);
    expect(rowKeys([rows[1], rows[0], rows[2]])).toEqual([second, first, 2]);
  });

  it('keys an id that repeats among all the rows by the object, also where only one of its rows is shown', () => {
    const first: BroRow = {id: 1};

    expect(rowKeys([copyAppObject(first)], new Set(), new Set([1]))).toEqual([first]);
  });

  it('gives way to the keys of the rows that the rows follow', () => {
    const rows: BroRow[] = [{id: 1}, {id: 2}];

    expect(rowKeys(rows, new Set([2]))).toEqual([1, rows[1]]);
  });
});

describe('diffKeys', () => {
  it('finds the removed and the added keys', () => {
    const diff = diffKeys(['a', 'b', 'c'], ['b', 'c', 'd']);

    expect(diff.removed).toEqual(['a']);
    expect(diff.added).toEqual(['d']);
    expect([...diff.moved]).toEqual([]);
  });

  it('moves only the rows out of the longest run that keeps its order', () => {
    // b, c, d keep their order: only a and e move
    expect([...diffKeys(['a', 'b', 'c', 'd', 'e'], ['b', 'c', 'e', 'd', 'a']).moved].sort()).toEqual(['a', 'e']);
  });

  it('moves all rows but one for a reversed order', () => {
    expect(diffKeys([1, 2, 3, 4], [4, 3, 2, 1]).moved.size).toBe(3);
  });

  it('moves nothing for the same order and for kept rows around new ones', () => {
    expect(diffKeys([1, 2, 3], [1, 2, 3]).moved.size).toBe(0);
    expect(diffKeys([1, 2, 3], [0, 1, 5, 2, 3]).moved.size).toBe(0);
  });
});

import {describe, expect, it} from 'vitest';

import {matchesFilterCondition} from './query';

describe('matchesFilterCondition', () => {
  it('takes a number and its text as equal', () => {
    expect(matchesFilterCondition(5, {eq: '5'})).toBe(true);
    expect(matchesFilterCondition('5', {in: [3, 5]})).toBe(true);
    expect(matchesFilterCondition(5, {eq: 6})).toBe(false);
  });

  it('takes 0 as equal to no empty value or boolean', () => {
    for (const value of [null, undefined, '', ' ', false]) {
      expect(matchesFilterCondition(value, {eq: 0}), String(value)).toBe(false);
      expect(matchesFilterCondition(0, {eq: value}), String(value)).toBe(value === undefined);
      expect(matchesFilterCondition(value, {in: [0]}), String(value)).toBe(false);
    }

    expect(matchesFilterCondition(0, {eq: '0'})).toBe(true);
    expect(matchesFilterCondition(1, {eq: true})).toBe(false);
  });

  it('finds text without case, from its start or anywhere, and an empty value as empty text', () => {
    expect(matchesFilterCondition('Bravo', {contains: 'RAV'})).toBe(true);
    expect(matchesFilterCondition('Bravo', {startsWith: 'br'})).toBe(true);
    expect(matchesFilterCondition('Bravo', {startsWith: 'rav'})).toBe(false);
    expect(matchesFilterCondition(null, {contains: ''})).toBe(true);
    expect(matchesFilterCondition(null, {contains: 'null'})).toBe(false);
  });

  it('compares a range as numbers when both ends are numbers, else as text, and needs every condition', () => {
    expect(matchesFilterCondition('10', {gte: 9, lte: '10'})).toBe(true);
    expect(matchesFilterCondition(10, {gte: 11})).toBe(false);
    expect(matchesFilterCondition('2026-10-09', {gte: '2026-10-01', lte: '2026-10-31'})).toBe(true);
    expect(matchesFilterCondition('2026-11-01', {lte: '2026-10-31'})).toBe(false);
    expect(matchesFilterCondition(5, {gte: 1, eq: 6})).toBe(false);
  });
});

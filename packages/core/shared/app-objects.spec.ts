import {describe, expect, it} from 'vitest';

import {appObject, copyAppObject} from './app-objects';

class Order {
  readonly #total: number;

  constructor(readonly number: string, total: number) {
    this.#total = total;
  }

  get total(): number {
    return this.#total;
  }

  get label(): string {
    return `${this.number}: ${this.#total}`;
  }
}

class UrgentOrder extends Order {
  get urgent(): boolean {
    return true;
  }
}

describe('copyAppObject', () => {
  it('keeps the values of the getters of the classes of a row, also of its private fields', () => {
    const order = new UrgentOrder('A-1', 12);
    const copy = copyAppObject(order, {['bro-row-counter']: 1} as Partial<UrgentOrder>);

    expect({...copy}).toEqual({number: 'A-1', total: 12, label: 'A-1: 12', urgent: true, 'bro-row-counter': 1});
    expect(appObject(copy)).toBe(order);
    expect(appObject(copyAppObject(copy))).toBe(order);
  });

  it('copies a plain object as it is', () => {
    const row = {name: 'a', get upper() {
      return 'A';
    }};

    expect({...copyAppObject(row)}).toEqual({name: 'a', upper: 'A'});
  });
});

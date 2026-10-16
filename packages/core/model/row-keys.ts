import {appObject}   from '../shared/app-objects';
import type {BroRow} from '../types/table-bro';

/**
 * The keys of the rows, by their order: the id of a row (BroRow.id), else its object of the application, which the copies
 * of the table keep through the sort, the filters and the row numbers. The rows of an id that repeats are keyed by their
 * objects of the application too, so the key of a row does not depend on the order of the rows. A key that still repeats,
 * as the same object of the application given twice, gives way to the copy of its row: every row has its own key.
 * @param rows - the rows to key, in their order
 * @param taken - the keys of the rows that the rows follow, as the loaded rows of appendRows follow the displayed ones
 * @param repeated - the ids that repeat, among all the rows of the table and not only among these
 */
export function rowKeys(rows: BroRow[], taken: {has(key: unknown): boolean} = new Set(), repeated: ReadonlySet<unknown> = repeatedIds(rows)): unknown[] {
  const keys = new Set<unknown>();

  return rows.map(row => {
    const id = row.id;
    let key: unknown = (id !== undefined && id !== null && !repeated.has(id)) ? id : appObject(row);

    if (keys.has(key) || taken.has(key)) {
      key = row;
    }

    keys.add(key);

    return key;
  });
}

/** The ids that more than one of the rows has. */
export function repeatedIds(rows: BroRow[]): Set<unknown> {
  const ids = new Set<unknown>();
  const repeated = new Set<unknown>();

  rows.forEach(({id}) => {
    if (id !== undefined && id !== null) {
      if (ids.has(id)) {
        repeated.add(id);
      }

      ids.add(id);
    }
  });

  return repeated;
}

/** How the rows of the previous keys become the rows of the next keys. */
export interface BroKeysDiff {
  /** The keys that the next rows do not have. */
  removed: unknown[];
  /** The keys that the previous rows did not have. */
  added: unknown[];
  /** The kept keys whose rows move; the other kept rows stay in their places. */
  moved: Set<unknown>;
}

/**
 * The difference of two orders of keys. The rows of the longest run of kept keys that keeps its previous order stay
 * in their places, and only the other kept rows move, as the keyed lists of the frameworks do: a sort moves the fewest rows.
 */
export function diffKeys(previous: unknown[], next: unknown[]): BroKeysDiff {
  const previousIndex = new Map(previous.map((key, i) => [key, i]));
  const nextKeys = new Set(next);

  const kept = next.filter(key => previousIndex.has(key));
  const staying = new Set(longestIncreasing(kept.map(key => <number>previousIndex.get(key))).map(i => kept[i]));

  return {
    removed: previous.filter(key => !nextKeys.has(key)),
    added: next.filter(key => !previousIndex.has(key)),
    moved: new Set(kept.filter(key => !staying.has(key)))
  };
}

/** The positions of a longest increasing subsequence of the values, in O(n log n). */
function longestIncreasing(values: number[]): number[] {
  // The last position of the best subsequence of each length, and the position before each position in its subsequence
  const tails: number[] = [];
  const previous: number[] = [];

  values.forEach((value, i) => {
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >> 1;

      if (values[tails[middle]] < value) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    previous[i] = (low > 0) ? tails[low - 1] : -1;
    tails[low] = i;
  });

  const positions: number[] = [];

  for (let i = tails[tails.length - 1] ?? -1; i !== -1; i = previous[i]) {
    positions.unshift(i);
  }

  return positions;
}

import {selectors}                      from '../table-bro-selectors';
import type {BroContext}                from '../types/context';
import type {BroRow}                    from '../types/table-bro';
import {diffKeys, repeatedIds, rowKeys} from './row-keys';

/**
 * The row object of every empty row that fills up the last page. The views tell an empty row by this object, not by
 * a field, so no row of the application is taken for one.
 */
export const emptyRow: BroRow = {};

/** The natural widths of the plain values of the cells of a row, by the keys of their columns, with the values they belong to. */
export type BroValueWidths = Map<string, {value: string; width: number}>;

/** The layers of the details of a row while they are open, opening or closing. */
export interface BroRowDetails {
  /** The row of the details in the body table, its cell, and the element of the table in it around the details component. */
  tr: HTMLElement;
  td: HTMLElement;
  element: HTMLElement;
}

/**
 * One displayed row with all its layers: its row in the body table, its row in the aux table and its details. The views
 * of the layers put their elements into the slot when they render the row, so the table reaches every layer of a row
 * from its slot, without a search in the DOM. The slot keeps the state of the details of the row. An extension of the
 * layout of the body reads the slot as a row of its own.
 */
export class BroRowSlot {
  /** The row of the body table; the body table puts it into the slot when it renders the row. */
  tr!: HTMLElement;
  /**
   * The row of the aux table of a table with server details, null in the other tables; the aux table puts it into the
   * slot when it renders the row. It grows by the height of the open details of the row.
   */
  auxTr: HTMLElement | null = null;
  /** The progress of server details in the aux row while they load, and the element of the details that loads. */
  progressBar: HTMLElement | null = null;
  loadingDetails: HTMLElement | null = null;

  /** The layers of the details while they are open, opening or closing. */
  details: BroRowDetails | null = null;
  /** The height of the open details in px, the target of their animation: 1 while they are not measured yet, 0 for closed details. */
  detailsHeight: number = 0;
  /** The height that the details take in the table as drawn now, in px, with the bottom border of their cell. */
  drawnDetailsHeight: number = 0;

  /** The widths of the values: a row rendered again with the same value of a cell does not measure it again. */
  readonly valueWidths: BroValueWidths = new Map();

  /**
   * @param ctx - the context of the table
   * @param id - the number of the slot in its body: it names the row of the details for the details button of the row
   * @param key - the key of the row (rowKeys)
   * @param row - the displayed row
   * @param number - the position of the row in the displayed rows, from 1
   */
  constructor(protected readonly ctx: BroContext,
              readonly id: number,
              readonly key: unknown,
              public row: BroRow,
              public number: number) {
  }

  get detailsTr(): HTMLElement | null {
    return this.details?.tr || null;
  }

  get open(): boolean {
    return this.detailsHeight > 0;
  }

  /** The row is displayed: a slot that left the table, or a body rendered anew, writes to no geometry. */
  get displayed(): boolean {
    return this.ctx.model.slots?.get(this.number) === this;
  }

  /**
   * The drawn height of the details with the bottom border of their cell: the geometry of a displayed row follows it.
   * @returns the row is displayed, and its geometry changed
   */
  setDrawnDetailsHeight(height: number): boolean {
    this.drawnDetailsHeight = height;

    if (this.displayed) {
      this.ctx.model.rowHeights.expandRowByDetails(this.number, height);
    }

    return this.displayed;
  }

  /**
   * The details left the tables: the row takes its own height again.
   * @returns the row is displayed, and its geometry changed
   */
  removeDetails(): boolean {
    this.details = null;

    return this.setDrawnDetailsHeight(0);
  }
}

/** The new rows of a body by their keys, before the slots take them (BroRowSlots.diff). */
export interface BroRowSlotsDiff {
  readonly rows: BroRow[];
  readonly keys: unknown[];
  /** The slots of the gone keys: they leave with all their layers. */
  readonly removed: BroRowSlot[];
  /** The kept keys out of the longest run in their previous order. */
  readonly moved: Set<unknown>;
}

/**
 * The slots of the displayed rows of a body, by their positions and by their keys. Empty rows that fill up the last
 * page and the row of a state have no slots: they are nodes of the body only.
 */
export class BroRowSlots {
  /** The slots by their positions: the slot of row number n is at n - 1. */
  readonly list: BroRowSlot[] = [];

  private readonly byKey = new Map<unknown, BroRowSlot>();
  /** The id of the last slot of the body. */
  private ids: number = 0;

  constructor(protected readonly ctx: BroContext,
              rows: BroRow[] | null | undefined) {
    this.add(rows || []);
  }

  /** Adds the slots of rows that follow the displayed ones, as appendRows does. */
  add(rows: BroRow[]): void {
    const from = this.list.length;

    rowKeys(rows, this.byKey, this.repeatedIds(rows)).forEach((key, i) => {
      const slot = new BroRowSlot(this.ctx, ++this.ids, key, rows[i], from + i + 1);

      this.list.push(slot);
      this.byKey.set(key, slot);
    });
  }

  /**
   * The new rows by their keys, before the slots take them: the slots of the gone keys are still displayed, so the
   * views take their layers away first.
   */
  diff(rows: BroRow[]): BroRowSlotsDiff {
    const keys = rowKeys(rows, undefined, this.repeatedIds(rows));
    const diff = diffKeys(this.list.map(slot => slot.key), keys);

    return {rows, keys, removed: diff.removed.map(key => <BroRowSlot>this.byKey.get(key)), moved: diff.moved};
  }

  /**
   * The slots take the new rows of the diff. The slot of a kept key stays with its layers and its details, takes its new
   * position and the new row object; the slot of a gone key goes away; a new key gets a new slot without layers. The kept
   * slots out of the longest run in their previous order move (diffKeys), the others stay.
   * @returns the new slots, the kept slots that move, the kept slots with a new row object, and the kept slots with
   * a new position, whose layers the views write
   */
  apply({rows, keys, removed, moved: movedKeys}: BroRowSlotsDiff): {added: Set<BroRowSlot>; moved: Set<BroRowSlot>; changed: BroRowSlot[]; renumbered: BroRowSlot[]} {
    const added = new Set<BroRowSlot>();
    const moved = new Set<BroRowSlot>();
    const changed: BroRowSlot[] = [];
    const renumbered: BroRowSlot[] = [];

    removed.forEach(slot => this.byKey.delete(slot.key));

    this.list.length = 0;

    keys.forEach((key, i) => {
      let slot = this.byKey.get(key);

      if (!slot) {
        slot = new BroRowSlot(this.ctx, ++this.ids, key, rows[i], i + 1);

        this.byKey.set(key, slot);
        added.add(slot);
      } else {
        if (slot.number !== i + 1) {
          slot.number = i + 1;
          renumbered.push(slot);
        }

        if (movedKeys.has(key)) {
          moved.add(slot);
        }

        if (slot.row !== rows[i]) {
          slot.row = rows[i];
          changed.push(slot);
        }
      }

      this.list.push(slot);
    });

    return {added, moved, changed, renumbered};
  }

  /** The slot of the row number, if the row is displayed. */
  get(rowNumber: number): BroRowSlot | undefined {
    return this.list[rowNumber - 1];
  }

  /**
   * The slot of the row element of the body around an element, as the target of an action: of the row itself or of its
   * details, while the row is displayed.
   * @param target - an element in a row of the body, or the row
   */
  of(target: EventTarget | null): BroRowSlot | undefined {
    const tr = (<Element | null>target)?.closest('tr');

    if (!tr) {
      return undefined;
    }

    const slot = this.get(+<string>tr.getAttribute(selectors.rowNumberAttribute));

    return (slot?.tr === tr || slot?.details?.tr === tr) ? slot : undefined;
  }

  /** The ids that repeat among all the rows of the table: a filter that hides a repeat keeps the keys of the others. */
  private repeatedIds(rows: BroRow[]): Set<unknown> {
    return repeatedIds(this.ctx.state.sourceRows || rows);
  }
}

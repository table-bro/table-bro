import {selectors}                          from '../table-bro-selectors';
import type {BroContext}                    from '../types/context';
import type {BroCol, BroRow, BroSortHeader} from '../types/table-bro';

/**
 * One column of a table: its key, its class for the styles, and its width. ctx.columns keeps one for each column
 * of ctx.cols, in their order. The measurements of the widths stay in ctx.model, by the index of the column.
 */
export interface BroColumnModel {
  /** The column of the table, the service "No" column included. */
  readonly col: BroCol;
  /** The key of the column: its name, else its sort key, else its position; unique within the table. */
  readonly key: string;
  /** The class of the column on its header and body cells, bro-col--<key>, for the styles of the application. */
  readonly className: string;
  /** The header cell of the column in the header row of the table, once the row is rendered. */
  headerCell?: HTMLElement;
  /** The sort header element of the column in the header row of the table, once the row is rendered. */
  sortHeader?: HTMLElement & BroSortHeader;
}

declare module '../types/context' {
  interface BroContext {
    /** One record for each column of cols, in their order: its key, its class for the styles. */
    readonly columns: BroColumnModel[];
  }
}

/** The measurement of a column in an aux row: the header with the full or the short titles, or the body. */
export interface BroColumnMeasure {
  /** The key of the measured column. */
  key: string;
  /** The width of the content of the cell, in px. */
  clientWidth: number;
  /** The width of the title in a header cell, of the content in a body cell, in px. */
  contentWidth?: number;
  /** The width that the layout of the columns gives the column, in px. */
  targetWidth: number;
  /** The left and right paddings of the measured cell, in px. */
  paddings: number;
}

/**
 * The records of the columns. A key that repeats gets the number of its repetition, as price-2, so two columns
 * of one field keep their own widths; whitespace in a key becomes a dash in its class.
 */
export function createColumns(cols: BroCol[]): BroColumnModel[] {
  const keys = new Set<string>();

  return cols.map((col, i) => {
    const base = col.name || col.sortKey || `${i + 1}`;
    let key = base;

    for (let n = 2; keys.has(key); n++) {
      key = `${base}-${n}`;
    }

    keys.add(key);

    return {col, key, className: `bro-col--${key.replace(/\s+/g, '-')}`};
  });
}

/**
 * Distributes a width of the table between the measured columns of the header and of the body, or of one of them while
 * the table measures its columns: the measurements take their target widths (layoutColumns). Nothing is measured here,
 * so a known new width of the table, such as the width next to an opened filter drawer, applies at once; the aux table
 * renders the widths afterwards (BroTableAux.renderColumnWidths).
 */
export function distributeColumnWidths(ctx: BroContext, tableBroWidth: number, kind?: 'thead' | 'tbody'): void {
  const {model, state} = ctx;

  model.columnsWidth = tableBroWidth;

  if (!kind) {
    if (model.theadCols) {
      distributeColumnWidths(ctx, tableBroWidth, 'thead');
    }

    if (model.tbodyCols) {
      distributeColumnWidths(ctx, tableBroWidth, 'tbody');
    }

    return;
  }

  const thead = (kind === 'thead');
  // The columns of the kind are measured right before they lay out
  const columns = <BroColumnMeasure[]>(thead ? model.theadCols : model.tbodyCols);

  // A column of a custom element, or of the skin element of its config, shows a component; a plain value does not
  const components = ctx.columns.map(({col}) => typeof col.component === 'string' || !!col.component?.selector);

  // A body column without a title keeps its own width
  const own = ctx.columns.map((_, i) => !thead && !!model.theadShortCols && !((model.theadCols?.[i]?.clientWidth ?? 0) > 0));
  // The least width of a column is its short title, or its full title when that is narrower, as a title of one word
  const least = model.theadShortCols?.map((short, i) => Math.min(short.targetWidth, model.theadCols?.[i]?.clientWidth || short.targetWidth));
  // The rules of the body size the header cells too, so a body column grows to its full title while the table has room
  const titles = thead ? undefined : model.theadCols?.map(col => col.clientWidth);

  layoutColumns(columns, tableBroWidth, least, components, own, titles).forEach((width, i) => {
    columns[i].targetWidth = width;
  });

  // The header of a table that shows no rows at its first widths waits for the widths that the rows give it
  if (thead && model.headerBeforeRows === undefined) {
    model.headerBeforeRows = !state.rows?.length;
  }
}

/**
 * The distribution of a width of the table between the measured columns of one kind, the header or the body, without
 * the DOM. The columns of components, such as buttons and switches, keep their own widths while together they take half
 * of the table or less, from the narrowest: a component would be cut, not shortened. The other columns go from
 * the narrowest too: while together they take half of what is left or less, each keeps its own width; the rest is shared
 * by the others at one level, each of them up to its own width. A column takes its least width at least. The width
 * that is left goes to the columns narrower than their full titles, at one level too: a title is cut only without room.
 * Returns the width of each column by its index.
 * @param columns - the measured columns
 * @param tableWidth - the width of the table to distribute
 * @param least - the least width of each column by its index: the width of its short or full title
 * @param components - whether each column, by its index, shows components
 * @param own - whether each column, by its index, keeps its own width, as a column without a title
 * @param titles - the width of the full title of each column by its index, for the columns of the body
 */
export function layoutColumns(columns: BroColumnMeasure[], tableWidth: number, least?: number[], components?: boolean[], own?: boolean[], titles?: number[]): number[] {
  const widths: number[] = [];

  // The width of the sort icon: the first difference between a header cell and its title; a body cell has none
  const iconWidth = columns.map(col => col.clientWidth - (col.contentWidth ?? col.clientWidth)).find(Boolean) ?? 0;

  const byWidth = (a: number, b: number) => columns[a].clientWidth - columns[b].clientWidth;
  const indexes = columns.map((_, i) => i);

  let fixedWidth = 0;

  indexes.filter(i => own?.[i]).forEach(i => {
    widths[i] = columns[i].clientWidth;
    fixedWidth += columns[i].clientWidth + columns[i].paddings;
  });

  // A column keeps its least width too: a component that fills its column, as a progress bar, has no width of its own
  const ownWidth = (i: number) => Math.max(columns[i].clientWidth, least?.[i] || 0);

  // The widest components that do not fit into half of the table share the rest with the other columns
  indexes.filter(i => components?.[i] && widths[i] === undefined).sort(byWidth).forEach(i => {
    const width = ownWidth(i) + columns[i].paddings;

    if (fixedWidth + width <= tableWidth / 2) {
      widths[i] = ownWidth(i);
      fixedWidth += width;
    }
  });

  const order = indexes.filter(i => widths[i] === undefined).sort(byWidth);
  const restWidth = tableWidth - fixedWidth;
  const halfWidth = restWidth / 2;

  let widthSum = 0;
  let shared = false;

  order.forEach((index, i) => {
    const col = columns[index];
    const previousSum = widthSum;

    widthSum += ownWidth(index) + col.paddings;

    if (widthSum <= halfWidth && !shared) {
      widths[index] = ownWidth(index);
    } else if (!shared) {
      // The columns of the share give their own paddings and icons: the last column has the space of the row at its
      // right too. Each column of the share takes its least width at least, and its own width at most
      const share = order.slice(i);
      const spaces = share.reduce((sum, item) => sum + iconWidth + columns[item].paddings, 0);
      const limits = share.map(item => ({min: least?.[item] || 0, max: columns[item].clientWidth}));

      shareWidths(limits, restWidth - previousSum - spaces).forEach((width, j) => widths[share[j]] = width);
      shared = true;
    }
  });

  // The columns narrower than their full titles share the width that is left
  const narrow = indexes.filter(i => (titles?.[i] ?? 0) > widths[i]);
  const freeWidth = tableWidth - indexes.reduce((sum, i) => sum + widths[i] + columns[i].paddings, 0);

  if (narrow.length && freeWidth > 0) {
    const limits = narrow.map(i => ({min: widths[i], max: <number>titles?.[i]}));
    const room = narrow.reduce((sum, i) => sum + widths[i], freeWidth);

    shareWidths(limits, room).forEach((width, j) => widths[narrow[j]] = width);
  }

  return widths;
}

/**
 * Shares a width between columns, each of them from its least to its largest width: they take one level, as far as
 * their limits let them, and the level fills the width exactly. A width below their least widths is shared by them,
 * so a table narrower than its short titles shortens them and keeps its width.
 */
function shareWidths(limits: {min: number; max: number}[], room: number): number[] {
  const widths = (level: number) => limits.map(({min, max}) => Math.max(min, Math.min(level, max)));
  const total = (level: number) => widths(level).reduce((sum, width) => sum + width, 0);
  const levels = [...new Set(limits.flatMap(({min, max}) => [min, max]))].sort((a, b) => a - b);
  const least = total(0);

  let level = 0;

  if (least >= room) {
    return limits.map(({min}) => least ? Math.max(0, room) * min / least : 0);
  }

  for (const next of levels) {
    if (total(next) >= room) {
      // Between the two levels the total grows by one pixel for every column that is still growing there
      const growing = limits.filter(({min, max}) => min <= level && max >= next).length;

      return widths(level + (room - total(level)) / growing);
    }

    level = next;
  }

  return widths(level);
}

/**
 * The row of the longest values: the longest value of each field of the rows, so the widths of the columns fit the
 * widest content. The longest value is not always the widest one: the aux table adds the difference for the plain
 * values (BroTableAux.widerValue). The row counter shows the widest number of its digits.
 * @param rows - the rows of the body, at least one
 * @param rowCounter - the table numbers its rows
 * @param total - the number of the rows that the counter counts up to
 */
export function longestValues(rows: BroRow[], rowCounter: boolean | undefined, total: number): BroRow {
  const longest: BroRow = {...rows[0]};

  rows.forEach(row => {
    for (const prop in longest) {
      if (rowCounter && prop === selectors.rowCounter) {
        continue;
      }

      // An empty value, undefined or null, is the shortest one: the cell shows nothing
      if (String(longest[prop] ?? '').length < String(row[prop] ?? '').length) {
        longest[prop] = row[prop];
      }
    }
  });

  if (rowCounter) {
    longest[selectors.rowCounter] = Math.pow(10, total.toString().length) - 1; // 9 | 99 | 999 | ...
  }

  return longest;
}

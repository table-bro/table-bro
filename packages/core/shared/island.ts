import type {BroContext}              from '../types/context';
import type {BroKineticParams}        from '../view/shared/animation';
import type {BroFrame}                from './frame';
import {selectors as sharedSelectors} from './shared-selectors';

/**
 * A row of the body as Island Details reads it: the members of the slot of the row (BroRowSlot) that the module needs,
 * without the table behind it.
 */
export interface BroIslandRow {
  /** The position of the row in the displayed rows, from 1. */
  readonly number: number;
  /** The row of the body table. */
  readonly tr: HTMLElement;
  /** The row of the aux table, with the height of the row and its open details; null without server details. */
  readonly auxTr: HTMLElement | null;
  /** The row of the details in the body table, while the details are in the tables. */
  readonly detailsTr: HTMLElement | null;
  /** The details are open or opening: the target of their animation is above 0. */
  readonly open: boolean;
}

/**
 * Island Details of one table as an extension of the layout of the body, as the layout calls it: only the signatures.
 * The module @table-bro-extended/island-details implements and describes them.
 */
export interface BroBodyLayoutExtension {
  /** The class that the layout adds to the class bro-table of the body table. */
  readonly bodyClassName: string;
  /**
   * The bottom border of the details cell under the class of the body table, in px: the details take it into their
   * height. Without an extension the layout takes 1.
   */
  readonly detailsBorderWidth: number;

  /**
   * A new body or a state in the container: the decorations of its rows. The rows from first to last are on the page.
   * @param container - the container of the decorations
   * @param rowsLength - the number of the rows of the body
   * @param first - the number of the first row of the page
   * @param last - the number of the last row of the page
   * @param height - the height of the window of a state in px
   */
  rowsRendered(container: HTMLElement, rowsLength: number, first: number, last: number, height?: number): void;
  /**
   * Rows that follow the rendered ones: the loaded rows of appendRows, or the empty rows of the last page from first to last.
   * @param from - the number of the first added row
   * @param count - the number of the added rows
   * @param first - the number of the first empty row of the last page
   * @param last - the number of the last empty row of the last page
   */
  rowsAdded(from: number, count: number, first?: number, last?: number): void;
  /**
   * The empty rows of the last page from the number on left the body.
   * @param from - the number of the first removed row
   * @param count - the number of the removed rows
   */
  rowsRemoved(from: number, count: number): void;
  /**
   * A new row of a body that changes in place.
   * @param row - the new row
   */
  rowAdded(row: BroIslandRow): void;
  /**
   * A row left the table.
   * @param row - the row that left the table
   */
  rowRemoved(row: BroIslandRow): void;
  /**
   * The rows of the body moved to their new order.
   * @param rowsLength - the number of the rows of the body
   */
  rowsMoved(rowsLength: number): void;
  /**
   * The details of a row have a new height.
   * @param row - the row of the details
   * @param detailsHeight - the new height of the details in px
   */
  rowResized(row: BroIslandRow, detailsHeight: number): void;
  /**
   * The details of the row left the tables. Optional: the layout calls it only when the extension has it.
   * @param row - the row of the details
   */
  detailsRemoved?(row: BroIslandRow): void;
  /** The rows changed in place: the window of the page sizes the decorations again. */
  windowReset(): void;
  /** A frame of the page scroll, or the rows that stand in the window of the page now. */
  windowMoved(): void;
  /** A row with its details, or the window of the page, changed its height while the rows stand. */
  heightsChanged(): void;

  /**
   * The full height of the gaps around the open details of the rows from first to last, as the target of their
   * animations: the body takes it into the height of the page.
   * @param first - the number of the first row
   * @param last - the number of the last row
   */
  gapsHeight(first: number, last: number): number;
  /**
   * The height of the gaps above a page that starts after the row number, as drawn now: the rows of the body move by it.
   * @param rowNumber - the number of the last row before the page
   */
  gapsBefore(rowNumber: number): number;

  /**
   * The details of the row open or close, in the phases of the update.
   * @param frame - the phases of the update
   * @param row - the row of the details
   */
  detailsToggled(frame: BroFrame, row: BroIslandRow): void;
  /** The rows of a body that changes in place are about to move: the openings and closings ended at their targets. */
  rowsChanging(): void;
  /** The rows of the body stand in their new order with their open details. */
  rowsChanged(): void;
}

/**
 * What a table gives Island Details: its rows, the window of the page, the motion and the sizes of the skin. The type is
 * written out, so the public types show the contract and not the context of the table behind it.
 */
export interface BroIslandTable {
  /** The row height, the size of an island space and the kinetic time constant of the skin, in px and ms. */
  readonly styles: Readonly<{
    /** The height of a body row, without its details. */
    rowHeight: number;
    /** The full height of a space around open details, as between the islands of the table. */
    islandSpaceSize: number;
    /** The time constant of the kinetic animations, the motion of the spaces among them. */
    kineticTimeConstant: number;
  }>;
  /** The class of a shadow of the skin; empty for a table without shadows. */
  readonly shadowClassName: string;
  /** The class of a cell of the body, for the cells of the spaces; empty when the skin has none. */
  readonly cellClassName: string;
  /** The number of the columns, the colspan of the cells of the spaces. */
  readonly colSpan: number;
  /** The class of the rows of the details in the tables. */
  readonly detailsClassName: string;
  /** Server details: their rows, and so the spaces, have rows in the aux table too. */
  readonly server: boolean;

  /** The rows of the body by their positions: the row number n at n - 1; none while the body shows a state. */
  rows(): BroIslandRow[];
  /** The heights of the rows of the body with their details as drawn now, in px, by their positions: the row number n at n - 1. */
  rowHeights(): number[];
  /**
   * The window, the visible part of the body: the offset of its top from the top of the first row and its height without
   * the space of the shadows, in px, and the number of the last row of the page.
   */
  window(): {
    /** The offset of the top of the window from the top of the first row, through the rows and the spaces. */
    top: number;
    /** The height of the window without the space of the shadows. */
    height: number;
    /** The number of the last row of the page. */
    lastRow: number;
  };
  /** The table of the header, or null before it renders. */
  headerTable(): HTMLElement | null;
  /** The element of the paginator, or null before it renders or without a paginator. */
  paginator(): HTMLElement | null;
  /**
   * Starts a kinetic animation of the table; a run with the same key replaces the previous one. With rowDetailsMotion:
   * 'eased' it is an eased run in the details duration of the skin.
   * @param key - the key of the animation, or null for an animation without a key
   * @param params - the parameters of the kinetic animation
   */
  animateKinetic(key: string | null, params: BroKineticParams): void;
}

/** The Island Details module: every table with rowDetailsIsland gets its own Island Details when it renders. */
export interface BroIslandDetailsModule {
  /**
   * Creates Island Details of one table; the controller of a table with rowDetailsIsland calls it once and extends the
   * layout of the body with the result.
   * @param table - what the table gives Island Details
   */
  create(table: BroIslandTable): BroBodyLayoutExtension;
}

/** The connected Island Details module; useIslandDetails() sets it. */
let islandDetails: BroIslandDetailsModule | null = null;

/**
 * Connects the Island Details module: every table with rowDetailsIsland that renders afterwards gets its own Island Details.
 * The module calls it when it is imported, as a skin calls registerSkin().
 * @group Rendering helpers
 */
export function useIslandDetails(impl: BroIslandDetailsModule): void {
  islandDetails = impl;
}

/** The connected Island Details module, if any. */
export function getIslandDetails(): BroIslandDetailsModule | null {
  return islandDetails;
}

/** What the table of the context gives Island Details. */
export function createIslandTable(ctx: BroContext): BroIslandTable {
  const {cols, config, styles, motion, model, state, view} = ctx;

  return {
    styles: Object.freeze({
      rowHeight: styles.rowHeight,
      islandSpaceSize: styles.islandSpaceSize,
      kineticTimeConstant: styles.kineticTimeConstant
    }),
    shadowClassName: config.css.shadow?.className ?? '',
    cellClassName: config.css.table?.tbody?.tr?.td?.className ?? '',
    colSpan: cols.length,
    detailsClassName: sharedSelectors.detailsTr,
    server: !!(config.rowDetailsComponent && config.rowDetailsServer),

    rows: () => model.slots?.list || [],
    rowHeights: () => model.rowHeights?.heights || [],

    window: () => ({
      top: Math.abs(view.scrollingContainer.top),
      height: view.bodyContainer.height - styles.shadowSize * 2,
      lastRow: state.pagination.page * state.pagination.pageSize
    }),

    headerTable: () => view.headerContainer?.tableEl || null,
    paginator: (): HTMLElement | null => view.paginator?.el || null,

    // The motion of the extension follows the details: kinetic, or in the details duration of the skin for eased details
    animateKinetic: (key: string | null, params: BroKineticParams) => (config.rowDetailsMotion === 'eased') ? motion.animate(key, {...params, duration: styles.detailsDuration, timing: styles.detailsEasing}) : motion.animateKinetic(key, params)
  };
}

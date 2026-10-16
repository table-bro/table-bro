import type {BroColumnMeasure}  from './columns';
import type {BroDetailsHeights} from './details';
import type {BroRowHeights}     from './row-heights';
import type {BroRowSlots}       from './row-slots';

declare module '../types/context' {
  interface BroContext {
    /** Geometry. */
    readonly model: BroModels;
  }
}

/**
 * Dynamic models. The body sets the heights of the rows and the slots when it renders, before anything reads them, so
 * the types name them as set; the details exist only with row details.
 */
export interface BroModels {
  rowHeights: BroRowHeights;
  /** The slots of the displayed rows of the body; empty while the body shows a state. */
  slots: BroRowSlots;
  details?: BroDetailsHeights;

  /** Empty rows that fill up the last page: they exist only in the DOM and the geometry, not in the row arrays. */
  emptyRows: number;

  /** The width of the host in px that the columns were laid out for last; 0 for a table measured while hidden. */
  columnsWidth?: number;
  /**
   * The width of the host that a filter drawer declared for the end of its transition, with the width it starts from,
   * the last width that the host had on the way and the time of it: the columns take it at once, also the columns of
   * rows that come during the transition, and the observer of the host does not lay them out again while the host moves.
   */
  declaredWidth?: {from: number; to: number; last: number; moved: number} | null;
  /** The header got its first widths while the table had no rows yet: the rows that come later move the header to their widths. */
  headerBeforeRows?: boolean;

  /** The measurements of the columns for their widths, by the index of the column in ctx.columns: the header with the full and with the short titles, and the body. */
  theadCols?: BroColumnMeasure[];
  theadShortCols?: BroColumnMeasure[];
  tbodyCols?: BroColumnMeasure[];
}

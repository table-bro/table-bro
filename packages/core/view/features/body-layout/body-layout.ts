import type {BroRowSlot}             from '../../../model/row-slots';
import type {BroFrame}               from '../../../shared/frame';
import type {BroBodyLayoutExtension} from '../../../shared/island';
import {cssRowsHeight}               from '../../../shared/styles';
import type {BroResolvedConfig}      from '../../../types/table-bro';

declare module '../../../types/context' {
  interface BroContext {
    /** The layout of the body: the only part that talks to Island Details. */
    readonly layout: BroBodyLayout;
  }
}

/**
 * The layout of the body: the gaps between the rows, the decorations of the rows and the window of the page. The rest
 * of the table tells it the facts: rows rendered, added, removed or moved, details toggled or resized, the window moved
 * or resized. Only the layout talks to an extension, Island Details: without one, the body has no gaps and one shadow
 * along the window of the page.
 */
export class BroBodyLayout {
  /** Island Details of this table, connected by the controller. */
  private extension: BroBodyLayoutExtension | null = null;
  /** The one shadow of the window of a body without an extension. */
  private windowShadow: HTMLElement | null = null;
  /** Inside heightsOnce(): whether a row changed its height meanwhile; null outside it. */
  private heightsHeld: boolean | null = null;

  constructor(private readonly config: BroResolvedConfig) {
  }

  extend(extension: BroBodyLayoutExtension): void {
    this.extension = extension;
  }

  /** The class of the body table. */
  get bodyClassName(): string {
    return this.extension ? `bro-table ${this.extension.bodyClassName}` : 'bro-table';
  }

  /** The bottom border of the details cell, in px: the details take it into their height. */
  get detailsBorderWidth(): number {
    return this.extension?.detailsBorderWidth ?? 1;
  }

  /**
   * A new body or a state in the container: the decorations of its rows. The rows from first to last are on the page;
   * the height is the height of the window of a state.
   */
  rowsRendered(container: HTMLElement, rowsLength: number, first: number, last: number, height?: number): void {
    if (this.extension) {
      this.extension.rowsRendered(container, rowsLength, first, last, height);

      return;
    }

    // The shadow exists also with shadowsEnabled: false; then it has no class and no size
    this.windowShadow = document.createElement('div');

    if (this.config.css.shadow?.className) {
      this.windowShadow.className = this.config.css.shadow.className;
    }

    // The prerender has no row height: the CSS computes the height of the page
    if (this.config.prerender) {
      this.windowShadow.style.height = cssRowsHeight(last - first + 1, false);
    } else if (height) {
      this.windowShadow.style.height = `${height}px`;
    }

    container.appendChild(this.windowShadow);
  }

  /** Rows that follow the rendered ones: the loaded rows of appendRows, or the empty rows of the last page from first to last. */
  rowsAdded(from: number, count: number, first?: number, last?: number): void {
    this.extension?.rowsAdded(from, count, first, last);
  }

  /** The empty rows of the last page from the number on left the body. */
  rowsRemoved(from: number, count: number): void {
    this.extension?.rowsRemoved(from, count);
  }

  /** A new row of a body that changes in place. */
  rowAdded(row: BroRowSlot): void {
    this.extension?.rowAdded(row);
  }

  /** A row left the table. */
  rowRemoved(row: BroRowSlot): void {
    this.extension?.rowRemoved(row);
  }

  /** The details of a row have a new height. */
  rowResized(row: BroRowSlot, detailsHeight: number): void {
    this.extension?.rowResized(row, detailsHeight);
  }

  /** The rows of a body that changes in place are about to move: the openings and closings ended at their targets. */
  rowsChanging(): void {
    this.extension?.rowsChanging();
  }

  /** The rows of the body moved to their new order. */
  rowsMoved(rowsLength: number): void {
    this.extension?.rowsMoved(rowsLength);
  }

  /** The rows of the body stand in their new order with their open details. */
  rowsChanged(): void {
    this.extension?.rowsChanged();
  }

  /** The details of the row open or close, in the phases of the update. */
  detailsToggled(frame: BroFrame, row: BroRowSlot): void {
    this.extension?.detailsToggled(frame, row);
  }

  /** The details of the row left the tables. */
  detailsRemoved(row: BroRowSlot): void {
    this.extension?.detailsRemoved?.(row);
  }

  /** The rows changed in place: the window of the page sizes the decorations again. */
  windowReset(): void {
    this.extension?.windowReset();
  }

  /** A frame of the page scroll, or the rows that stand in the window of the page now. */
  windowMoved(): void {
    this.extension?.windowMoved();
  }

  /** The window of the page has a new height, the body without the space of the shadows. */
  windowResized(height: number): void {
    if (this.windowShadow) {
      this.windowShadow.style.height = `${height}px`;
    }

    this.extension?.heightsChanged();
  }

  /** A row with its details changed its height while the rows stand. */
  heightsChanged(): void {
    if (this.heightsHeld !== null) {
      this.heightsHeld = true;

      return;
    }

    this.extension?.heightsChanged();
  }

  /**
   * Changes the heights of several rows and tells the extension once, after them: its result depends only on the
   * final heights.
   * @param change - the changes of the rows
   */
  heightsOnce(change: () => void): void {
    this.heightsHeld = false;

    change();

    const changed = this.heightsHeld;

    this.heightsHeld = null;

    if (changed) {
      this.extension?.heightsChanged();
    }
  }

  /** The full height of the gaps around the open details of the rows from first to last, as the target of their animations. */
  gapsHeight(first: number, last: number): number {
    return this.extension?.gapsHeight(first, last) ?? 0;
  }

  /** The height of the gaps above a page that starts after the row number, as drawn now. */
  gapsBefore(rowNumber: number): number {
    return this.extension?.gapsBefore(rowNumber) ?? 0;
  }
}

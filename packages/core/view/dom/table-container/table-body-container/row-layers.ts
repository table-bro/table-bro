import type {BroRowDetails, BroRowSlot} from '../../../../model/row-slots';
import {appObject}                      from '../../../../shared/app-objects';
import {selectors}                      from '../../../../table-bro-selectors';
import type {BroContext}                from '../../../../types/context';
import type {BroRowDetailsElement}      from '../../../../types/table-bro';

// The writes to the layers of a displayed row: its row in the body table, its row in the aux table and its details.
// The slot of the row (BroRowSlot) keeps the elements and the state; the views write the elements through these functions.

/** Writes the position of the row to all its layers. */
export function renderRowNumber(slot: BroRowSlot): void {
  [slot.tr, slot.auxTr, slot.details?.tr].forEach(el => {
    el?.setAttribute(selectors.rowNumberAttribute, `${slot.number}`);
  });

  // A row counts after the header row for screen readers
  slot.tr?.setAttribute('aria-rowindex', `${slot.number + 1}`);
}

/**
 * The kept row gets the row object of the new rows: open details and details that load show it too. The component
 * of open details is the child of the element of the table that opens them.
 */
export function renderRowObject(slot: BroRowSlot): void {
  [slot.details?.element.firstElementChild, slot.loadingDetails].forEach(element => {
    if (element) {
      (<HTMLElement & BroRowDetailsElement>element).row = appObject(slot.row);
    }
  });
}

/** Removes the row from all its layers, with its details. */
export function removeRow(ctx: BroContext, slot: BroRowSlot): void {
  slot.tr?.remove();
  slot.auxTr?.remove();
  ctx.layout.rowRemoved(slot);

  if (slot.details) {
    removeDetails(ctx, slot);
  }
}

/**
 * Writes a height of the details to all their layers, to the layout of the body and to the geometry.
 * @param ctx - the context of the table
 * @param slot - the slot of the row of the details
 * @param detailsHeight - the height of the details, without the border
 * @param border - the bottom border of the details cell, which the row takes in the table too
 */
export function resizeDetails(ctx: BroContext, slot: BroRowSlot, detailsHeight: number, border: number = 0): void {
  // Only open details and details on their way change their height
  const details = <BroRowDetails>slot.details;
  const height = `${detailsHeight}px`;

  details.tr.style.height = height;
  details.td.style.height = height;
  details.element.style.height = height;

  // The aux row keeps the rows of the aux table below it level with their rows
  if (slot.auxTr) {
    slot.auxTr.style.height = `${ctx.styles.rowHeight + detailsHeight + border}px`;
  }

  ctx.layout.rowResized(slot, detailsHeight);

  // The details move the gaps below them
  if (slot.setDrawnDetailsHeight(detailsHeight + border)) {
    ctx.layout.heightsChanged();
  }
}

/** Removes the closed details from the body table and the aux table; the row takes its own height again. */
export function removeDetails(ctx: BroContext, slot: BroRowSlot): void {
  // Only details in the tables leave them
  const details = <BroRowDetails>slot.details;

  details.tr.remove();

  if (slot.auxTr) {
    slot.auxTr.style.height = `${ctx.styles.rowHeight}px`;
  }

  if (slot.removeDetails()) {
    ctx.layout.heightsChanged();
  }

  ctx.layout.detailsRemoved(slot);
}

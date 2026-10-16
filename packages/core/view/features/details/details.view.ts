import type {BroRowDetails, BroRowSlot} from '../../../model/row-slots';
import type {BroFrame}                  from '../../../shared/frame';
import type {BroContext}                from '../../../types/context';
import type {BroRowDetailsElement}      from '../../../types/table-bro';
import type {BroView}                   from '../../../types/view';
import {removeDetails, resizeDetails}   from '../../dom/table-container/table-body-container/row-layers';
import {BroTrDetails}                   from './tr/tr-details.view';

/**
 * The details of the rows: their rows in the body table and in the aux table, their heights and their animations.
 * The layout of the body (ctx.layout) follows them.
 */
export class BroDetailsView implements BroView {
  private readonly tdBottomBorderWidth: number;

  /** The count of settle(): the running openings and closings of a smaller count skip their frames. */
  private settled: number = 0;

  constructor(protected readonly ctx: BroContext) {
    // The bottom border of the details cell, as the layout of the body gives it
    this.tdBottomBorderWidth = this.ctx.layout.detailsBorderWidth;
  }

  /**
   * Opens or closes the details of the row in the phases of the update: the rows go in first, their heights are read
   * with the other reads of the update, and the animations start after the dependent writes. The details of a row are
   * layers of the slot of the row: they are written through their references, and the details state lives in the slot.
   * An exception goes up to the update of the controller: a failed render shows the fail state, not half-opened details.
   */
  render(frame: BroFrame, slot: BroRowSlot, details?: HTMLElement): void {
    // Server details come out of the aux row visible
    if (details) {
      details.style.display = 'block';
    }

    slot.detailsHeight = !slot.detailsHeight ? 1 : 0;

    // Details that are still in the table, opening or closing, go on from the height they have
    const onAnimation = !!slot.details;

    // Closing details and details on their way are in the table
    if (slot.details) {
      slot.details.tr.setAttribute('data-action', !slot.detailsHeight ? 'collapse' : 'expand');
    }

    if (slot.detailsHeight && !onAnimation) {
      this.renderRows(slot, details);
    }

    // The layout of the body follows the details that open or close
    this.ctx.layout.detailsToggled(frame, slot);

    this.renderHeight(frame, slot, onAnimation);
  }

  /**
   * Ends the running openings and closings at their targets at once, before the rows of the body change in place.
   * Open details get their full height, closed ones leave the table, and the layout of the body takes away what it drew
   * between the rows until the rows stand in their new places: it knows the rows by their numbers.
   */
  settle(): void {
    this.settled++;

    this.ctx.layout.heightsOnce(() => this.ctx.model.slots.list.forEach(slot => {
      if (!slot.details) {
        return;
      }

      if (slot.detailsHeight) {
        resizeDetails(this.ctx, slot, slot.detailsHeight - this.tdBottomBorderWidth, this.tdBottomBorderWidth);
        slot.details.element.style.opacity = '1';
      } else {
        removeDetails(this.ctx, slot);
      }
    }));

    this.ctx.layout.rowsChanging();
  }

  /**
   * Opening details come into the body table: their row after the row of the slot, with server details moved into it.
   * The aux row of the slot grows with them (resizeDetails).
   */
  private renderRows(slot: BroRowSlot, details?: HTMLElement): void {
    const detailsTrNode = this.renderDetailsTr(slot, details);

    slot.tr.after(detailsTrNode);

    const td = <HTMLElement>detailsTrNode.children[0];

    if (details) {
      const row = (<HTMLElement & BroRowDetailsElement>details).row;

      td.children[0].appendChild(details); // `details` changes its place in the DOM, into the element of the table

      if (!(<HTMLElement & BroRowDetailsElement>details).row) { // relevant at least for Angular framework which recreates custom element from scratch in this case
        (<HTMLElement & BroRowDetailsElement>details).row = row;
        details.setAttribute('server', false.toString());
      }
    }

    slot.details = {tr: detailsTrNode, td, element: <HTMLElement>td.children[0]};
  }

  /**
   * The height of the details in the tables: it is read with the other reads of the update, and the details move from
   * the height they have to their target, with their opacity.
   * @param frame - the frame of the update
   * @param slot - the slot of the row of the details
   * @param onAnimation - the details were in the table, opening or closing
   */
  private renderHeight(frame: BroFrame, slot: BroRowSlot, onAnimation: boolean): void {
    const {config, styles, motion} = this.ctx;

    // The details are in the table now: they were there, or they came in above
    const rowDetails = <BroRowDetails>slot.details;
    const detailsTr = rowDetails.tr;
    const details = rowDetails.element;

    // The reads of the layout wait for the other writes of the update and come with them, in one layout
    let detailsHeight: number;
    let previousDetailsOpacity: number;

    frame.read(() => {
      detailsHeight = details.clientHeight;
      previousDetailsOpacity = parseFloat(getComputedStyle(details).opacity);
    });

    // The height of opened details stays on their element for the next opening; details are not lower than a row
    frame.write(() => {
      if (!details.getAttribute('data-height')) {
        details.setAttribute('data-height', Math.max(detailsHeight + this.tdBottomBorderWidth, styles.rowHeight) + '');
      }

      if (slot.detailsHeight === 1) {
        slot.detailsHeight = +<string>details.getAttribute('data-height');
      }

      // New details start closed in this frame: the motion draws from the next one, and server details come rendered
      if (slot.detailsHeight && !onAnimation) {
        resizeDetails(this.ctx, slot, 0, this.tdBottomBorderWidth);
      }
    });

    frame.animate(() => {
      const targetDetailsHeight = slot.detailsHeight - (slot.detailsHeight ? this.tdBottomBorderWidth : 0);
      const previousDetailsHeight = (slot.detailsHeight && !onAnimation) ? 0 : detailsHeight;

      const targetDetailsOpacity: number = (slot.detailsHeight) ? 1 : 0;

      // Eased details open in the details duration of the skin, with the body and the layout of the body
      const eased = (config.rowDetailsMotion === 'eased');

      /** Details row */
      motion[eased ? 'animate' : 'animateKinetic'](null, {
        label: 'details',
        duration: eased ? styles.detailsDuration : styles.kineticTimeConstant,
        timing: styles.detailsEasing,
        distance: targetDetailsHeight - previousDetailsHeight,
        draw: timingProgress => {
          const detailsHeight = previousDetailsHeight + (targetDetailsHeight - previousDetailsHeight) * timingProgress;

          /** Table rows, Table Aux rows, Shadow rows */
          resizeDetails(this.ctx, slot, detailsHeight, this.tdBottomBorderWidth);
          details.style.opacity = previousDetailsOpacity + (targetDetailsOpacity - previousDetailsOpacity) * timingProgress + '';
        },
        // The cleanup of a collapse runs at the end and also after an exception in draw; a skipped track leaves the rows
        onEnd: reason => {
          if (reason !== 'done' && reason !== 'error') {
            return;
          }

          if (!slot.detailsHeight) {
            /** Table rows, Table Aux rows */
            removeDetails(this.ctx, slot);
          }
        },
        skip: this.skip(detailsTr)
      });
    });
  }

  /**
   * A track of a layer ends without its cleanup when a newer click changes the action of the layer, or when settle()
   * ends all openings and closings at their targets.
   */
  private skip(tr: HTMLElement): () => boolean {
    const action = tr.getAttribute('data-action');
    const settled = this.settled;

    return () => tr.getAttribute('data-action') !== action || this.settled !== settled;
  }

  private renderDetailsTr(slot: BroRowSlot, details?: HTMLElement): HTMLElement {
    return new BroTrDetails(this.ctx, slot.row).render(slot.number, slot.id, details);
  }
}

import type {BroPagination}                          from '../../../../model/pagination';
import type {BroRowSlot, BroRowSlots}                from '../../../../model/row-slots';
import type {BroFrame}                               from '../../../../shared/frame';
import {BroHTML}                                     from '../../../../shared/html';
import {keepFocus}                                   from '../../../../shared/interaction';
import {cssRowsHeight}                               from '../../../../shared/styles';
import {selectors}                                   from '../../../../table-bro-selectors';
import type {BroContext}                             from '../../../../types/context';
import type {BroRow}                                 from '../../../../types/table-bro';
import type {BroView}                                from '../../../../types/view';
import {removeRow, renderRowNumber, renderRowObject} from './row-layers';
import {BroTableBodyScrollingContainer}              from './scrolling-container/table-body-scrolling-container.view';
import {BroTableBodyShadowContainer}                 from './shadow-container/table-body-shadow-container.view';

const {createElement} = BroHTML;

export class BroTableBodyContainer implements BroView {
  selector = selectors.tableBodyContainer;

  template(): string {
    return `
      <div class="${this.selector} ${selectors.shadow}"></div>`;
  }

  el!: HTMLElement;

  /** The height of the element in px, as this view last wrote it. */
  height: number = 0;

  /** The scrolling container of the rows and the container of the shadows of this body. */
  private scrollingContainer!: BroTableBodyScrollingContainer;
  private shadowContainer!: BroTableBodyShadowContainer;

  constructor(protected readonly ctx: BroContext,
              readonly rows: BroRow[] | null | undefined) {
  }

  render(): HTMLElement {
    const {view} = this.ctx;

    this.el = createElement(this.template());

    this.scrollingContainer = new BroTableBodyScrollingContainer(this.ctx, this.rows);
    view.scrollingContainer = this.scrollingContainer;

    this.el.appendChild(
      this.scrollingContainer.render()
    );

    return this.el;
  }

  /** The pagination of the state: new rows that keep the body bring a new one. */
  private get pagination(): BroPagination {
    return this.ctx.state.pagination;
  }

  /** The rows of the body, called only from BroBodyController.renderTable(): the controller has the slots of the rows ready. */
  renderTable(frame: BroFrame): void {
    this.scrollingContainer.renderTable(frame);
  }

  /**
   * The shadows of the body and its height, after the rows, called only from BroBodyController.renderTable(): the geometry
   * has the rows already. Right after this method the controller fills the last page with empty rows.
   */
  renderShadows(): void {
    // The shadow container exists also with shadowsEnabled: false; then its shadows have no class and no size
    this.shadowContainer = new BroTableBodyShadowContainer(this.ctx, this.rows?.length ?? 0);
    this.ctx.view.shadowContainer = this.shadowContainer;

    this.el.appendChild(
      this.shadowContainer.render()
    );

    this.setHeight();
  }

  /** The shadows of a state in place of the shadows of the rows: one row of the height of the state. */
  renderStateShadows(pagination: BroPagination, height: number): void {
    const previous = this.shadowContainer;

    // The shadow container exists also with shadowsEnabled: false; then its shadows have no class and no size
    this.shadowContainer = new BroTableBodyShadowContainer(this.ctx, 1, pagination);
    this.ctx.view.shadowContainer = this.shadowContainer;

    this.shadowContainer.replace(previous, height);
  }

  /** The rows of the gone keys leave with all their layers while they are still displayed. */
  removeRows(slots: BroRowSlot[]): void {
    slots.forEach(slot => removeRow(this.ctx, slot));
  }

  /**
   * New rows in a body that shows rows, in place, after the slots took them (BroRowSlots.apply): the kept rows get their
   * new numbers and row objects, a kept row with a new row object renders its cells again, new keys get new rows, and in
   * each layer only the rows out of the longest run in their previous order move. Called only from
   * BroBodyController.renderRows(), which writes the geometry, the gaps, the empty rows and the heights afterwards.
   */
  renderRows(frame: BroFrame, rowsLength: number, {added, moved, changed, renumbered}: ReturnType<BroRowSlots['apply']>): void {
    const {model} = this.ctx;
    const {tbody, tbodyAux} = this.scrollingContainer;

    renumbered.forEach(slot => renderRowNumber(slot));
    changed.forEach(slot => renderRowObject(slot));

    // A kept row with a new row object renders its cells again, in its place; a row whose server details load keeps
    // saying so to its new details button
    changed.forEach(slot => {
      const tr = slot.tr;
      const newTr = tbody.renderRow(slot, frame);

      if (slot.progressBar) {
        newTr.setAttribute('data-action', 'expand');
      }

      keepFocus(tr, () => {
        tr.replaceWith(newTr);

        return newTr;
      });
    });

    added.forEach(slot => {
      tbody.renderRow(slot, frame);
      tbodyAux.renderRow(slot);
      this.shadowContainer.renderRow(slot);
    });

    const staying = (slot: BroRowSlot): boolean => !added.has(slot) && !moved.has(slot);

    placeRows(tbody.el, model.slots.list, staying, slot => [slot.tr, slot.details?.tr]);

    // Only the tables with server details have aux rows
    if (model.slots.list[0]?.auxTr) {
      placeRows(tbodyAux.el, model.slots.list, staying, slot => [slot.auxTr]);
    }

    this.shadowContainer.remap(rowsLength);
  }

  setHeight(animateHeight?: boolean, animateKinetic: boolean = true): void {
    const {styles, motion} = this.ctx;

    const targetHeight = this.calcHeight();

    if (!animateHeight) {
      this.writeHeight(targetHeight);

      return;
    }

    const previousHeight = this.height;

    if (previousHeight !== targetHeight) {
      const params = {
        distance: targetHeight - previousHeight,
        draw: (progress: number) => {
          this.writeHeight(previousHeight + (targetHeight - previousHeight) * progress);
        }
      };

      if (animateKinetic) {
        motion.animateKinetic('body-height', {...params, duration: styles.kineticTimeConstant});
      } else {
        motion.animate('body-height', {...params, duration: styles.detailsDuration, timing: styles.detailsEasing});
      }
    } else {
      // The body has the height already: an animation to an earlier target, as of details that open in the same frame
      // as a page change, ends where the body is
      motion.cancel('body-height');
    }
  }

  calcHeight(): number {
    const {config, styles, model} = this.ctx;

    let tableHeight = styles.rowHeight * this.pagination.pageSize;

    if (config.rowDetailsComponent && model.details) {
      tableHeight += model.details.calcExpandedDetailsHeight();
    }

    if (config.shadowsEnabled) {
      tableHeight += styles.shadowSize * 2;
    }

    return tableHeight;
  }

  getTableBodyHeight(): number {
    let tableBodyHeight = this.calcHeight();

    if (this.ctx.config.shadowsEnabled) {
      tableBodyHeight -= this.ctx.styles.shadowSize * 2;
    }

    return tableBodyHeight;
  }

  /**
   * Only this view writes the height of the element, so it keeps the value: the page scroll reads it in every frame
   * without a layout of the page, and the next animation starts from it.
   */
  private writeHeight(height: number): void {
    this.height = height;

    // The prerender has no row height: the CSS computes the height of the page, and the window shadow has it already
    if (this.ctx.config.prerender) {
      this.el.style.height = cssRowsHeight(this.pagination.pageSize, true);

      return;
    }

    this.el.style.height = `${height}px`;

    // The window of the page moves its bottom edge: the layout of the body follows it
    this.ctx.layout.windowResized(height - this.ctx.styles.shadowSize * 2);
  }
}

/**
 * Puts the layer elements of the slots into their container in the order of the slots. The elements of the staying
 * slots are in that order already, so only the others go in, each before the elements of the slot that follows it.
 * @param container - the element of the layer, as the body of the body table
 * @param slots - the slots of the rows in their new order
 * @param staying - whether the elements of a slot stay where they are
 * @param layers - the elements of a slot in the layer, in their order; a missing one is left out
 */
function placeRows(container: HTMLElement, slots: BroRowSlot[], staying: (slot: BroRowSlot) => boolean, layers: (slot: BroRowSlot) => (HTMLElement | null | undefined)[]): void {
  let next: HTMLElement | null = null;

  for (let i = slots.length - 1; i >= 0; i--) {
    const elements = layers(slots[i]).filter((el): el is HTMLElement => !!el);

    if (!staying(slots[i])) {
      elements.forEach(el => container.insertBefore(el, next));
    }

    // A slot without elements in the layer, as a row without a shadow, leaves the next element as it is
    next = elements[0] || next;
  }
}

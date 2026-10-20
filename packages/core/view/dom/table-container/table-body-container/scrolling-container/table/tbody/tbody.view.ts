import {type BroRowSlot, emptyRow}                    from '../../../../../../../model/row-slots';
import type {BroFrame}                                from '../../../../../../../shared/frame';
import {BroHTML, classAttr}                           from '../../../../../../../shared/html';
import {focusableSelector}                            from '../../../../../../../shared/interaction';
import {selectors}                                    from '../../../../../../../shared/shared-selectors';
import type {BroContext}                              from '../../../../../../../types/context';
import type {BroCol, BroRow, BroStateName}            from '../../../../../../../types/table-bro';
import type {BroView}                                 from '../../../../../../../types/view';
import {type BroDetailsButton, detailsButtonSelector} from '../../../../../../features/details/details-button.view';
import {BroStateView}                                 from '../../../../../../features/state/state.view';
import {BroTbodyTr}                                   from './tr/tr.view';

const {escape} = BroHTML;

export class BroTbody implements BroView {
  template(): string {
    return `<tbody ${classAttr(this.ctx.config.css.table?.tbody?.className)} role="rowgroup"></tbody>`;
  }

  el!: HTMLElement;

  /** The state shown in this body, if any: it is rendered again with the icons of a new theme. */
  private shownState: {name: BroStateName; height: number} | null = null;
  /** The empty rows that fill up the last page. */
  private emptyRowEls: HTMLElement[] = [];
  /** The tabindex, or null for none, of the elements that the body took out of the tab order with the rows of other pages. */
  private readonly tabIndexes = new WeakMap<Element, string | null>();

  /**
   * @param ctx - the context of the table
   * @param cols - the row columns; the auxiliary details body passes one column of the full width
   * @param rows - the rows of the body
   * @param layer - the layer of the slots that the rows of this body are: the rows of the body table or of the aux table
   */
  constructor(protected readonly ctx: BroContext,
              private readonly cols: BroCol[],
              private rows: BroRow[] | null | undefined,
              private readonly layer?: 'tr' | 'auxTr') {
  }

  /**
   * @param frame - the frame of the update for the body table; the aux table renders without one
   */
  render(frame?: BroFrame): HTMLElement {
    this.el = this.ctx.dom.createFromHTML(this.template());

    if (this.rows?.length) {
      this.rows.forEach((row, i) => {
        const rowNumber = (i + 1);

        this.el.appendChild(
          this.renderRow(<BroRowSlot>this.ctx.model.slots.get(rowNumber), frame)
        );
      });
    }

    return this.el;
  }

  /**
   * @param loadedRows - the copies of the rows of appendRows
   * @param from - the rows before the loaded ones
   * @param frame - the frame of the update for the body table; the aux table renders without one
   */
  renderLoadedRows(loadedRows: BroRow[], from: number, frame?: BroFrame): void {
    this.shownState = null;

    for (let i = 0; i < loadedRows.length; i++) {
      const rowNumber = from + (i + 1);

      this.el.appendChild(
        this.renderRow(<BroRowSlot>this.ctx.model.slots.get(rowNumber), frame)
      );
    }
  }

  /** Renders the row of a slot as the layer of this body and puts it into the slot; the caller puts it into the body. */
  renderRow(slot: BroRowSlot, frame?: BroFrame): HTMLElement {
    const tr = new BroTbodyTr(this.ctx, this.cols, slot.row, slot.valueWidths).render(slot.number, undefined, frame);

    if (this.layer) {
      slot[this.layer] = tr;
    }

    return tr;
  }

  /**
   * Empty rows fill up the last page; the row arrays do not contain them.
   */
  renderEmptyRows(emptyRowsToAdd: number): void {
    // Empty rows get no data-row-number: only real rows are numbered in the DOM
    for (let i = 0; i < emptyRowsToAdd; i++) {
      const tr = new BroTbodyTr(this.ctx, this.cols, emptyRow).render();

      this.emptyRowEls.push(tr);
      this.el.appendChild(tr);
    }
  }

  removeEmptyRows(): void {
    this.emptyRowEls.forEach(tr => tr.remove());
    this.emptyRowEls = [];
  }

  /** Shows a state with its icon and its message, and gives the message for screen readers. */
  renderState(name: BroStateName, tableBodyContainerHeight: number): string {
    this.el.innerHTML = '';
    this.emptyRowEls = [];

    const tr = new BroTbodyTr(this.ctx, this.cols, null).render(undefined, tableBodyContainerHeight);

    this.el.appendChild(tr);

    // The row of a state has one cell of the full width
    const td = <HTMLElement>tr.firstElementChild;

    td.classList.add(selectors.state);

    const broState = new BroStateView(this.ctx);
    const components = this.ctx.config.components;

    const states = (this.ctx.themeService.theme === 'dark' && components.state.statesDark) || components.state.states;
    // A skin without its own state of no rows found shows the icon of no data
    const [icon, skinMessage] = states[name] ?? [states['no-data'][0], 'No records found'];
    let iconHTML: string;

    if (components.state.fontIcon && components.fontIcon) {
      iconHTML = components.fontIcon.html(icon);
    } else if (components.state.lottie && components.state.lottieHTML) {
      iconHTML = components.state.lottieHTML(icon);
    } else {
      // The message of the state names the state: the icon, an emoji of the skin, stays silent
      iconHTML = `<span class="bro-state-icon" aria-hidden="true">${icon}</span>`;
    }

    // The message of the texts of the config, else the one of the skin
    const message = this.ctx.config.texts.states[name] ?? skinMessage;

    td.append(
      broState.render(iconHTML, escape(message))
    );

    broState.renderAnimation();

    this.shownState = {name, height: tableBodyContainerHeight};

    return message;
  }

  /** Renders the shown state again, for example with the icons of a new theme. */
  renderShownState(): void {
    if (this.shownState) {
      this.renderState(this.shownState.name, this.shownState.height);
    }
  }

  /** A row whose server details load keeps saying so: a details button that the row renders again reads the loading from it. */
  renderDetailsLoading(slot: BroRowSlot, loading: boolean): void {
    if (loading) {
      slot.tr.setAttribute('data-action', 'expand');
    } else {
      slot.tr.removeAttribute('data-action');
    }
  }

  /** The details button of the row shows whether its details are open or load; a row rendered again has a new button. */
  renderDetailsButton(slot: BroRowSlot, open: boolean = slot.open): void {
    slot.tr.querySelector<BroDetailsButton>(detailsButtonSelector)?.renderDetailsState(open);
  }

  /**
   * The rows of the current page are the rows of the table for the keyboard and for screen readers: the rows of the other
   * pages, which the body keeps for its page scroll, are hidden from screen readers and their elements take no focus.
   * An element that the body takes out of the tab order gets its own tabindex back on its page, and an element that the
   * application took out itself stays out. The rows count by their numbers, so a row of details belongs to its row and
   * does not shift the page. Only the rows that come onto the page or leave it change: a page change touches the rows
   * of two pages, not all the rows of the body.
   * @param slots - the slots of the rows of the body
   * @param first - the number of the first row of the page
   * @param last - the number of the last row of the page
   */
  renderPage(slots: BroRowSlot[], first: number, last: number): void {
    const selector = focusableSelector;

    slots.forEach(slot => {
      const onPage = (first <= slot.number && slot.number <= last);

      [slot.tr, slot.details?.tr].forEach(row => {
        // A row on its page has no aria-hidden, a row of another page has it
        if (!row || onPage !== row.hasAttribute('aria-hidden')) {
          return;
        }

        if (onPage) {
          row.removeAttribute('aria-hidden');

          row.querySelectorAll('[tabindex="-1"]').forEach(el => {
            if (this.tabIndexes.has(el)) {
              const tabIndex = this.tabIndexes.get(el);

              if (tabIndex === null) {
                el.removeAttribute('tabindex');
              } else {
                el.setAttribute('tabindex', <string>tabIndex);
              }

              this.tabIndexes.delete(el);
            }
          });
        } else {
          row.setAttribute('aria-hidden', 'true');

          // An element that the table hid already keeps the tabindex it had before: the selector finds it again
          row.querySelectorAll(selector).forEach(el => {
            if (!this.tabIndexes.has(el)) {
              this.tabIndexes.set(el, el.getAttribute('tabindex'));
            }

            el.setAttribute('tabindex', '-1');
          });
        }
      });
    });
  }
}

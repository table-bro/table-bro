import {longestValues}                        from '../../../../../../../model/columns';
import type {BroRowSlot}                      from '../../../../../../../model/row-slots';
import type {BroContext}                      from '../../../../../../../types/context';
import type {BroCol, BroProgressMode, BroRow} from '../../../../../../../types/table-bro';
import type {BroView}                         from '../../../../../../../types/view';
import {BroTdDetails}                         from '../../../../../../features/details/tr/td/td-details.view';
import {BroTbody}                             from '../../table/tbody/tbody.view';
import {BroTdContent}                         from '../../table/tbody/tr/td/content/td-content.view';
import {BroTbodyTr}                           from '../../table/tbody/tr/tr.view';

export class BroTbodyAux implements BroView {
  template(): string {
    return '<tbody></tbody>';
  }

  el!: HTMLElement;
  /** The body with the row of the longest values, kept before the aux rows until the widths of the body are measured. */
  measureEl: HTMLElement | null = null;

  private tbody!: BroTbody;

  /** The aux rows keep the progress and the loading of server details over their rows: only these tables have them. */
  private readonly server: boolean;

  constructor(protected readonly ctx: BroContext,
              private rows: BroRow[] | null | undefined) {
    this.server = !!(ctx.config.rowDetailsComponent && ctx.config.rowDetailsServer);
  }

  /** The first body: the row of the longest values, in the place of the aux rows until they come (renderTable). */
  render(): HTMLElement {
    this.el = this.renderMeasureBody();

    return this.el;
  }

  /** The values of a field in the rows of the row of the longest values, as text, as the cells show them. */
  values(name: string): string[] {
    return (this.rows ?? []).map(row => String(row[name] ?? ''));
  }

  renderTable(rows: BroRow[]): void {
    this.rows = rows;

    const colsAux: BroCol[] = [{
      title: '',
      colSpan: this.ctx.cols.length
    }];

    this.tbody = new BroTbody(this.ctx, colsAux, this.server ? this.rows : [], 'auxTr');

    const tbodyEl = this.tbody.render();

    // The row of the longest values stays until its measurement, before the aux rows
    if (this.el === this.measureEl) {
      this.el.after(tbodyEl);
    } else {
      this.el.replaceWith(tbodyEl);
    }

    this.el = tbodyEl;
  }

  /**
   * A new row of the longest values for new rows in a body that keeps its rows, before the aux rows: the body measures
   * the widths of its columns again.
   */
  replaceMeasureRow(rows: BroRow[]): void {
    this.rows = rows;

    this.el.before(this.renderMeasureBody());
  }

  /** Removes the row of the longest values once the widths of the body are measured, or at once when they are not. */
  removeMeasureRow(): void {
    if (this.measureEl && this.measureEl !== this.el) {
      this.measureEl.remove();
    }

    this.measureEl = null;
  }

  renderLoadedRows(loadedRows: BroRow[], from: number): void {
    if (this.server) {
      this.tbody.renderLoadedRows(loadedRows, from);
    }
  }

  /** The aux row of a new slot of a table with server details; the caller puts it into the body. */
  renderRow(slot: BroRowSlot): void {
    if (this.server) {
      this.tbody.renderRow(slot);
    }
  }

  renderEmptyRows(emptyRowsToAdd: number): void {
    if (this.server) {
      this.tbody.renderEmptyRows(emptyRowsToAdd);
    }
  }

  removeEmptyRows(): void {
    this.tbody.removeEmptyRows();
  }

  /** The progress of server details goes into the aux row of their row, in its slot. */
  renderProgressBar(slot: BroRowSlot, mode?: BroProgressMode): void {
    mode = mode || 'indeterminate';

    const col: BroCol = {
      title: '',
      component: {
        selector: this.ctx.config.components.progressBar.selector,
        attrs: {
          mode: mode
        }
      }
    };

    slot.progressBar = <HTMLElement>new BroTdContent(this.ctx, col, {}).render();

    (<HTMLElement>slot.auxTr).children[0].append(slot.progressBar);
  }

  renderProgressBarValue(slot: BroRowSlot, progress: number): void {
    slot.progressBar?.setAttribute('value', (progress * 100).toFixed(0));
  }

  /** The element of the server details of the row, before it loads: the table listens to its loading first. */
  createServerDetails(slot: BroRowSlot): HTMLElement {
    const {config} = this.ctx;

    return BroTdDetails.createDetails(<string>config.rowDetailsComponent, slot.row, !!config.rowDetailsServer);
  }

  /** Server details load hidden in the aux row of their row; a component that ends its loading as soon as it connects shows them at once. */
  renderServerDetails(slot: BroRowSlot, details: HTMLElement): void {
    details.style.display = 'none';
    (<HTMLElement>slot.auxTr).children[0].append(details);
  }

  /** Server details whose loading failed leave the aux row: the next opening loads new ones. */
  unrenderServerDetails(details: HTMLElement): void {
    details.remove();
  }

  /**
   * The progress of loaded details fades in the motion of their opening, from its first frame, and three times as fast:
   * a kinetic fade is 95% gone in one time constant, while the details still open. A kinetic fade passes the row height
   * as its distance: the details open at least that high, so the fade does not hold their motion longer.
   * The fade writes the opacity in every frame. A transition of the component on its opacity, as the 250ms one of
   * Angular Material, would start again from every write and keep the progress almost opaque, so the fade turns it off.
   */
  unrenderProgressBar(slot: BroRowSlot) {
    const {config, styles, motion} = this.ctx;
    // Only the progress of details that load fades
    const progressBar = <HTMLElement>slot.progressBar;

    slot.progressBar = null;
    progressBar.style.transition = 'none';

    const eased = (config.rowDetailsMotion === 'eased');

    motion[eased ? 'animate' : 'animateKinetic'](null, {
      label: 'details-progress',
      duration: eased ? styles.detailsDuration : styles.kineticTimeConstant,
      timing: styles.detailsEasing,
      distance: styles.rowHeight,
      draw: timingProgress => {
        const progress = (1 - timingProgress) ** 3;

        progressBar.style.opacity = progress + '';

        if (timingProgress === 1) {
          progressBar.remove();
        }
      }
    });
  }

  /**
   * Builds the body of the row of the longest values (longestValues), so the widths fit the widest content, and keeps it
   * as the body to measure; rows without values give an empty body.
   */
  private renderMeasureBody(): HTMLElement {
    const {cols, config, state} = this.ctx;

    this.measureEl = new BroTbody(this.ctx, cols, []).render();

    if (this.rows?.length) {
      const total = (config.server ? state.pagination.total : this.rows.length) || 0;

      this.measureEl.appendChild(
        new BroTbodyTr(this.ctx, cols, longestValues(this.rows, config.rowCounter, total)).render(1)
      );
    }

    return this.measureEl;
  }
}

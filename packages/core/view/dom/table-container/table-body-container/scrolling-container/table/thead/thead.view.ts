import {BroHTML, classAttr}      from '../../../../../../../shared/html';
import type {BroContext}         from '../../../../../../../types/context';
import type {BroCol, BroColSort} from '../../../../../../../types/table-bro';
import type {BroView}            from '../../../../../../../types/view';
import {BroProgressTheadTr}      from '../../../../../../features/state/progress/tr/tr.view';
import {easeInOutSine}           from '../../../../../../shared/animation';
import {BroTheadTr}              from './tr/tr.view';

const {createElement} = BroHTML;

export class BroThead implements BroView {
  template(): string {
    return `
      <thead ${classAttr(this.ctx.config.css.table?.thead?.className)} role="rowgroup"></thead>`;
  }

  el!: HTMLElement;

  private progressTrEl: HTMLElement | null = null;
  /** The row of the titles. */
  private rowEl: HTMLElement | null = null;
  /** Whether the progress shows or comes in; a progress that fades out does not show. */
  private progressShown: boolean = false;

  constructor(protected readonly ctx: BroContext,
              private readonly cols: BroCol[] = ctx.cols) {
  }

  /** The head of the header table; the body table has none, the header container shows the head. */
  render(): HTMLElement {
    this.el = createElement(this.template());

    return this.el;
  }

  /**
   * Passes the active sort to the sort headers: the header of another column resets its arrow. The header cell of the
   * sorted column tells screen readers the direction with aria-sort.
   */
  renderActiveSort(sort: BroColSort): void {
    this.ctx.columns.forEach(({col, headerCell, sortHeader}) => {
      if (sortHeader) {
        sortHeader.activeSort = sort;
      }

      if (sort?.sortDirection && sort.sortKey === (col.sortKey || col.name)) {
        headerCell?.setAttribute('aria-sort', (sort.sortDirection === 'asc') ? 'ascending' : 'descending');
      } else {
        headerCell?.removeAttribute('aria-sort');
      }
    });
  }

  /** The row of the titles shows once the body has rows. */
  showRow(): void {
    (<HTMLElement>this.el.firstElementChild).style.visibility = 'visible';
  }

  renderRow(cols: BroCol[]): void {
    cols = cols || this.cols;

    this.rowEl = new BroTheadTr(this.ctx, cols, true).render();

    this.el.appendChild(this.rowEl);
  }

  /** Removes the row of the titles, for a header that renders it again. */
  removeRow(): void {
    this.rowEl?.remove();
    this.rowEl = null;
  }

  /**
   * Shows the progress in the header or fades it out; the same value again changes nothing.
   */
  renderProgress(shown: boolean): void {
    if (shown === this.progressShown) {
      return;
    }

    this.progressShown = shown;

    if (shown) {
      this.renderProgressTr();
    } else {
      this.unrenderProgress();
    }
  }

  unrenderProgressTr() {
    this.progressTrEl?.remove();
  }

  private renderProgressTr(): void {
    if (this.progressTrEl) {
      this.ctx.motion.cancel('thead-progress');
      this.unrenderProgressTr();
    }

    const progressTheadTr = new BroProgressTheadTr(this.ctx, this.cols);

    this.el.appendChild(progressTheadTr.render());

    this.progressTrEl = progressTheadTr.el;
  }

  /**
   * The progress of the header fades out in the time of the details, eased; the progress of server details fades in the
   * motion of their opening instead (BroTbodyAux.unrenderProgressBar).
   */
  private unrenderProgress(): void {
    if (!this.progressTrEl) {
      return;
    }

    const progressTrEl = this.progressTrEl;

    this.ctx.motion.animate('thead-progress', {
      duration: this.ctx.styles.detailsDuration,
      timing: easeInOutSine,
      draw: timingProgress => {
        const progress = (1 - timingProgress);

        progressTrEl.style.opacity = progress + '';

        if (timingProgress === 1) {
          this.unrenderProgressTr();
          this.progressTrEl = null;
        }
      }
    });
  }
}

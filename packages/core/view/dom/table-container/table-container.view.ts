import {cssNumber}                  from '../../../shared/styles';
import type {BroContext}            from '../../../types/context';
import type {BroView}               from '../../../types/view';
import type {BroTableBodyContainer} from './table-body-container/table-body-container.view';

/**
 * The table for screen readers: one element with the role table around the containers of the header and of the body,
 * whose HTML tables are presentational. Without it a screen reader met two tables and no column headers.
 * The title of the toolbar names the table.
 */
export class BroTableContainer implements BroView {
  template(): string {
    return `
      <div class="bro-table_container" role="table"></div>`;
  }

  el!: HTMLElement;

  constructor(protected readonly ctx: BroContext) {
  }

  render(): HTMLElement {
    const {config} = this.ctx;

    this.el = this.ctx.dom.createFromHTML(this.template());

    if (config.toolbarTitle) {
      this.el.setAttribute('aria-label', config.toolbarTitle);
    }

    return this.el;
  }

  /** Puts the body container after the header at the first render, or in place of the previous body container. */
  renderBodyContainer(container: BroTableBodyContainer, previous?: BroTableBodyContainer): void {
    if (previous) {
      previous.el.replaceWith(container.render());
    } else {
      this.el.append(container.render());
    }
  }

  /**
   * The table for screen readers: busy while it loads or refreshes, and the number of its rows with the header row, or
   * none without rows.
   */
  renderStatus(busy: boolean, rowCount: number | null): void {
    if (busy) {
      this.el.setAttribute('aria-busy', 'true');
    } else {
      this.el.removeAttribute('aria-busy');
    }

    if (rowCount) {
      this.el.setAttribute('aria-rowcount', `${rowCount}`);
    } else {
      this.el.removeAttribute('aria-rowcount');
    }
  }

  /** Tells the width of the host when it changes, while the table is connected. */
  observeHostWidth(onWidth: (width: number) => void): void {
    const {host, signal} = this.ctx;

    const observer = new ResizeObserver(entries => onWidth(entries[0].borderBoxSize[0].inlineSize));

    observer.observe(host);
    signal.addEventListener('abort', () => observer.disconnect(), {once: true});
  }

  /** The duration of the transition of a filter drawer, which the host takes from the container of the drawer, in ms. */
  filterDrawerDuration(): number {
    return cssNumber(getComputedStyle(this.ctx.host).getPropertyValue('--bro-filter-drawer-duration'));
  }
}

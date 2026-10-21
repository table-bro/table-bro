import {selectors}                  from '../../table-bro-selectors';
import type {BroContext}            from '../../types/context';
import type {BroPaginatorOptions}   from '../../types/pagination';
import type {BroView}               from '../../types/view';
import {BroTableContainer}          from './table-container/table-container.view';
import {BroTableHeaderContainer}    from './table-container/table-header-container/table-header-container.view';
import {BroTablePaginatorContainer} from './table-paginator-container/table-paginator-container.view';
import {BroTableToolbarContainer}   from './table-toolbar-container/table-toolbar-container.view';

/**
 * The regions of the table in the host, in their order: the toolbar, the table for screen readers with the header in
 * it, the live region of screen readers, and the paginator, which comes with the rows. The body comes into the table container with the rows too
 * (BroController.mount).
 */
export class BroTableRegions implements BroView {
  /** The live region of the table: screen readers say its text, as the states of the table. */
  private liveStatus!: HTMLElement;

  constructor(protected readonly ctx: BroContext) {
  }

  /** The toolbar and the table for screen readers with the header, at the render of the element. */
  render(): void {
    const {config, host, view} = this.ctx;

    // toolbar: false renders no toolbar: nothing else reads it
    if (config.toolbar !== false) {
      host.append(new BroTableToolbarContainer(this.ctx).render());
    }

    const tableContainer = new BroTableContainer(this.ctx);

    view.tableContainer = tableContainer;
    host.append(tableContainer.render());

    const headerContainer = new BroTableHeaderContainer(this.ctx);

    view.headerContainer = headerContainer;
    tableContainer.el.append(headerContainer.render());

    this.liveStatus = this.ctx.dom.createElement('div');
    this.liveStatus.className = `${selectors.liveStatus} ${selectors.visuallyHidden}`;
    this.liveStatus.setAttribute('role', 'status');
    this.liveStatus.setAttribute('aria-atomic', 'true');
    host.append(this.liveStatus);
  }

  /** Has screen readers say a text: the state of the table or the loading of row details; an empty text says nothing. */
  announce(text: string): void {
    this.liveStatus.textContent = text;
  }

  /** The paginator after the table: it renders with the pagination of the rows. */
  renderPaginator(options: BroPaginatorOptions): void {
    this.ctx.host.append(new BroTablePaginatorContainer(this.ctx).render(options));
  }
}

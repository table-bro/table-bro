import {BroDetailsHeights}                        from '../model/details';
import {BroPagination}                            from '../model/pagination';
import {BroRowHeights}                            from '../model/row-heights';
import {type BroRowSlot, BroRowSlots}             from '../model/row-slots';
import type {BroFrame}                            from '../shared/frame';
import type {BroContext}                          from '../types/context';
import type {BroEmptyState, BroRow, BroStateName} from '../types/table-bro';
import {fitRenderedValues}                        from '../view/dom/table-container/table-body-container/scrolling-container/table/tbody/tr/td/content/td-content.view';
import {BroTableBodyContainer}                    from '../view/dom/table-container/table-body-container/table-body-container.view';
import {BroPaginator}                             from '../view/dom/table-paginator-container/paginator/paginator.view';
import {BroDetailsView}                           from '../view/features/details/details.view';
import type {BroColumnsController}                from './columns.controller';

/**
 * The render phase of the rows of the state: the body with its rows, its states, the empty rows of the last page and
 * the scroll to the page, the details, the paginator of the rows and the status of the table. It reads the state and
 * never changes it; it makes the models of the body and calls the views.
 */
export class BroBodyController {
  /** The state that the body shows. */
  private readonly state: BroContext['state'];
  /** A page scroll animation runs; a new body container starts without one. */
  private scrolling: boolean = false;

  constructor(private readonly ctx: BroContext, private readonly columnsCtrl: BroColumnsController) {
    this.state = ctx.state;
  }

  /**
   * A new body with the rows of the state, in place of the shown one.
   * @param frame - the frame of the update
   * @param remeasure - the rows are new, from replaceRows: the widths of the body columns follow their values
   * @phase render
   */
  renderTableBody(frame: BroFrame, remeasure?: boolean): void {
    this.renderTableBodyContainer();
    this.renderTable(frame, remeasure);
  }

  /**
   * The table body at the first render: the container is added to the host, then the header is measured,
   * and only then the main table is rendered with the rows of the state.
   * @phase render
   */
  mountTableBody(frame: BroFrame): void {
    const {cols, config, view} = this.ctx;

    this.renderTableBodyContainer();

    // autoColumnWidth: false leaves the column widths to the application styles: nothing is measured
    if (config.autoColumnWidth === false) {
      view.thead.renderRow(cols);
      this.renderTable(frame);

      return;
    }

    this.columnsCtrl.measureHeader();

    /** Table (main table with content) */
    this.renderTable(frame);
  }

  /**
   * A table measured while hidden, at the width 0, measures its columns at its first width: the header row and the body
   * render again, with the rows and the state they show.
   * @phase render
   */
  remount(frame: BroFrame): void {
    const {model, view} = this.ctx;

    model.theadCols = model.theadShortCols = model.tbodyCols = undefined;

    view.thead.removeRow();

    this.mountTableBody(frame);

    // The new header row shows the sort of the rows
    if (this.state.sort) {
      view.thead.renderActiveSort(this.state.sort);
    }

    if (!this.state.rows?.length) {
      this.renderNoRowsState();
    }

    this.renderStatus();
  }

  /**
   * The displayed rows of the state in the body. A body that shows rows keeps them by their keys: the rows move, leave
   * and come in place (BroTableBodyContainer.renderRows), and the kept rows keep their open details through a sort,
   * a search or replaceRows. A body that shows a state renders anew.
   * @param frame - the frame of the update
   * @param remeasure - the rows are new, from replaceRows: the widths of the body columns follow their values
   * @phase render
   */
  renderRows(frame: BroFrame, remeasure?: boolean): void {
    const {config, layout, model, view, motion} = this.ctx;

    if (!model.slots?.list.length) {
      this.renderTableBody(frame, remeasure);

      return;
    }

    // A body that shows rows takes new rows
    const rows = <BroRow[]>this.state.rows;

    // The openings and closings end at once: the layout of the body and the geometry go by row numbers
    view.details?.settle();
    this.removeEmptyRows(model.slots.list.length);

    // The rows are new, from replaceRows: the body measures the widths of its columns again
    if (remeasure && config.autoColumnWidth !== false) {
      view.tbodyAux.replaceMeasureRow(rows);
      this.columnsCtrl.measureBody(frame);
    }

    // The slots of the kept keys stay with their open details, the rows of the gone keys leave, and new keys get new rows
    const diff = model.slots.diff(rows);

    view.bodyContainer.removeRows(diff.removed);
    view.bodyContainer.renderRows(frame, rows.length, model.slots.apply(diff));

    // A row that left while its server details loaded takes their loading along
    this.renderLiveStatus();

    // The geometry of the rows in their new order, with their open details; the layout of the body follows it
    model.rowHeights.init(rows.length);

    layout.heightsOnce(() => model.slots.list.forEach(slot => {
      if (slot.details) {
        model.rowHeights.expandRowByDetails(slot.number, slot.drawnDetailsHeight);
        layout.heightsChanged();
      }
    }));

    layout.rowsChanged();

    this.fillInUpToPageSize(this.state.pagination.pageSize);

    // The body takes the height of the page at once, as a new body does
    motion.cancel('body-height');
    view.bodyContainer.setHeight();

    const targetTop = -model.rowHeights.calcTableHeight();

    this.setScrollingContainerTop(targetTop);
    view.scrollingContainer.placeRows(targetTop);

    this.renderPage();
  }

  /**
   * The rows of appendRows after the shown ones: the empty rows of the last page go, the loaded rows come in every layer,
   * a short page gets empty rows again, the rows scroll to the page of the state, and the paginator takes their number.
   * @param frame - the frame of the update
   * @param rows - the copies of the loaded rows in the state
   * @param from - the number of the rows before them
   * @phase render
   */
  renderLoadedRows(frame: BroFrame, rows: BroRow[], from: number): void {
    const {model, view} = this.ctx;
    const {pageSize, total} = this.state.pagination;
    const sourceRows = <BroRow[]>this.state.sourceRows;

    this.removeEmptyRows(from);

    model.slots.add(rows);

    view.tbody.renderLoadedRows(rows, from, frame);
    view.tbodyAux.renderLoadedRows(rows, from);
    view.shadowContainer.renderLoadedRows(rows.length);
    model.rowHeights.addRows(from, rows.length);

    if (rows.length < pageSize) {
      this.fillInUpToPageSize(pageSize, sourceRows);
    }

    /** Scroll to the next page */
    this.renderScroll(frame);

    /** Re-init paginator */
    view.paginator.initPaginator({total});
  }

  /**
   * Shows a state in the body instead of its rows: the loading, a failure, no data, the empty state of replaceRows or no
   * row found.
   * @phase render
   */
  renderState(name: BroStateName): void {
    const {model, view} = this.ctx;

    this.setScrollingContainerTop(0);

    // The state takes the height of the body, with the open details of its page, before their rows go away
    const tableBodyHeight = view.bodyContainer.getTableBodyHeight();

    // The state replaces the rows of the body, empty rows included, and has no slots
    model.emptyRows = 0;
    model.slots = new BroRowSlots(this.ctx, []);

    // Screen readers say the state, which the table shows as plain text
    view.regions.announce(view.tbody.renderState(name, tableBodyHeight));

    view.bodyContainer.renderStateShadows(new BroPagination({pageSize: this.state.pagination.pageSize}), tableBodyHeight);

    // The status disables the paginator at the end of the update
    view.paginator.initPaginator({total: 0});
  }

  /**
   * The live region of a body with rows is empty while no displayed row loads server details: screen readers do not
   * hear a state that the rows replaced, or a loading of details that ended.
   * @phase render
   */
  renderLiveStatus(): void {
    const {model, view} = this.ctx;

    if (!model.slots.list.some(slot => slot.loadingDetails)) {
      view.regions.announce('');
    }
  }

  /**
   * The state of a table without rows to show: loading, a failure, no data or the empty state of replaceRows, or no row found.
   * @phase render
   */
  renderNoRowsState(emptyState?: BroEmptyState): void {
    const {sourceRows} = this.state;

    if (sourceRows === undefined) {
      this.renderState('loading');
    } else if (!sourceRows?.length) {
      this.renderState(sourceRows === null ? 'fail' : (emptyState || 'no-data'));
    } else {
      this.renderState('not-found');
    }
  }

  /**
   * Nothing to display: filters hid every row, or the collection itself is empty and its state stays on screen.
   * @phase render
   */
  renderEmptyDerivedRows(): void {
    if (this.state.sourceRows?.length) {
      this.renderState('not-found');
    }
  }

  /**
   * Scrolls the rows to the page of the state: the body takes the height of the page, the rows move to it.
   * @phase render
   */
  renderScroll(frame: BroFrame): void {
    const {styles, model, view, motion} = this.ctx;

    const pagination: BroPagination = this.state.pagination;

    const previousTop = view.scrollingContainer.top;

    this.scrolling = true;

    if (pagination.page * pagination.pageSize > (this.state.rows?.length ?? 0) + model.emptyRows) {
      this.fillInUpToPageSize(pagination.pageSize);
    }

    view.bodyContainer.setHeight(true);

    // The scroll starts after the writes, from the heights they leave
    frame.animate(() => {
      // Each frame takes the target again: details may change the heights while the page scrolls
      const targetTopAtStart = -model.rowHeights.calcTableHeight();

      motion.animateKinetic('pagination', {
        duration: styles.kineticTimeConstant,
        distance: targetTopAtStart - previousTop,
        draw: (progress: number) => {
          const targetTop = -model.rowHeights.calcTableHeight();

          view.scrollingContainer.scrollFrame(progress, previousTop, targetTop);

          if (progress === 1) {
            this.scrolling = false;

            this.renderPage();
          }
        },
        // A scroll stopped without a new one, for example by a state, leaves the page still
        onEnd: reason => {
          if (reason !== 'replaced') {
            this.scrolling = false;
          }
        }
      });
    });
  }

  /**
   * Opens or closes the details of the row; the body follows their height, or the running page scroll takes the new heights.
   * Server details may end their loading on a row of another page, after a page change or a sort: then the heights above
   * or below the window change, and the window of the page follows them as a page scroll does.
   * @param frame - the frame of the update
   * @param slot - the slot of the row
   * @param details - is case of server details only
   * @phase render
   */
  renderDetails(frame: BroFrame, slot: BroRowSlot, details?: HTMLElement) {
    const {config, view} = this.ctx;
    const {pageStart, pageEnd} = this.state.pagination;

    if (!view.details) {
      return;
    }

    view.details.render(frame, slot, details);
    view.tbody.renderDetailsButton(slot);

    const onPage = pageStart < slot.number && slot.number <= pageEnd;

    // The body follows the height that the details write in the dependent writes
    frame.animate(() => {
      if (!this.scrolling && onPage) {
        view.bodyContainer.setHeight(true, config.rowDetailsMotion !== 'eased');
      } else {
        this.renderScroll(frame);
      }
    });
  }

  /**
   * The paginator of new rows: their number, the first page, the page size and the total.
   * @phase render
   */
  renderPaginator(): void {
    const {config, view} = this.ctx;
    const {page, pageSize, total} = this.state.pagination;

    // `mat-paginator` as a Custom Element doesn't trigger `this.el.pageIndex` change (checked with Angular Material 14-22).
    // The new element takes the options of the rows at its render, so the paginator is set once
    if (config.components.paginator.recreateOnReplaceRows) {
      const newPaginator = new BroPaginator(this.ctx);

      newPaginator.replace(view.paginator, {page, pageSize, total});

      view.paginator = newPaginator;
    } else {
      view.paginator.initPaginator({page, pageSize, total});
    }
  }

  /**
   * The progress in the header, the refresh overlay and the paginator follow the status: loading shows the progress,
   * refreshing shows the progress and the overlay over the rows, and the paginator works only while the table is idle
   * with rows. Each update that changes the status or renders the body or the paginator writes them last, so a new body
   * gets the overlay of a refresh that goes on. The table container tells screen readers that it is busy while it loads
   * or refreshes, and the number of its rows, the header row included: the server mode has rows that are not loaded,
   * and a page shows only a part of them.
   * @phase render
   */
  renderStatus(): void {
    const {config, view} = this.ctx;
    const {status, rows, pagination} = this.state;

    view.thead.renderProgress(status !== 'idle');
    view.tableAux.renderRefresh(status === 'refreshing');

    view.paginator.setDisabled(status !== 'idle' || !rows?.length);

    view.tableContainer.renderStatus(status !== 'idle', rows?.length ? 1 + ((config.server && pagination.total) || rows.length) : null);
  }

  /**
   * Creates the body container for the displayed rows and puts it into the table container:
   * in place of the previous container, or after the header at the first render.
   * @phase render
   */
  private renderTableBodyContainer(): void {
    const {view, motion} = this.ctx;

    const container = new BroTableBodyContainer(this.ctx, this.state.rows);

    // A new body has no empty rows yet
    this.ctx.model.emptyRows = 0;

    // The height of the previous body would go on into the shadow of the new one
    motion.cancel('body-height');

    this.scrolling = false;

    view.tableContainer.renderBodyContainer(container, view.bodyContainer);
    view.bodyContainer = container;
  }

  /**
   * The table of a new body: its slots, the measurement of its columns, its rows, shadows and empty rows, its geometry,
   * and the details.
   * @phase render
   */
  private renderTable(frame: BroFrame, remeasure?: boolean): void {
    const {config, model, view} = this.ctx;

    const container = view.bodyContainer;
    const measure = (remeasure || !model.tbodyCols) && config.autoColumnWidth !== false;

    // The views of the layers put the rows into their slots while they render them
    model.slots = new BroRowSlots(this.ctx, container.rows);

    if (measure) {
      this.columnsCtrl.measureBody(frame);
    }

    // The row of the titles shows once the body has rows, and screen readers no longer hear the state that they replace
    if (container.rows?.length) {
      view.thead.showRow();
      this.renderLiveStatus();
    }

    container.renderTable(frame);

    // autoColumnWidth: false measures nothing at the render: the values that the CSS widths of the columns cut take
    // the ellipsis element of the skin once the rows are laid out
    if (config.autoColumnWidth === false) {
      frame.read(() => fitRenderedValues(this.ctx));
    }

    // The aux header with every title goes after the measurement of the header, and the measure row of the body goes
    // unless the body is measured
    if (view.theadAux) {
      view.theadAux.unrender();
      view.theadAux = null;
    }

    if (!measure) {
      view.tbodyAux.removeMeasureRow();
    }

    model.rowHeights = new BroRowHeights(this.ctx, container.rows?.length ?? 0, rowNumber => this.ctx.layout.gapsBefore(rowNumber));
    model.rowHeights.init();

    container.renderShadows();

    // BroTableBodyContainer.renderTable() is called only from here: a call from anywhere else
    // would skip the filling with empty rows, and the e2e tests count the rows.
    this.fillInUpToPageSize(this.state.pagination.pageSize, container.rows);

    const targetTop = -model.rowHeights.calcTableHeight();

    this.setScrollingContainerTop(targetTop);

    /** Details */
    if (config.rowDetailsComponent) {
      model.details = new BroDetailsHeights(this.ctx, (first, last) => this.ctx.layout.gapsHeight(first, last));
      view.details = new BroDetailsView(this.ctx);
    }

    this.renderPage();
  }

  /**
   * Fills up the last page with empty rows. They exist only in the DOM and the geometry
   * (ctx.model.emptyRows): search, sort, filtersTransform and appendRows see only real rows.
   * @phase render
   */
  private fillInUpToPageSize(pageSize: number, rows?: BroRow[] | null): void {
    const {model, view} = this.ctx;

    const shownRows = rows || this.state.rows;
    const rowLength = (shownRows?.length || 0) + model.emptyRows;
    const remainder = rowLength % pageSize;

    if (remainder > 0) {
      const emptyRowsToAdd = pageSize - remainder;

      model.emptyRows += emptyRowsToAdd;

      view.tbody.renderEmptyRows(emptyRowsToAdd);
      view.tbodyAux.renderEmptyRows(emptyRowsToAdd);
      view.shadowContainer.renderEmptyRowShadows(rowLength + emptyRowsToAdd, emptyRowsToAdd);
      model.rowHeights.addRows(rowLength, emptyRowsToAdd);
    }
  }

  /**
   * Loaded rows go after the real rows, so the empty rows of a short last page are removed first.
   * @param rowsLength - the real rows before the loaded ones
   * @phase render
   */
  private removeEmptyRows(rowsLength: number): void {
    const {model, view} = this.ctx;

    const emptyRows = model.emptyRows;

    if (!emptyRows) {
      return;
    }

    view.tbody.removeEmptyRows();
    view.tbodyAux.removeEmptyRows();
    view.shadowContainer.removeEmptyRowShadows(rowsLength, emptyRows);
    model.rowHeights.removeRows(rowsLength, emptyRows);

    model.emptyRows = 0;
  }

  /**
   * Puts the rows at the top at once and stops the page scroll.
   * @phase render
   */
  private setScrollingContainerTop(targetTop: number): void {
    this.ctx.motion.cancel('pagination');

    this.ctx.view.scrollingContainer.setTop(targetTop);
  }

  /**
   * The rows of the current page are the rows of the table for the keyboard and for screen readers (BroTbody.renderPage).
   * @phase render
   */
  private renderPage(): void {
    const {pageStart, pageEnd} = this.state.pagination;

    this.ctx.view.tbody.renderPage(this.ctx.model.slots.list, pageStart + 1, pageEnd);
  }
}

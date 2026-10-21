import {columnsWidthEvent, detailsToggleEvent, errorEvent, filtersFilterEvent, filtersServerLoadedEvent, filtersSortEvent, paginatorPageEvent, themeChangeEvent} from '../shared/events';
import {BroFrame, type BroUpdate}                                                                                                                                from '../shared/frame';
import {dispatchAction}                                                                                                                                          from '../shared/interaction';
import {createIslandTable, getIslandDetails}                                                                                                                     from '../shared/island';
import type {BroFilters, BroQuery}                                                                                                                               from '../shared/query';
import type {BroContext, BroControllerContext}                                                                                                                   from '../types/context';
import type {BroPageChange}                                                                                                                                      from '../types/pagination';
import type {BroActionDataMap, BroAppendRowsOptions, BroColSort, BroErrorDetail, BroEventDetail, BroReplaceRowsOptions, BroRow, BroTableAction, BroTableState}   from '../types/table-bro';
import {BroBodyController}                                                                                                                                       from './body.controller';
import {BroColumnsController}                                                                                                                                    from './columns.controller';
import {BroDetailsController}                                                                                                                                    from './details.controller';
import {BroHostWidthController}                                                                                                                                  from './host-width.controller';
import {acceptNoRows, acceptRows, appendRows, type BroDataState, filterRows, getAppendRange, requestLoad, setPage, sortRows, startRefresh}                       from './state';

export class BroController {
  readonly ctx: BroContext;

  /** The same object as ctx.state, but writable: only the controller writes the state. */
  private readonly state: BroDataState;
  // The parts of the controller in the order of their dependencies: each one gets the ones before it
  /** The measurement and the layout of the columns. */
  private readonly columnsCtrl: BroColumnsController;
  /** The render phase of the rows: the body, the details, the paginator and the status. */
  private readonly bodyCtrl: BroBodyController;
  /** The details of the rows: their opening and the loading of server details. */
  private readonly detailsCtrl: BroDetailsController;
  /** The columns that follow the width of the host. */
  private readonly hostWidthCtrl: BroHostWidthController;
  /** The table has rowDetailsIsland, and no Island Details module is connected: it shows the fail state and takes no rows. */
  private readonly islandMissing: boolean = false;
  /** The inputs of the actions of the table, by the name of the action: each gets the data of its action and its sender. */
  private readonly actions: {[A in BroTableAction]?: (data: BroActionDataMap[A], target: EventTarget | null) => void} = {
    [detailsToggleEvent]: (_, target) => this.detailsCtrl.onToggle(target),
    // The columns take a known new width of the table at once, without measurement; they come with the table
    [columnsWidthEvent]: width => this.hostWidthCtrl.onDeclaredWidth(width),
    [filtersFilterEvent]: change => this.ctx.config.server ? this.onServerFilter(change) : this.onFilterRows(change),
    [filtersSortEvent]: change => this.ctx.config.server ? this.onServerSort(change) : this.onSortRows(change),
    [paginatorPageEvent]: change => this.onPage(change)
  };

  constructor(ctx: BroControllerContext) {
    this.ctx = ctx;
    this.state = ctx.state;
    this.columnsCtrl = new BroColumnsController(ctx);
    this.bodyCtrl = new BroBodyController(ctx, this.columnsCtrl);
    this.detailsCtrl = new BroDetailsController(ctx, (reason, update) => this.update(reason, update), this.bodyCtrl);
    this.hostWidthCtrl = new BroHostWidthController(ctx, (reason, update) => this.update(reason, update), this.columnsCtrl, this.bodyCtrl);

    // Island Details extends the layout of the body; the prerender shows the loading state with the window shadow of the core
    if (ctx.config.rowDetailsIsland && !ctx.config.prerender) {
      const islandDetails = getIslandDetails();

      if (islandDetails) {
        ctx.layout.extend(islandDetails.create(createIslandTable(ctx)));
      } else {
        this.islandMissing = true;
      }
    }

    // One theme subscription per table: the body that shows a state renders it with the icons of the new theme
    ctx.themeService.themeChanges.addEventListener(themeChangeEvent, () => {
      this.update(themeChangeEvent, {
        render: () => this.ctx.view.tbody?.renderShownState()
      });
    }, {signal: ctx.signal});
  }

  /**
   * The first render of the body and the paginator. The rows from configure come in the state phase of the same update,
   * so the body renders once, with them; without rows the table shows loading until replaceRows.
   * @phase input
   */
  mount(rows: BroRow[] | null | undefined): void {
    const {host} = this.ctx;

    this.debug('mount', rows);

    this.update('mount', {
      // Without its module, a table of Island Details shows the fail state instead of its rows
      state: () => {
        // null is the failure of an earlier render, which a new render keeps
        if (this.islandMissing || rows === null) {
          acceptNoRows(this.ctx, 'fail');
        } else if (rows === undefined) {
          acceptNoRows(this.ctx, 'loading');
        } else {
          acceptRows(this.ctx, rows);
        }
      },
      render: frame => {
        const {page, pageSize, total} = this.state.pagination;

        // The paginator comes first: a body that fails shows the fail state with it, and later rows find it. It renders
        // disabled as renderStatus sets it, since the elements of a prerender get no attribute after their render
        this.ctx.view.regions.renderPaginator({page, pageSize, total, disabled: this.state.status !== 'idle' || !this.state.rows?.length});

        this.bodyCtrl.mountTableBody(frame);

        if (!this.state.rows?.length) {
          this.bodyCtrl.renderNoRowsState();
        }

        this.bodyCtrl.renderStatus();
      },
      events: () => {
        if (this.islandMissing) {
          host.dispatchEvent(new CustomEvent<BroErrorDetail>(errorEvent, {
            bubbles: true,
            detail: {code: 'island-details-missing', message: '[table-bro] rowDetailsIsland needs the Island Details module, import @table-bro-extended/island-details before the table renders.'}
          }));
        }
      }
    });

    this.hostWidthCtrl.observe();
    this.hostWidthCtrl.remeasureAfterFonts();
  }

  /**
   * Element disconnection: the core subscriptions are already removed by ctx.signal; this stops the animations and releases the theme service.
   * @phase input
   */
  dispose(): void {
    this.ctx.motion.cancelAll();
    this.ctx.themeService.destroy();
  }

  /**
   * The body of the public replaceRows.
   * @phase input
   */
  onReplaceRows(rows: BroRow[], {total, emptyState}: BroReplaceRowsOptions): void {
    this.debug('onReplaceRows', rows, total, emptyState);

    if (this.islandMissing) {
      return;
    }

    // The answer of the server to a sort, a search or a page of the table keeps the widths of the columns, as the local mode does
    const answer = this.ctx.config.server && this.state.status === 'refreshing';

    this.update('onReplaceRows', {
      state: () => acceptRows(this.ctx, rows, total),
      render: frame => {
        if (this.state.rows?.length) {
          this.bodyCtrl.renderRows(frame, !answer);
          this.bodyCtrl.renderPaginator();
        } else {
          this.bodyCtrl.renderNoRowsState(emptyState);
        }

        this.bodyCtrl.renderStatus();
      }
    });
  }

  /**
   * The body of the public appendRows. Relevant only for working with **server**
   * pagination - target pagination to scroll after loading
   *
   * When the page size changes and the backend returns data
   * in strict page mode (i.e. only rows for the requested page,
   * without previously loaded items), the input is trimmed to append
   * only rows that were not previously loaded.
   *
   * For all other cases (page navigation, or when the backend returns
   * only the latest delta of rows), rows are appended as-is.
   * @phase input
   */
  onAppendRows(rows: BroRow[], {total}: BroAppendRowsOptions): void {
    this.debug('onAppendRows', rows, total);

    const sourceRows = this.state.sourceRows;

    // Loaded rows follow shown rows: a table that loads, failed or shows no rows takes its rows with replaceRows
    if (this.islandMissing || !sourceRows?.length) {
      return;
    }

    // The rows answer the last load intent: they take its page and its page size, else those that the table shows
    const {page, pageSize} = this.state.load || this.state.pagination;
    const {pageSize: previousPageSize} = this.state.pagination;

    if (previousPageSize !== pageSize && rows.length > sourceRows.length) {
      const {start, end} = getAppendRange(sourceRows.length, page, pageSize);

      // Nothing to append: the answer ends the refresh of the load intent
      if (start >= end) {
        return this.update('onAppendRows', {
          state: () => this.state.status = 'idle',
          render: () => this.bodyCtrl.renderStatus()
        });
      }

      rows = rows.slice(start, end);
    }

    // The rows before the loaded ones: the arrays of the body views are the source rows, so they grow with them
    const from = sourceRows.length;

    this.update('onAppendRows', {
      state: () => {
        rows = appendRows(this.ctx, rows, from, total, page, pageSize);
      },
      render: frame => {
        // The local mode shows the rows through its filters and sort: the body keeps its rows by their keys
        if (!this.ctx.config.server) {
          return this.renderDerivedRows(frame);
        }

        this.bodyCtrl.renderLoadedRows(frame, rows, from);

        /** Hide progress */
        this.bodyCtrl.renderStatus();
      }
    });
  }

  /**
   * The body of the public setState.
   * @phase input
   */
  onSetState(state: BroTableState): void {
    this.debug('onSetState', state);

    if (this.islandMissing) {
      return;
    }

    // A table that loads already keeps its loading state
    const loading = (state === 'loading' && this.state.status === 'loading');

    this.update('onSetState', {
      state: () => {
        if (state === 'loading' || state === 'fail') {
          acceptNoRows(this.ctx, state);
        } else if (state === 'refreshing') {
          startRefresh(this.ctx);
        } else if (this.state.status === 'refreshing') {
          this.state.status = 'idle';
        }
      },
      render: () => {
        if ((state === 'loading' && !loading) || state === 'fail') {
          this.bodyCtrl.renderNoRowsState();
        }

        this.bodyCtrl.renderStatus();
      }
    });
  }

  /**
   * The actions of the views: the bro-action events that reach the host. Each action of the table goes to its input in
   * the map actions; the other actions, such as the ones of the toolbar buttons and of custom cells, are for the application.
   * @phase input
   */
  onDelegateEvents(event: CustomEvent<BroEventDetail>): void {
    const {action, data} = event.detail;

    this.debug(action, data);

    // A table of Island Details without its module takes no rows: a sort, a search or a page would wait for them forever
    if (this.islandMissing) {
      return;
    }

    // An action of the table goes to its input with its data; the map types the data of each action
    if (Object.prototype.hasOwnProperty.call(this.actions, action)) {
      (<(data: unknown, target: EventTarget | null) => void>this.actions[<BroTableAction>action])(data, event.target);
    }
  }

  /**
   * A change of the filters of the local mode: the rows of the accumulated filters and the sort. The rows start at the
   * first page; the cleared filters bring back the page before the filtering.
   * @phase input
   */
  onFilterRows(change: BroFilters): void {
    this.update(filtersFilterEvent, {
      state: () => filterRows(this.ctx, change),
      render: frame => this.renderDerivedRows(frame)
    });
  }

  /**
   * A sort of the local mode: the rows of the filters in the new order.
   * @phase input
   */
  onSortRows(change: BroColSort<BroRow>): void {
    this.update(filtersSortEvent, {
      state: () => sortRows(this.ctx, change),
      render: frame => {
        this.ctx.view.thead.renderActiveSort(change);

        if (!this.state.rows?.length) {
          this.bodyCtrl.renderEmptyDerivedRows();
        } else {
          this.bodyCtrl.renderRows(frame);
        }

        this.bodyCtrl.renderStatus();
      }
    });
  }

  /**
   * A change of the filters of the server mode: the load intent of the first page with the accumulated filters.
   * @phase input
   */
  private onServerFilter(change: BroFilters): void {
    this.update(filtersFilterEvent, {
      state: () => {
        this.state.filter = {...this.state.filter, ...change};

        requestLoad(this.ctx, 1, this.state.pagination.pageSize);
      },
      render: () => this.bodyCtrl.renderStatus(),
      events: () => this.dispatchServerLoad()
    });
  }

  /**
   * A sort of the server mode: the header shows it at once, and the load intent of the first page asks for the rows
   * in the new order.
   * @phase input
   */
  private onServerSort(change: BroColSort): void {
    this.update(filtersSortEvent, {
      state: () => {
        this.state.sort = change;

        requestLoad(this.ctx, 1, this.state.pagination.pageSize);
      },
      render: () => {
        this.ctx.view.thead.renderActiveSort(change);

        this.bodyCtrl.renderStatus();
      },
      events: () => this.dispatchServerLoad()
    });
  }

  /**
   * The paginator asks for a page. A page past the rows changes nothing; the server mode loads a page whose rows are not
   * loaded yet, and any other page scrolls into view.
   * @phase input
   */
  private onPage(pagination: BroPageChange): void {
    const {page, pageSize} = pagination;
    const {config, state} = this.ctx;
    const loaded = state.sourceRows?.length ?? 0;
    const total = config.server ? state.pagination.total : state.rows?.length;

    if (page < 1 || (page - 1) * pageSize >= (total ?? Infinity)) {
      return;
    }

    if (config.server && page * pageSize > loaded && (total ?? 0) > loaded) {
      this.onServerPage(pagination);
    } else {
      this.onScrollPage(page, pageSize);
    }
  }

  /**
   * The paginator of the server mode needs rows that are not loaded: the load intent of its page and page size.
   * @phase input
   */
  private onServerPage(pagination: BroPageChange): void {
    this.update(paginatorPageEvent, {
      state: () => requestLoad(this.ctx, pagination.page, pagination.pageSize),
      render: () => this.bodyCtrl.renderStatus(),
      events: () => this.dispatchServerLoad()
    });
  }

  /**
   * A page of loaded rows, or a new page size over them: the rows scroll to the page.
   * @phase input
   */
  private onScrollPage(page: number, pageSize: number): void {
    this.update(paginatorPageEvent, {
      state: () => setPage(this.ctx, page, pageSize),
      render: frame => this.bodyCtrl.renderScroll(frame)
    });
  }

  /**
   * The rows of the filters of the local mode in the body, on the page of the state, and the paginator of their number;
   * no rows show the empty state of the filters.
   * @phase render
   */
  private renderDerivedRows(frame: BroFrame): void {
    const {view} = this.ctx;
    const total = this.state.rows?.length ?? 0;

    if (!total) {
      this.bodyCtrl.renderEmptyDerivedRows();
      this.bodyCtrl.renderStatus();

      return;
    }

    this.bodyCtrl.renderRows(frame);

    view.paginator.initPaginator({page: this.state.pagination.page, total: total});

    this.bodyCtrl.renderStatus();
  }

  /**
   * The load intent of the server mode: the query is assembled here, at the dispatch, from the given page and page size,
   * the accumulated filters, and the sort.
   * The update that sends it has started the refresh already, so an application that answers at once, even from
   * a listener added before the one of the table, finds the table refreshing and ends the refresh with its rows.
   * A second load intent before the answer keeps the refresh on.
   * @phase events
   */
  private dispatchServerLoad(): void {
    // requestLoad() sets the load right before its event
    const {page, pageSize} = <{page: number; pageSize: number}>this.state.load;
    const {sortKey, sortDirection} = this.state.sort || {};
    const query: BroQuery = {page, pageSize};

    if (this.state.filter) {
      query.filter = {...this.state.filter};
    }

    // A cleared sort leaves no sort in the query
    if (sortDirection && sortKey) {
      query.sort = {
        keys: {[sortKey]: {direction: sortDirection}},
        order: [sortKey]
      };
    }

    dispatchAction(this.ctx.host, filtersServerLoadedEvent, query);
  }

  /**
   * One change of the table in phases: the state, the writes, one measurement, the writes that depend on it,
   * the animations, and the events last. It is synchronous: after it the DOM is ready.
   * An exception in the writes is a failed render (failRender), and the events of the change are not sent then.
   * With config.debug it logs one line: the reason, the phases it ran and the number of reads.
   * @param reason - the name of the change in the debug line: an action, a method of the element or an observer
   * @param phases - the state, the writes and the events of the change
   * @param failed - what an exception in the writes does; the update of the fail state only reports its own one
   */
  private update(reason: string, phases: BroUpdate, failed: (error: unknown) => void = error => this.failRender(error)): void {
    const {state, render, events} = phases;
    const start = performance.now();
    const frame = new BroFrame();

    state?.();

    try {
      render?.(frame);
      frame.flush();
    } catch (error) {
      failed(error);

      return;
    }

    events?.();

    if (this.ctx.config.debug) {
      const phases = [
        state && 'state',
        render && 'writes',
        frame.reads && 'reads',
        frame.writes && 'dependent writes',
        frame.animations && 'animations',
        events && 'events'
      ].filter(Boolean);

      console.debug('[table-bro] update', reason, {phases, reads: frame.reads, ms: Math.round((performance.now() - start) * 10) / 10});
    }
  }

  /**
   * A write of the table threw. The table shows the fail state in a new body, as after setState('fail'), so no half-written
   * rows stay on the screen, and the application gets bro-error with the code render-failed. The exception itself goes
   * to the console as an uncaught one, after the fail state.
   * @phase input
   */
  failRender(error: unknown): void {
    this.debug('failRender', error);

    // A table that cannot show even the fail state, for example one that failed before its paginator, reports it too
    this.update('failRender', {
      state: () => acceptNoRows(this.ctx, 'fail'),
      render: frame => {
        this.bodyCtrl.renderTableBody(frame);
        frame.flush();

        this.bodyCtrl.renderState('fail');

        this.bodyCtrl.renderStatus();
      }
    }, stateError => reportError(stateError));

    // The exception reaches the window after the fail state: a handler of the error that gives new rows finds a table that takes them
    reportError(error);

    this.ctx.host.dispatchEvent(new CustomEvent<BroErrorDetail>(errorEvent, {
      bubbles: true,
      detail: {code: 'render-failed', message: (<Error>error)?.message || String(error)}
    }));
  }

  /**
   * With config.debug, logs the received action, its data, and a summary of ctx.state in one line.
   * @phase input
   */
  private debug(action: string, ...data: unknown[]): void {
    if (!this.ctx.config.debug) {
      return;
    }

    const {sourceRows, rows, filter, sort, status} = this.state;
    const {page, pageSize, total} = this.state.pagination;

    console.debug('[table-bro]', action, ...data, {
      sourceRows: sourceRows ? sourceRows.length : sourceRows,
      rows: rows ? rows.length : rows,
      filter,
      sort,
      status,
      page,
      pageSize,
      total
    });
  }
}

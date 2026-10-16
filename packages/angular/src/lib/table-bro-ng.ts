import {isPlatformBrowser}                                                                                             from '@angular/common';
import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, NgZone, output, PLATFORM_ID, untracked} from '@angular/core';

import {type BroActionDetail, type BroCol, type BroConfig, type BroEmptyState, type BroFilters, type BroQuery, type BroUserTheme, dispatchAction, events, type TableBroHTMLElement} from '@table-bro/core';

import type {BroServerFacade} from './table-bro.facade';

/**
 * The Angular wrapper of <table-bro>: it translates the inputs into the methods of the element and the bro-action event
 * into the outputs. The table stays one: the wrapper renders nothing of its own and keeps no pagination, sort or filters.
 * The table works outside the Angular zone, so its animation frames start no change detection; the outputs emit inside it.
 */
@Component({
  selector: 'table-bro-ng',
  template: '',
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableBroNg<MODEL extends object> implements BroServerFacade<MODEL> {
  cols = input.required<BroCol<MODEL>[]>();
  /** The rows of the table; without a value, as before the first value of an async pipe, the table keeps what it shows. */
  rows = input.required<MODEL[] | undefined | null>();
  conf = input.required<BroConfig<MODEL>>();

  total = input<number>();
  rowsToAppend = input<MODEL[] | undefined>();
  /** The loading of the rows: the loading state of a table without rows, a refresh over the rows that the table shows. */
  loading = input<boolean>(false);
  /** A failed loading of the rows: the fail state of the table. */
  failed = input<boolean>(false);

  /**
   * The filters of the page outside the table, for example of a filter drawer. The table takes a new value as a change
   * of its own filters: it filters its rows in the local mode and sends a query with them in the server mode.
   * A cleared filter comes as undefined, null or an empty string; false and 0 are values of a filter.
   */
  filter = input<BroFilters<MODEL> | undefined>();
  /** The state of the table for empty rows: 'not-found' for an empty answer to a query with filters; 'no-data' without it. */
  emptyState = input<BroEmptyState>();
  /** The id of the <table-bro> element; without it the table gives itself a unique one. */
  tableId = input<string>();
  /** The theme of this table; without it the table takes the theme from its config. */
  theme = input<BroUserTheme | null>();

  action = output<BroActionDetail<MODEL>>();
  query = output<BroQuery<MODEL>>();

  /* Helpers */
  /** The loading that the table has got from the wrapper: its end without new rows ends the refresh. */
  private appliedLoading = false;
  /** The failure that the table shows: its end shows the rows of the page again. */
  private appliedFailed = false;
  /** The filters of the page the table has got from the wrapper: a new table gets the current ones again. */
  private appliedFilter: BroFilters<MODEL> | undefined;
  /** The rows the table has got from the wrapper: the same array is not delivered twice. */
  private deliveredRows: MODEL[] | undefined | null;
  private tableBro!: TableBroHTMLElement;

  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private ngZone = inject(NgZone);

  constructor() {
    // The server render of Angular leaves the host empty: the table is created in the browser
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }

    // The element takes the columns and the config only at configure, so their change creates a new table
    effect(() => {
      const cols = this.cols();
      const conf = this.conf();
      const tableId = this.tableId();

      this.ngZone.runOutsideAngular(() => untracked(() => this.createTableBro(cols, conf, tableId)));
    });

    effect(() => {
      const rows = this.rows();

      this.ngZone.runOutsideAngular(() => untracked(() => this.deliverRows(rows)));
    });

    effect(() => {
      const rowsToAppend = this.rowsToAppend();

      if (!rowsToAppend) {
        return;
      }

      // One batch for one delivery: the rows go with the total of the same answer; their page is the one of the last query.
      // The server mode binds the total with the rows it appends
      this.ngZone.runOutsideAngular(() => this.tableBro.appendRows(rowsToAppend, {total: untracked(this.total)!}));
    });

    // The loading and the failure in one effect: the end of a failure shows the rows again before a loading goes on
    effect(() => {
      const failed = this.failed();
      const loading = this.loading();

      this.ngZone.runOutsideAngular(() => untracked(() => this.applyState(failed, loading)));
    });

    effect(() => {
      const filter = this.filter();

      this.ngZone.runOutsideAngular(() => this.applyFilter(filter));
    });

    effect(() => {
      const theme = this.theme();

      if (theme !== undefined) {
        this.ngZone.runOutsideAngular(() => this.tableBro.theme = theme);
      }
    });
  }

  private createTableBro(cols: BroCol<MODEL>[], conf: BroConfig<MODEL>, tableId?: string) {
    const rows = this.rows();
    const theme = this.theme();

    this.tableBro = document.createElement('table-bro') as TableBroHTMLElement;
    this.appliedLoading = false;
    this.appliedFailed = false;

    if (tableId) {
      this.tableBro.setAttribute('id', tableId);
    }

    if (theme !== undefined) {
      this.tableBro.theme = theme;
    }

    // The rows of the local mode render with the table; the server mode delivers them below, with their total
    this.deliveredRows = (!conf.server && rows?.length) ? rows : undefined;

    this.tableBro.configure({cols, rows: this.deliveredRows, conf});
    // The actions of a table in the row details of this one bubble through it: its outputs give only the own ones
    this.tableBro.addEventListener(events.actionEvent, (event: CustomEvent<BroActionDetail<MODEL>>) => {
      if ((<Element>event.target).closest('table-bro') === this.tableBro) {
        this.tableBroListener(event);
      }
    });

    this.elementRef.nativeElement.replaceChildren(this.tableBro);

    this.appliedFilter = undefined;
    this.applyFilter(this.filter());

    this.deliverRows(rows);

    // A new table takes the state of the page too
    if (this.failed()) {
      this.fail();
    } else {
      this.applyLoading(this.loading());
    }
  }

  private applyFilter(filter: BroFilters<MODEL> | undefined) {
    if (!filter || filter === this.appliedFilter) {
      return;
    }

    this.appliedFilter = filter;

    dispatchAction(this.tableBro, events.filtersFilterEvent, filter);
  }

  private deliverRows(rows: MODEL[] | undefined | null) {
    // Rows without a value change nothing: the loading and the failure come with their own inputs
    if (!rows || rows === this.deliveredRows) {
      return;
    }

    this.deliveredRows = rows;

    // The rows answer the last query of the table, which gives their page size
    this.tableBro.replaceRows(rows, {total: this.total(), emptyState: this.emptyState()});
  }

  /** A loading over the rows that the page still gives is a refresh; without rows it is the loading state. */
  private applyLoading(loading: boolean) {
    if (loading && this.rows()?.length) {
      this.tableBro.setState('refreshing');
    } else if (loading) {
      this.tableBro.setState('loading');
      // The table shows no rows now: the next rows are delivered, even the same array
      this.deliveredRows = undefined;
    } else if (this.appliedLoading) {
      this.tableBro.setState('idle');
    }

    this.appliedLoading = loading;
  }

  private fail() {
    this.tableBro.setState('fail');
    this.appliedFailed = true;
    // The table shows no rows now: the next rows are delivered, even the same array
    this.deliveredRows = undefined;
  }

  /**
   * The failure, else the loading. The end of a failure shows the rows of the page again, also the same array, which no
   * new value of the rows brings; a loading that goes on keeps its refresh over them.
   */
  private applyState(failed: boolean, loading: boolean) {
    if (failed) {
      if (!this.appliedFailed) {
        this.fail();
      }

      return;
    }

    if (this.appliedFailed) {
      this.appliedFailed = false;
      this.deliverRows(this.rows());
    }

    this.applyLoading(loading);
  }

  private tableBroListener(event: CustomEvent<BroActionDetail<MODEL>>) {
    const detail = event.detail;

    /**
     * Pagination, Sorting or Filters change
     */
    if (detail.action === events.filtersServerLoadedEvent) {
      const query = <BroQuery<MODEL>>detail.data;

      this.ngZone.run(() => this.query.emit(query));
    } else {
      this.ngZone.run(() => this.action.emit(detail));
    }
  }
}

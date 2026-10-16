import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, type OnInit, signal} from '@angular/core';

import {type MatButtonToggleChange, MatButtonToggleModule}                                    from '@angular/material/button-toggle';
import {TableBroNg}                                                                           from '@table-bro/angular';
import {TableBroFilterDrawerContainerNg}                                                      from '@table-bro/angular-material';
import {type BroCol, type BroConfig, type BroEmptyState, type BroQuery, type BroSkin, events} from '@table-bro/core';

import {FeatureFiltersComponent}                                          from './feature-filters.component';
import {type FeatureFilters, features, filterFeatures, type StandFeature} from './features';

/**
 * The stand of the e2e tests: the Features table with its filter drawer in the skin of the toggle, in the server mode
 * with an emulated server. The tests also append their own tables to the body of this page.
 */
@Component({
  selector: 'stand-root',
  template: `
    <div class="container py-3">
      <mat-button-toggle-group aria-label="Table, Bro skin" [value]="skin()" (change)="onToggleSkin($event)">
        <mat-button-toggle value="mat">Angular Material</mat-button-toggle>
        <mat-button-toggle value="bs">Vanilla Bootstrap</mat-button-toggle>
        <mat-button-toggle value="nv">Vanilla HTML</mat-button-toggle>
      </mat-button-toggle-group>

      <!-- The filters lie outside of the table: the table with mat-drawer for the mat skin, the element of the core for the others -->
      @if (skin() === 'mat') {
        <table-bro-filter-drawer-container-ng [tableId]="tableId" [cols]="cols()" [rows]="rows()" [conf]="conf()"
                                              [total]="total()" [rowsToAppend]="rowsToAppend()" [emptyState]="emptyState()"
                                              [filter]="filter()"
                                              (query)="onQuery($event)">
          <stand-feature-filters (changeFilter)="filter.set($event)"></stand-feature-filters>
        </table-bro-filter-drawer-container-ng>
      } @else {
        <table-bro-filter-drawer-container [attr.skin]="skin()">
          <table-bro-ng class="bro-table-shadow-container"
                        [tableId]="tableId" [cols]="cols()" [rows]="rows()" [conf]="conf()"
                        [total]="total()" [rowsToAppend]="rowsToAppend()" [emptyState]="emptyState()"
                        [filter]="filter()"
                        (query)="onQuery($event)"></table-bro-ng>

          <stand-feature-filters slot="filters" [skin]="skin()" (changeFilter)="filter.set($event)"></stand-feature-filters>
        </table-bro-filter-drawer-container>
      }
    </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // <table-bro-filter-drawer-container> is an element of the core
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatButtonToggleModule,
    TableBroFilterDrawerContainerNg,
    TableBroNg,

    FeatureFiltersComponent
  ]
})
export class StandComponent implements OnInit {
  readonly tableId: string = 'stand-features';

  skin = signal<BroSkin>('mat');

  cols = computed<BroCol<StandFeature>[]>(() => [
    {
      title: 'Feature',
      name: 'featureName',
      html: true // the feature names hold <code> and <small>
    }, {
      title: 'Category',
      name: 'category',
      component: {
        selector: `bro-${this.skin()}-tags`
      }
    }, {
      title: 'Done',
      name: 'done',
      component: {
        selector: (this.skin() === 'mat') ? 'bro-mat-slide-toggle' : 'bro-switch',
        attrs: {
          checked: (col: BroCol, row: StandFeature) => row.done
        }
      }
    }, {
      title: '',
      name: 'feature-details',
      component: {
        selector: 'bro-details-button',
        attrs: {
          title: 'Details',
          name: events.detailsToggleEvent
        },
        event: 'action'
      }
    }
  ]);

  conf = computed<BroConfig<StandFeature>>(() => ({
    skin: this.skin(),
    toolbarTitle: 'Features',
    server: true,
    rowDetailsComponent: 'stand-feature-details',
    rowDetailsServer: true
  }));

  rows = signal<StandFeature[] | undefined>(undefined);
  total = signal<number | undefined>(undefined);
  rowsToAppend = signal<StandFeature[] | undefined>(undefined);
  emptyState = signal<BroEmptyState | undefined>(undefined);
  filter = signal<FeatureFilters | undefined>(undefined);

  /** The rows the table has got from the emulated server. */
  private loadedCount: number = 0;
  /** The load in flight: a newer query cancels it, so a late answer of an older query is not delivered. */
  private loadTimeout?: ReturnType<typeof setTimeout>;
  /** The filters and the sort of the rows the table has: another query starts from the first page. */
  private loadedQuery: string = '';

  ngOnInit() {
    this.loadFirstPage();
  }

  /** The skin of a table is set at init, so another skin creates the table again, which loads its first page. */
  onToggleSkin(event: MatButtonToggleChange) {
    this.skin.set(<BroSkin>event.value);
    this.rows.set(undefined);
    this.loadFirstPage();
  }

  /**
   * The emulated server: after 500 ms it answers a query with the features that match its filters, a new set of
   * filters or sort from the first page, the same one with the rows of the next pages.
   * @param query - the query of the table
   */
  onQuery(query: BroQuery<StandFeature>) {
    const rows: StandFeature[] = filterFeatures(features, <FeatureFilters>query.filter);
    const queryKey: string = JSON.stringify([query.filter, query.sort]);

    clearTimeout(this.loadTimeout);

    this.loadTimeout = setTimeout(() => {
      // One batch for one delivery: the rows go with the total of the same answer
      this.total.set(rows.length);

      if (queryKey !== this.loadedQuery) {
        this.loadedQuery = queryKey;
        this.loadedCount = Math.min(rows.length, query.pageSize);
        this.emptyState.set('not-found');
        this.rows.set(rows.slice(0, this.loadedCount));
      } else {
        const nextRows: StandFeature[] = rows.slice(this.loadedCount, query.page * query.pageSize);

        if (nextRows.length) {
          this.loadedCount += nextRows.length;
          this.rowsToAppend.set(nextRows);
        }
      }
    }, 500);
  }

  /** The first page of a new table answers the filters of the drawer as any query does. */
  private loadFirstPage() {
    this.loadedQuery = '';
    this.onQuery(<BroQuery<StandFeature>>{page: 1, pageSize: 5, filter: this.filter()});
  }
}

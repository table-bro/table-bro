import type {BroDocPage} from '../../pages.js';

/** The page filtering/filter-drawer of Docs. */
export const filterDrawerPage: BroDocPage = {
  path: 'filtering/filter-drawer',
  name: 'Filter Drawer',
  text: `<!-- table-filter-drawer -->
A drawer with your filters slides out next to the table. The filters live outside of the table. With Angular Material, \`‹table-bro-filter-drawer-container-ng›\` renders the table with the inputs of \`‹table-bro-ng›\` and your filters, its content, in a \`mat-drawer\`; the **Filters** button, which you add to the toolbar, opens it. With Bootstrap, Native, and in Vanilla JS, put the table and your filters with \`slot="filters"\` into \`‹table-bro-filter-drawer-container skin="bs"›\`; the **Filters** button opens it too.

Any button of your page opens the drawer with its \`toggle()\`.

<!-- table-filter-drawer code -->
{{filter-drawer.ts}}

<!-- table-filter-drawer-server -->
#### Filter Drawer _with server-side data loading_

In the server mode the table adds the filters of the drawer to its query: the \`bro-filters-server-loaded\` event carries a \`BroQuery\` with them in \`filter\`, together with the search, and with the sort.`,
  files: [
    {file: 'filter-drawer.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroFilterDrawerContainerNg}                                                           from '@table-bro/angular-material';
import {type BroCol, type BroConfig, type BroFilters, type BroRow, events, matchesFilterCondition} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  priceFrom?: number;
  priceTo?: number;
}>;

// The filters live outside of the table, in mat-drawer next to it. The component renders <table-bro-ng> with its inputs
// and outputs; the Filters button, which you add to the toolbar, opens the drawer; any other button calls its toggle().
// With the bs and nv skins and in Vanilla JS put the table and your filters with slot="filters" into <table-bro-filter-drawer-container skin="bs">
@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-filter-drawer-container-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                                          [filter]="filter()">
      <app-order-filters (changeFilter)="filter.set($event)"></app-order-filters>
    </table-bro-filter-drawer-container-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroFilterDrawerContainerNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {
      title: 'Description',
      name: 'description'
    }, {
      title: 'Price',
      name: 'price',
      dataType: 'number',
      className: 'bro-col_text-right'
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    components: {
      toolbarMain: {
        buttons: [
          // The button that opens the drawer; in the mat skin it is an icon with a tooltip
          {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list', buttonTooltip: 'Filters'}
        ]
      }
    },
    // Local mode: your rule for the rows. In the server mode the filters come in \`query.filter\` of the load event
    filtersTransform: (rows: Order[], filters: OrderFilters) => rows.filter(row => {
      return matchesFilterCondition(row.price, {gte: filters.priceFrom, lte: filters.priceTo});
    })
  });

  // A cleared filter goes as an empty value: {priceFrom: undefined}
  filter = signal<OrderFilters | undefined>(undefined);
}
`}
  ]
};

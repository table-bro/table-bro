import type {BroDocPage} from '../../pages.js';

/** The page filtering/custom-user-filters of Docs. */
export const customUserFiltersPage: BroDocPage = {
  path: 'filtering/custom-user-filters',
  name: 'Custom user filters',
  text: `<!-- table-custom-user-filters code -->
Your controls outside of the table give it their filters, and your rule \`filtersTransform\` filters the rows by them. In Angular the filters go to the input \`filter\` of the table:

{{custom-user-filters.ts}}

In Vanilla JS the page dispatches them to the table:

{{custom-user-filters_vanilla.ts}}

<!-- table-custom-user-filters-server -->
#### Custom user filters _with server-side data loading_`,
  files: [
    {file: 'custom-user-filters.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {MatSlideToggle, type MatSlideToggleChange}  from '@angular/material/slide-toggle';
import {TableBroNg}                                 from '@table-bro/angular';
import type {BroCol, BroConfig, BroFilters, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  price50Plus?: boolean;
}>;

@Component({
  selector: 'app-orders',
  template: \`
    <mat-slide-toggle (change)="onTogglePrice50Plus($event)">Price $50+</mat-slide-toggle>

    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                  [filter]="filter()"></table-bro-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggle,
    TableBroNg
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
    // Your rule for the rows by the filters of the input filter
    filtersTransform: (rows: Order[], filters: OrderFilters) => rows.filter(row => !filters.price50Plus || row.price >= 50)
  });

  filter = signal<OrderFilters | undefined>(undefined);

  onTogglePrice50Plus(event: MatSlideToggleChange) {
    this.filter.set({price50Plus: event.checked});
  }
}
`},
    {file: 'custom-user-filters_vanilla.ts', language: 'ts', code: `import {type BroFilters, type BroRow, dispatchAction, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  price50Plus?: boolean;
}>;

const table = document.querySelector('table-bro')!;
const price50Plus = document.querySelector<HTMLInputElement>('#price-50-plus')!;

price50Plus.addEventListener('change', () => {
  const filters: OrderFilters = {price50Plus: price50Plus.checked};

  dispatchAction(table, events.filtersFilterEvent, filters);
});
`}
  ]
};

# @table-bro/angular

The Angular wrapper of [Table, Bro](https://table-bro.com): the `<table-bro-ng>` component with signal inputs and outputs
over the `<table-bro>` Custom Element.

The wrapper does not depend on a skin. It works with any registered skin of Table, Bro: Angular Material
(`@table-bro/angular-material`), Bootstrap (`@table-bro/bootstrap`) or native (`@table-bro/native`).

## Install

```sh
npm install @table-bro/core @table-bro/angular
```

Add a skin: `@table-bro/angular-material` for Angular Material, or `@table-bro/bootstrap` or `@table-bro/native`. The
README of the skin gives its CSS and its registration, `provideTableBroMatSkin()` for Angular Material.

## Use

```ts
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                     from '@table-bro/angular';
import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: `<table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ]);

  rows = signal<Order[]>([
    {description: 'Modern Cotton Chair', price: 100},
    {description: 'Awesome Concrete Ball', price: 200}
  ]);

  conf = signal<BroConfig>({skin: 'mat', toolbarTitle: 'Orders'});
}
```

### The server mode

With `server: true` the table sorts, filters and pages nothing itself: it gives every gesture of the user as a
`query`, and the page answers with the rows and the total. The page loads the first page itself:

```ts
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                               from '@table-bro/angular';
import type {BroCol, BroConfig, BroQuery, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: `
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                  [total]="total()" [rowsToAppend]="rowsToAppend()" [failed]="failed()"
                  (query)="onQueryTable($event)"></table-bro-ng>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ]);

  conf = signal<BroConfig>({skin: 'mat', server: true, pageSize: 10});

  rows = signal<Order[] | undefined>(undefined);
  rowsToAppend = signal<Order[] | undefined>(undefined);
  total = signal<number>(0);
  failed = signal<boolean>(false);

  private lastQuery?: BroQuery<Order>;
  private loadedQuery = '';

  constructor() {
    this.onQueryTable({page: 1, pageSize: 10});
  }

  async onQueryTable(query: BroQuery<Order>) {
    const queryKey = JSON.stringify([query.filter, query.sort]);

    this.lastQuery = query;

    try {
      const {rows, total} = await loadOrders(query); // your API

      if (query !== this.lastQuery) {
        return; // a newer query came while this one loaded
      }

      this.failed.set(false);
      this.total.set(total);

      // Other filters or another sort replace the rows, the next pages of the same query add to them
      if (queryKey !== this.loadedQuery) {
        this.loadedQuery = queryKey;
        this.rows.set(rows);
      } else {
        this.rowsToAppend.set(rows);
      }
    } catch {
      if (query === this.lastQuery) {
        this.failed.set(true);
      }
    }
  }
}
```

## Inputs

| Input | Meaning |
| --- | --- |
| `cols`, `conf` | Columns and config of the table. The element takes them only at `configure`, so a new value creates a new table. |
| `rows` | An array replaces the rows, `[]` shows an empty state. Without a value (`undefined` or `null`, as before the first value of an `async` pipe) the table keeps what it shows. |
| `loading` | `true` shows the loading state of a table without rows, or a refresh over the rows it shows. |
| `failed` | `true` shows the failed state. |
| `total` | The total number of rows on the server. It is read together with `rows` or `rowsToAppend`, as one delivery. |
| `rowsToAppend` | The rows of the next page or of a larger page size, for the last `query`. |
| `filter` | The filters of the page outside the table, for example of a filter drawer. The table takes a new value as a change of its own filters. |
| `emptyState` | The state for empty `rows`: `'not-found'` for an empty answer to a query with filters. |
| `tableId` | The `id` of the `<table-bro>` element. |
| `theme` | The theme of this table: `'light'`, `'dark'` or `'auto'`. |

## Outputs

| Output | Meaning |
| --- | --- |
| `query` | The load intent of the server mode as a `BroQuery`: page, page size, filters and sort. One gesture gives one query. |
| `action` | Every other action of the `bro-action` event: custom cells, toolbar, paginator. |

## Contracts

`BroFacade`, `BroServerFacade` describe the wrapper; `BroContainer`, `BroServerContainer` describe the page
component that feeds it. `BroService` and `BroServerPage` describe the service of the page that turns a `BroQuery`
into a request of your API and its answer into rows with a total.

## Build

```sh
npm run build:angular
```

The root of the repository builds the package into `dist/table-bro.angular`.

## License

MIT

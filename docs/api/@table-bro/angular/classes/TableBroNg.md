# Class: TableBroNg\<MODEL\>

The Angular wrapper of \<table-bro\>: it translates the inputs into the methods of the element and the bro-action event
into the outputs. The table stays one: the wrapper renders nothing of its own and keeps no pagination, sort or filters.
The table works outside the Angular zone, so its animation frames start no change detection; the outputs emit inside it.
The server render of Angular renders the table in its loading state (prerenderTableBroNg), and the browser renders the
table in that element: the page shows the table before the application starts.

## Type Parameters

### MODEL

`MODEL` *extends* `object`

## Implements

- [`BroServerFacade`](../interfaces/BroServerFacade.md)\<`MODEL`\>

## Constructors

### Constructor

> **new TableBroNg**\<`MODEL`\>(): `TableBroNg`\<`MODEL`\>

#### Returns

`TableBroNg`\<`MODEL`\>

## Properties

### action

> **action**: `OutputEmitterRef`\<`BroActionDetail`\<`MODEL`\>\>

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`action`](../interfaces/BroServerFacade.md#action)

***

### cols

> **cols**: `InputSignal`\<`BroCol`\<`MODEL`\>[]\>

Column definitions and UI configuration

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`cols`](../interfaces/BroServerFacade.md#cols)

***

### conf

> **conf**: `InputSignal`\<`BroConfig`\<`MODEL`\>\>

Table configuration (page size, title, etc.)

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`conf`](../interfaces/BroServerFacade.md#conf)

***

### emptyState

> **emptyState**: `InputSignal`\<`BroEmptyState` \| `undefined`\>

The state of the table for empty rows: 'not-found' for an empty answer to a query with filters; 'no-data' without it.

***

### failed

> **failed**: `InputSignal`\<`boolean`\>

A failed loading of the rows: the fail state of the table.

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`failed`](../interfaces/BroServerFacade.md#failed)

***

### filter

> **filter**: `InputSignal`\<`BroFilters`\<`MODEL`\> \| `undefined`\>

The filters of the page outside the table, for example of a filter drawer. The table takes a new value as a change
of its own filters: it filters its rows in the local mode and sends a query with them in the server mode.
A cleared filter comes as undefined, null or an empty string; false and 0 are values of a filter.

***

### loading

> **loading**: `InputSignal`\<`boolean`\>

The loading of the rows: the loading state of a table without rows, a refresh over the rows that the table shows.

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`loading`](../interfaces/BroServerFacade.md#loading)

***

### query

> **query**: `OutputEmitterRef`\<`BroQuery`\<`MODEL`, `object`\>\>

Emits table queries whenever pagination, sorting or filtering changes.
Handled by a page-level server container.

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`query`](../interfaces/BroServerFacade.md#query)

***

### rows

> **rows**: `InputSignal`\<`MODEL`[] \| `null` \| `undefined`\>

The rows of the table; without a value, as before the first value of an async pipe, the table keeps what it shows.

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`rows`](../interfaces/BroServerFacade.md#rows)

***

### rowsToAppend

> **rowsToAppend**: `InputSignal`\<`MODEL`[] \| `undefined`\>

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`rowsToAppend`](../interfaces/BroServerFacade.md#rowstoappend)

***

### tableId

> **tableId**: `InputSignal`\<`string` \| `undefined`\>

The id of the \<table-bro\> element; without it the table gives itself a unique one.

***

### theme

> **theme**: `InputSignal`\<`BroUserTheme` \| `null` \| `undefined`\>

The theme of this table; without it the table takes the theme from its config.

***

### total

> **total**: `InputSignal`\<`number` \| `undefined`\>

Total number of rows available on the server

#### Implementation of

[`BroServerFacade`](../interfaces/BroServerFacade.md).[`total`](../interfaces/BroServerFacade.md#total)

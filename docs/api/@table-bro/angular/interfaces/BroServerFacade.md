# Interface: BroServerFacade\<MODEL\>

Public facade contract for a server-driven table.

Extends BroFacade with server-specific responsibilities such as
total row count exposure and query emission.

Intended to be injected into page components that handle
server-side data fetching.

## Extends

- [`BroFacade`](BroFacade.md)\<`MODEL`\>

## Type Parameters

### MODEL

`MODEL` *extends* `object`

Row model displayed by the table

## Properties

### action?

> `optional` **action?**: `OutputEmitterRef`\<`BroActionDetail`\<`MODEL`\>\>

#### Inherited from

[`BroFacade`](BroFacade.md).[`action`](BroFacade.md#action)

***

### cols

> **cols**: `InputSignal`\<`BroCol`\<`MODEL`\>[]\>

Column definitions and UI configuration

#### Inherited from

[`BroFacade`](BroFacade.md).[`cols`](BroFacade.md#cols)

***

### conf

> **conf**: `InputSignal`\<`BroConfig`\<`MODEL`\>\>

Table configuration (page size, title, etc.)

#### Inherited from

[`BroFacade`](BroFacade.md).[`conf`](BroFacade.md#conf)

***

### failed?

> `optional` **failed?**: `InputSignal`\<`boolean`\>

A failed loading of the rows: the fail state

#### Inherited from

[`BroFacade`](BroFacade.md).[`failed`](BroFacade.md#failed)

***

### loading?

> `optional` **loading?**: `InputSignal`\<`boolean`\>

The loading of the rows: the loading state, or a refresh over the shown rows

#### Inherited from

[`BroFacade`](BroFacade.md).[`loading`](BroFacade.md#loading)

***

### query

> **query**: `OutputEmitterRef`\<`BroQuery`\<`MODEL`, `object`\>\>

Emits table queries whenever pagination, sorting or filtering changes.
Handled by a page-level server container.

***

### rows

> **rows**: `InputSignal`\<`MODEL`[] \| `null` \| `undefined`\>

Table rows; without a value the table keeps what it shows

#### Inherited from

[`BroFacade`](BroFacade.md).[`rows`](BroFacade.md#rows)

***

### rowsToAppend?

> `optional` **rowsToAppend?**: `InputSignal`\<`MODEL`[] \| `undefined`\>

***

### total

> **total**: `InputSignal`\<`number` \| `undefined`\>

Total number of rows available on the server

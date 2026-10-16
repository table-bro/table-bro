# Interface: BroFacade\<MODEL\>

Public facade contract for a table component.

Defines the public input surface exposed to consumers
(parent components and templates).

All properties are Angular input signals managed by the framework and
must be treated as immutable from the consumer perspective.

## Extended by

- [`BroServerFacade`](BroServerFacade.md)

## Type Parameters

### MODEL

`MODEL` *extends* `object`

Row model displayed by the table

## Properties

### action?

> `optional` **action?**: `OutputEmitterRef`\<`BroActionDetail`\<`MODEL`\>\>

***

### cols

> **cols**: `InputSignal`\<`BroCol`\<`MODEL`\>[]\>

Column definitions and UI configuration

***

### conf

> **conf**: `InputSignal`\<`BroConfig`\<`MODEL`\>\>

Table configuration (page size, title, etc.)

***

### failed?

> `optional` **failed?**: `InputSignal`\<`boolean`\>

A failed loading of the rows: the fail state

***

### loading?

> `optional` **loading?**: `InputSignal`\<`boolean`\>

The loading of the rows: the loading state, or a refresh over the shown rows

***

### rows

> **rows**: `InputSignal`\<`MODEL`[] \| `null` \| `undefined`\>

Table rows; without a value the table keeps what it shows

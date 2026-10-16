# Interface: BroReplaceRowsOptions

The options of replaceRows() in the server mode; the local mode counts its rows and finds its empty state itself.

## Properties

### emptyState?

> `optional` **emptyState?**: [`BroEmptyState`](../type-aliases/BroEmptyState.md)

The state of an empty answer: 'not-found' for a query with filters.

***

### total?

> `optional` **total?**: `number`

The number of the rows of the query on the server.

# Interface: BroRowDetailsElement\<T\>

The element of the row details of the application: the table sets its row and the state of its server loading.
Server details load in the aux row and move into the row of the details when they open, so connectedCallback runs
again: the element renders its content once, by a flag of its own.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### row?

> `optional` **row?**: `T`

The row object of the application.

***

### server?

> `optional` **server?**: `string`

The attribute server that the table sets, as text: 'true' with rowDetailsServer, so the element loads its data and
reports the progress by the bro-details-server-loaded event.

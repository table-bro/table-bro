# Interface: BroCellElement\<T\>

The element of a cell of the application: the table sets the objects of its column and row.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### col?

> `optional` **col?**: [`BroCol`](BroCol.md)\<`T`\>

The column object of the application.

***

### row?

> `optional` **row?**: `T`

The row object of the application: functions, dates and nested objects stay as they are.

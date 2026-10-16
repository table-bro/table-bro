# Interface: BroConfigureOptions\<T\>

The options of configure(): the columns of the table, its first rows and its config.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### cols

> **cols**: [`BroCol`](BroCol.md)\<`T`\>[]

The columns of the table, in their order.

***

### conf

> **conf**: [`BroConfig`](BroConfig.md)\<`T`\>

The config of the table; skin is required.

***

### rows?

> `optional` **rows?**: `T`[]

Without rows the table shows its loading state.

# Interface: BroQuery\<MODEL, EXTRA\>

Table query for pagination, filtering and sorting

## Type Parameters

### MODEL

`MODEL` = [`BroRow`](BroRow.md)

### EXTRA

`EXTRA` *extends* `object` = `object`

## Properties

### filter?

> `optional` **filter?**: [`BroFilters`](../type-aliases/BroFilters.md)\<`MODEL`, `EXTRA`\>

A copy of the filters of the table; absent when the table has no filters.

***

### page

> **page**: `number`

The number of the page to load, from 1.

***

### pageSize

> **pageSize**: `number`

The number of the rows on a page.

***

### sort?

> `optional` **sort?**: `object`

The sort of the rows; absent when no column is sorted or the sort is cleared.

#### keys

> **keys**: `Partial`\<`Record`\<keyof `MODEL`, [`BroSortSpec`](BroSortSpec.md)\>\>

The sort spec of every sorted field, by the key of the field.

#### order?

> `optional` **order?**: readonly keyof `MODEL`[]

The priority of the sort keys for multi-column sorting: the first key sorts first.

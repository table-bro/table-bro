# Interface: BroColSort\<T\>

The data of the bro-filters-sort event.

## Extended by

- [`BroCol`](BroCol.md)

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### dataType?

> `optional` **dataType?**: [`BroColDataType`](../type-aliases/BroColDataType.md)

The type of the values of the sorted column.

***

### sortDirection?

> `optional` **sortDirection?**: [`BroSortDirection`](../type-aliases/BroSortDirection.md)

The direction of the sort arrow, the one of the sort in BroQuery; undefined after the sort is cleared.

***

### sortKey?

> `optional` **sortKey?**: `Extract`\<keyof `T`, `string`\>

The field of the row that the column sorts by.

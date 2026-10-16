# Interface: BroCol\<T\>

A column of the table: its title, the field of the row it shows, its sort and its cells.

## Extends

- [`BroColSort`](BroColSort.md)

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### className?

> `optional` **className?**: `string`

A class of the header and body cells of the column.

***

### colSpan?

> `optional` **colSpan?**: `number`

The colspan of the body cells of the column.

***

### component?

> `optional` **component?**: `string` \| [`BroCustomElementConfig`](BroCustomElementConfig.md)\<`T`\>

The Custom Element of the cells of the column: its tag, or its tag with its attributes and its event.

***

### dataType?

> `optional` **dataType?**: [`BroColDataType`](../type-aliases/BroColDataType.md)

The type of the values. The local sort compares the values of a 'number' column as numbers, also the ones given as
text, and the header puts the sort arrow of such a column before its title.

#### Overrides

[`BroColSort`](BroColSort.md).[`dataType`](BroColSort.md#datatype)

***

### html?

> `optional` **html?**: `boolean`

The cell values of the column are HTML: the table and the skin cells insert them as markup without sanitizing,
so pass only trusted values. Without the flag the values are shown as text.

***

### name?

> `optional` **name?**: `Extract`\<keyof `T`, `string`\>

The field of the row that the column shows, and its key for the class bro-col--\<key\>.

***

### sortDirection?

> `optional` **sortDirection?**: [`BroSortDirection`](../type-aliases/BroSortDirection.md)

Not read by the table: the field neither sets nor shows an initial sort of the column.
The table reports the sort direction in the bro-filters-sort event (BroColSort).

#### Overrides

[`BroColSort`](BroColSort.md).[`sortDirection`](BroColSort.md#sortdirection)

***

### sortKey?

> `optional` **sortKey?**: `Extract`\<keyof `T`, `string`\>

The field of the row that the column sorts by. The local sort compares text in the language of the page, without
case and with the numbers in it, so 'Item 2' comes before 'Item 10'; empty values come last in both directions.

#### Overrides

[`BroColSort`](BroColSort.md).[`sortKey`](BroColSort.md#sortkey)

***

### title

> **title**: `string`

The title of the column in the header.

***

### tooltip?

> `optional` **tooltip?**: `string`

The tooltip of the header cell of the column.

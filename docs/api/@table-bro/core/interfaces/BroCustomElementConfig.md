# Interface: BroCustomElementConfig\<T\>

The setting of a Custom Element: of the cells of a column (BroCol.component), or of the button of a skin.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### attrs?

> `optional` **attrs?**: `object`

The attributes of the element: values, or functions of the column and the row; the table sets them as strings, as they are.

#### Index Signature

\[`attrName`: `string`\]: `string` \| ((`col`, `row`) => `string` \| `number` \| `boolean`) \| `undefined`

Any other attribute of the element, as name or href.

#### value?

> `optional` **value?**: (`col`, `row`) => `string` \| `number` \| `boolean`

The value of the element; without it the element of a column of a skin takes the value of the field of the row.

##### Parameters

###### col

[`BroCol`](BroCol.md)\<`T`\>

###### row

`T`

##### Returns

`string` \| `number` \| `boolean`

***

### event?

> `optional` **event?**: `string`

The event of the element whose detail the table sends as the action of a bro-action event, with the column and the row.

***

### selector?

> `optional` **selector?**: `string`

The tag of the element.

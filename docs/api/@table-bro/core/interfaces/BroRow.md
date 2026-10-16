# Interface: BroRow

A row of the table: an object with the fields of the columns and an optional id.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### id?

> `optional` **id?**: `string` \| `number`

The id of the row that keys it in the render; a row without an id or with a repeated id is keyed by its object.

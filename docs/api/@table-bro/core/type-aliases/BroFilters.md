# Type Alias: BroFilters\<MODEL, EXTRA\>

> **BroFilters**\<`MODEL`, `EXTRA`\> = `Partial`\<\{ \[K in Exclude\<keyof MODEL, keyof EXTRA\>\]: BroFilterValue\<MODEL\[K\]\> \| BroFilterCondition\<MODEL\[K\]\> \}\> & `EXTRA` & `object`

The filters of a query: a value or a condition for each field of the row, the text of the search and the groups of the conditions of the application.

## Type Declaration

### advancedFilters?

> `optional` **advancedFilters?**: [`BroAdvancedFilterGroup`](BroAdvancedFilterGroup.md)\<`MODEL`\>[]

The groups of the field conditions that the application sets; the table passes them on and does not apply them.

### search?

> `optional` **search?**: `string` \| `null`

The text of the search of the toolbar; null after the search is cleared.

## Type Parameters

### MODEL

`MODEL` = [`BroRow`](../interfaces/BroRow.md)

### EXTRA

`EXTRA` *extends* `object` = `object`

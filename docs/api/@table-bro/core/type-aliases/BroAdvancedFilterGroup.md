# Type Alias: BroAdvancedFilterGroup\<MODEL\>

> **BroAdvancedFilterGroup**\<`MODEL`\> = `object` & `Partial`\<\{ \[K in Exclude\<keyof MODEL, "joiner" \| "search"\>\]: BroFilterCondition\<MODEL\[K\]\> \}\>

A group of the conditions on the fields of the row, joined by AND or OR.

## Type Declaration

### joiner

> **joiner**: `"AND"` \| `"OR"`

The logical operator that joins the conditions of the group.

### search?

> `optional` **search?**: [`BroFilterCondition`](../interfaces/BroFilterCondition.md)\<`string`\>

The condition on the text of the search.

## Type Parameters

### MODEL

`MODEL` = [`BroRow`](../interfaces/BroRow.md)

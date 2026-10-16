# Interface: BroFilterCondition\<T\>

Advanced filter condition for a field

## Type Parameters

### T

`T`

## Properties

### contains?

> `optional` **contains?**: `string`

The text that the text of the field contains, case-insensitive.

***

### eq?

> `optional` **eq?**: `T`

The value that the field equals; a number matches its text, as 5 matches '5'.

***

### gte?

> `optional` **gte?**: `T`

The lower bound, inclusive: compared as numbers when both values are numbers, else as lowercase texts.

***

### in?

> `optional` **in?**: readonly `T`[]

The values one of which the field equals, compared as in eq.

***

### lte?

> `optional` **lte?**: `T`

The upper bound, inclusive: compared as numbers when both values are numbers, else as lowercase texts.

***

### startsWith?

> `optional` **startsWith?**: `string`

The text that the text of the field starts with, case-insensitive.

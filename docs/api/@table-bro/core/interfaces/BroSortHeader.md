# Interface: BroSortHeader

The sort header element of a skin: the title of a column with the sort arrow.

## Properties

### activeSort?

> `optional` **activeSort?**: [`BroColSort`](BroColSort.md)\<[`BroRow`](BroRow.md)\>

The active sort of the table; the header of another column resets its arrow. The table sets it.

***

### arrowPosition

> **arrowPosition**: `"before"` \| `"after"`

The place of the arrow: before the title for a number column, after it otherwise.

***

### dataType

> **dataType**: `string`

The type of the values of the column.

***

### headerTitle

> **headerTitle**: `string`

The title of the column.

***

### iconHTML?

> `optional` **iconHTML?**: `string`

The markup of the arrow of the skin.

***

### sortId

> **sortId**: `string`

The key of the sort of the column: its sortKey, else its name.

***

### tooltip

> **tooltip**: `string`

The tooltip of the column.

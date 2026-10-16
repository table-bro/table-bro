# Interface: BroStates

The icon and the message of each state of the body: the icon is a symbol, the name of a font icon or an animation.

## Properties

### fail

> **fail**: \[`string`, `string`\]

The loading failed.

***

### loading

> **loading**: \[`string`, `string`\]

The table loads its rows.

***

### no-data

> **no-data**: \[`string`, `string`\]

The table has no rows.

***

### not-found?

> `optional` **not-found?**: \[`string`, `string`\]

The filters found no row; without it the state shows the icon of no-data with the message No records found.

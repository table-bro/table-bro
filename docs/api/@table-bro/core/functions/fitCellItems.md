# Function: fitCellItems()

> **fitCellItems**(`row`, `signal`): `void`

Fits the items of a component cell, such as tags, into the one line of the cell, since all rows have one fixed height.
The items that do not fit whole give way to an ellipsis after the items that show; the first item always shows,
and the CSS of the skin shrinks it with its own ellipsis in a narrow cell (mixin bro-cell-items).
The items are measured once; then the line follows the width of the cell, also while it animates, until
the signal aborts.

## Parameters

### row

`HTMLElement`

### signal

`AbortSignal`

## Returns

`void`

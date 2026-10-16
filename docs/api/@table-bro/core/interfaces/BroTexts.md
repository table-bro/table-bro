# Interface: BroTexts

The texts of the table: its words and the names of its controls, English by default. The skin mat takes the texts
of its paginator from MatPaginatorIntl of Angular Material, as its applications do.

## Properties

### back

> **back**: `string`

The names of the buttons of the search line.

***

### clear

> **clear**: `string`

The name of the clear button of the search line.

***

### close

> **close**: `string`

The name of the close button of the filter drawer.

***

### detailsLoading

> **detailsLoading**: `string`

What screen readers say when row details load from the server.

***

### filters

> **filters**: `string`

The title of the filter drawer.

***

### first

> **first**: `string`

The paginator of the vanilla skins: the words of its buttons.

***

### firstPage

> **firstPage**: `string`

The name of the first page button.

***

### itemsPerPage

> **itemsPerPage**: `string`

The label of the page sizes of the paginator.

***

### last

> **last**: `string`

The word of the last page button.

***

### lastPage

> **lastPage**: `string`

The name of the last page button.

***

### loadingProgress

> **loadingProgress**: `string`

The name of the progress bar of the vanilla skins, bs and nv.

***

### next

> **next**: `string`

The word of the next page button.

***

### nextPage

> **nextPage**: `string`

The name of the next page button.

***

### noItems

> **noItems**: `string`

A cell of tags without items.

***

### pageNavigation

> **pageNavigation**: `string`

The paginator of the vanilla skins: the name of its navigation, the label of its page sizes, the names of its buttons.

***

### pagination

> **pagination**: `string`

The name of the paginator, the group of its controls.

***

### previous

> **previous**: `string`

The word of the previous page button.

***

### previousPage

> **previousPage**: `string`

The name of the previous page button.

***

### rangeLabel

> **rangeLabel**: (`page`, `pageSize`, `length`) => `string`

The range of the rows of a page, as 1 – 5 of 20, by the index of the page: as getRangeLabel of MatPaginatorIntl.

#### Parameters

##### page

`number`

##### pageSize

`number`

##### length

`number`

#### Returns

`string`

***

### rowCounter

> **rowCounter**: `string`

The title of the column of the row numbers.

***

### rowCounterName

> **rowCounterName**: `string`

The name of the column of the row numbers for screen readers, whose short title they would read as a word.

***

### search

> **search**: `string`

The search button of the toolbar.

***

### searchField

> **searchField**: `string`

The placeholder and the name of the field of the search line.

***

### states

> **states**: `Partial`\<`Record`\<keyof [`BroStates`](BroStates.md), `string`\>\>

The messages of the states; a state without one takes the message of the skin.

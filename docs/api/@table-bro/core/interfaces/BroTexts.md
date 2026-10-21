# Interface: BroTexts

The texts of the table: its words and the names of its controls, English by default. The skin mat takes the texts
of its paginator from MatPaginatorIntl of Angular Material, as its applications do.

## Properties

### back

> **back**: `string`

The names of the buttons of the search line.

***

### buttonRole

> **buttonRole**: `string`

The word after the titles of the buttons of the toolbar of the skins bs and nv, as visually hidden text: their role.
Their links, as Filters or Read more, get a descriptive text for screen readers and search engines, Filters button.
An empty word adds no text.

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

### menuItemRole

> **menuItemRole**: `string`

The words after the titles of the items of the menu of the toolbar of the skin bs, as visually hidden text: their
role. Their links, as Print or Learn more, get a descriptive text for screen readers and search engines, Print menu
item. An empty string adds no text.

***

### menuRole

> **menuRole**: `string`

The word after the title of the menu of the toolbar of the skin bs, as visually hidden text: its role. The link of
the menu, as More, gets a descriptive text for screen readers and search engines, More menu. An empty word adds no
text.

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

### searchRole

> **searchRole**: (`title`) => `string`

The words after the title of the search of the toolbar of the skins bs and nv, as visually hidden text, by the title
of the toolbar: what it searches. Its link, as Search, gets a descriptive text for screen readers and search engines,
Search for Orders, or Search for rows without a title. An empty string that it returns adds no text.

#### Parameters

##### title

`string`

#### Returns

`string`

***

### states

> **states**: `Partial`\<`Record`\<keyof [`BroStates`](BroStates.md), `string`\>\>

The messages of the states; a state without one takes the message of the skin.

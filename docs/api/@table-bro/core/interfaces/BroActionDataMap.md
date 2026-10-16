# Interface: BroActionDataMap\<T\>

The data of each action of the table and of its skin, by the name of the action.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### bro-columns-width

> **bro-columns-width**: `number`

The known new width of the table in px.

***

### bro-details-server-failed

> **bro-details-server-failed**: `undefined`

The loading of the server details failed: the row ends its loading closed, and its next opening loads them again.

***

### bro-details-server-loaded

> **bro-details-server-loaded**: `number`

The loaded part of the server details, 1 at the end.

***

### bro-details-toggle

> **bro-details-toggle**: [`BroCellActionData`](BroCellActionData.md)\<`T`\> \| `undefined`

The details button sends no data, a custom cell sends its column and row.

***

### bro-filters-filter

> **bro-filters-filter**: [`BroFilters`](../type-aliases/BroFilters.md)\<`T`\>

The filters changed: the search of the table, or the filters that the application sends to the table.

***

### bro-filters-server-loaded

> **bro-filters-server-loaded**: [`BroQuery`](BroQuery.md)\<`T`\>

The load intent of the server mode: the page, the page size, the filters with the search, and the sort.

***

### bro-filters-sort

> **bro-filters-sort**: [`BroColSort`](BroColSort.md)\<`T`\>

The sort of a column changed.

***

### bro-filters-toggle

> **bro-filters-toggle**: `undefined`

The filters button of the toolbar: the application opens or closes its filter drawer.

***

### bro-paginator-page

> **bro-paginator-page**: [`BroPageChange`](BroPageChange.md)

The paginator asks for a page: the page, from 1, and the page size. The table shows it, and the server mode loads
it first by a new load intent when its rows are not loaded.

***

### bro-toolbar-more-export

> **bro-toolbar-more-export**: `undefined`

The export item of the More list of the toolbar.

***

### bro-toolbar-search-close

> **bro-toolbar-search-close**: `undefined`

The search line of the toolbar closed.

***

### bro-toolbar-search-open

> **bro-toolbar-search-open**: `undefined`

The search line of the toolbar opened.

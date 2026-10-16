# Interface: BroFilterDrawerHTMLElementEventMap

The events of the \<table-bro-filter-drawer-container\> element: its own, and the actions of its table that bubble up.

## Extends

- `HTMLElementEventMap`

## Properties

### bro-action

> **bro-action**: `CustomEvent`\<[`BroActionDetail`](../type-aliases/BroActionDetail.md)\<[`BroRow`](BroRow.md), `string`\>\>

An action of the table in the drawer container, bubbled up.

***

### bro-filters-close

> **bro-filters-close**: `CustomEvent`\<`null`\>

The drawer closed.

***

### bro-filters-open

> **bro-filters-open**: `CustomEvent`\<`null`\>

The drawer opened.

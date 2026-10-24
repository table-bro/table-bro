# Interface: BroFlatTexts

The flat fields of the texts of a config of 1.1.0, which have a group or a name of the core since 1.2.0, as search for
toolbarMain.search and rowCounter for rowCounterTitle, and noItems, which the tags of a skin take from withTags(). They still work and are deprecated: 2.0 removes them. A
field in a group takes the place of its flat field.

## Since

1.2.0

## Properties

### ~~back?~~

> `optional` **back?**: `string`

#### Deprecated

Use texts.toolbarSearch.back; the flat field is removed in 2.0.

***

### ~~buttonRole?~~

> `optional` **buttonRole?**: `string`

#### Deprecated

Use texts.toolbarMain.buttonRole; the flat field is removed in 2.0.

***

### ~~clear?~~

> `optional` **clear?**: `string`

#### Deprecated

Use texts.toolbarSearch.clear; the flat field is removed in 2.0.

***

### ~~close?~~

> `optional` **close?**: `string`

#### Deprecated

Use texts.filterDrawer.close; the flat field is removed in 2.0.

***

### ~~detailsLoading?~~

> `optional` **detailsLoading?**: `string`

#### Deprecated

Use texts.rowDetailsLoadingMessage; the flat field is removed in 2.0.

***

### ~~filters?~~

> `optional` **filters?**: `string`

#### Deprecated

Use texts.filterDrawer.title; the flat field is removed in 2.0.

***

### ~~first?~~

> `optional` **first?**: `string`

#### Deprecated

Use texts.paginator.firstText; the flat field is removed in 2.0.

***

### ~~firstPage?~~

> `optional` **firstPage?**: `string`

#### Deprecated

Use texts.paginator.firstPageLabel; the flat field is removed in 2.0.

***

### ~~itemsPerPage?~~

> `optional` **itemsPerPage?**: `string`

#### Deprecated

Use texts.paginator.itemsPerPageLabel; the flat field is removed in 2.0.

***

### ~~last?~~

> `optional` **last?**: `string`

#### Deprecated

Use texts.paginator.lastText; the flat field is removed in 2.0.

***

### ~~lastPage?~~

> `optional` **lastPage?**: `string`

#### Deprecated

Use texts.paginator.lastPageLabel; the flat field is removed in 2.0.

***

### ~~loadingProgress?~~

> `optional` **loadingProgress?**: `string`

#### Deprecated

Use texts.progressBar.label; the flat field is removed in 2.0.

***

### ~~menuItemRole?~~

> `optional` **menuItemRole?**: `string`

#### Deprecated

Use texts.toolbarMain.menuItemRole; the flat field is removed in 2.0.

***

### ~~menuRole?~~

> `optional` **menuRole?**: `string`

#### Deprecated

Use texts.toolbarMain.menuRole; the flat field is removed in 2.0.

***

### ~~next?~~

> `optional` **next?**: `string`

#### Deprecated

Use texts.paginator.nextText; the flat field is removed in 2.0.

***

### ~~nextPage?~~

> `optional` **nextPage?**: `string`

#### Deprecated

Use texts.paginator.nextPageLabel; the flat field is removed in 2.0.

***

### ~~noItems?~~

> `optional` **noItems?**: `string`

#### Deprecated

Use withTags(\{texts: \{empty\}\}) of the skin; the flat field is removed in 2.0.

***

### ~~pageNavigation?~~

> `optional` **pageNavigation?**: `string`

#### Deprecated

Use texts.paginator.navigationLabel; the flat field is removed in 2.0.

***

### ~~pagination?~~

> `optional` **pagination?**: `string`

#### Deprecated

Use texts.paginator.label; the flat field is removed in 2.0.

***

### ~~previous?~~

> `optional` **previous?**: `string`

#### Deprecated

Use texts.paginator.previousText; the flat field is removed in 2.0.

***

### ~~previousPage?~~

> `optional` **previousPage?**: `string`

#### Deprecated

Use texts.paginator.previousPageLabel; the flat field is removed in 2.0.

***

### ~~rangeLabel?~~

> `optional` **rangeLabel?**: (`page`, `pageSize`, `length`) => `string`

#### Parameters

##### page

`number`

##### pageSize

`number`

##### length

`number`

#### Returns

`string`

#### Deprecated

Use texts.paginator.getRangeLabel; the flat field is removed in 2.0.

***

### ~~rowCounter?~~

> `optional` **rowCounter?**: `string`

#### Deprecated

Use texts.rowCounterTitle; the flat field is removed in 2.0.

***

### ~~rowCounterName?~~

> `optional` **rowCounterName?**: `string`

#### Deprecated

Use texts.rowCounterLabel; the flat field is removed in 2.0.

***

### ~~search?~~

> `optional` **search?**: `string`

#### Deprecated

Use texts.toolbarMain.search; the flat field is removed in 2.0.

***

### ~~searchField?~~

> `optional` **searchField?**: `string`

#### Deprecated

Use texts.toolbarSearch.field; the flat field is removed in 2.0.

***

### ~~searchRole?~~

> `optional` **searchRole?**: (`title`) => `string`

#### Parameters

##### title

`string`

#### Returns

`string`

#### Deprecated

Use texts.toolbarMain.searchRole; the flat field is removed in 2.0.

***

### ~~states?~~

> `optional` **states?**: `Partial`\<`Record`\<keyof [`BroStates`](BroStates.md), `string`\>\>

#### Deprecated

Use texts.state; the flat field is removed in 2.0.

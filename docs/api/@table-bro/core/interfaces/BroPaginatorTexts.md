# Interface: BroPaginatorTexts

The texts of the paginator, components.paginator of a skin: the group paginator of the texts of a config. Its labels
have the names of MatPaginatorIntl of Angular Material; the skin mat takes them from its MatPaginatorIntl, as its
applications do, and only label from here.

## Since

1.2.0

## Properties

### firstPageLabel

> **firstPageLabel**: `string`

The name of the first page button.

***

### firstText

> **firstText**: `string`

The word of the first page button of the paginator of the vanilla skins.

***

### getRangeLabel

> **getRangeLabel**: (`page`, `pageSize`, `length`) => `string`

The range of the rows of a page, as 1 – 5 of 20, by the index of the page, as in MatPaginatorIntl.

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

### itemsPerPageLabel

> **itemsPerPageLabel**: `string`

The label of the page sizes of the paginator.

***

### label

> **label**: `string`

The name of the paginator, the group of its controls.

***

### lastPageLabel

> **lastPageLabel**: `string`

The name of the last page button.

***

### lastText

> **lastText**: `string`

The word of the last page button of the paginator of the vanilla skins.

***

### navigationLabel

> **navigationLabel**: `string`

The name of the navigation of the paginator of the vanilla skins.

***

### nextPageLabel

> **nextPageLabel**: `string`

The name of the next page button.

***

### nextText

> **nextText**: `string`

The word of the next page button of the paginator of the vanilla skins.

***

### previousPageLabel

> **previousPageLabel**: `string`

The name of the previous page button.

***

### previousText

> **previousText**: `string`

The word of the previous page button of the paginator of the vanilla skins.

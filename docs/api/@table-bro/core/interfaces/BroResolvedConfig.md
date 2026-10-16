# Interface: BroResolvedConfig

The config of a table after init: a copy of the config of the skin, the defaults, and the config of the application
over them. So it has the components, the classes and the theme attribute of the skin and the defaults of resolveConfig.

## Extends

- `Omit`\<[`BroConfig`](BroConfig.md), `"skin"` \| `"theme"` \| `"components"` \| `"css"` \| `"texts"` \| `"shadowsEnabled"` \| `"toolbarTitle"` \| `"shortColumnTitle"` \| `"rowCounter"` \| `"pageSize"` \| `"pageSizeOptions"`\>

## Properties

### autoColumnWidth?

> `optional` **autoColumnWidth?**: `boolean`

false turns off the auto-detected column widths, for an application that knows the widths it needs: the table
measures nothing and writes no widths, and the CSS of the application gives every column its width through its
class (BroCol.className), for the header and body cells. A long value keeps to the one line of its row and does
not widen its column: it shows its first line with an ellipsis; in a column with a width, its whole value shows in the tooltip of the skin.

#### Inherited from

`Omit.autoColumnWidth`

***

### components

> **components**: [`BroSkinComponents`](BroSkinComponents.md)

The components of the skin with the ones of the config of the application over them.

***

### css

> **css**: [`BroConfigCSS`](BroConfigCSS.md)

The classes of the skin with the ones of the config of the application over them.

***

### debug?

> `optional` **debug?**: `boolean`

Debugging: the table logs every update with its reason and phases, every received action, and its warnings.

#### Inherited from

`Omit.debug`

***

### debugAnimation?

> `optional` **debugAnimation?**: `boolean`

Debugging of the animations: every animation of the table runs six times slower with its real curve, and every
ended one is logged with its reason and duration and measured on the Performance timeline of the browser.

#### Inherited from

`Omit.debugAnimation`

***

### filtersTransform?

> `optional` **filtersTransform?**: (`rows`, `filters`) => [`BroRow`](BroRow.md)[]

The filters of the application in the local mode. The table calls it when a filter has a value, with the rows that
its search leaves, and shows the rows that it returns. A cleared filter is undefined, null or an empty string; false
and 0 are values.

#### Parameters

##### rows

[`BroRow`](BroRow.md)[]

##### filters

[`BroFilters`](../type-aliases/BroFilters.md)

#### Returns

[`BroRow`](BroRow.md)[]

#### Inherited from

`Omit.filtersTransform`

***

### header?

> `optional` **header?**: `boolean`

false hides the header of the table, as a table in the row details of another table with the same columns. The
header keeps its place in the DOM: the widths and the sort of the columns stay as they are.

#### Inherited from

`Omit.header`

***

### pageSize

> **pageSize**: `number`

The rows on a page, 5 by default.

***

### pageSizeOptions

> **pageSizeOptions**: `number`[]

The page sizes of the paginator, [5, 10, 15, 20, 25, 50, 100] by default.

***

### rowCounter

> **rowCounter**: `boolean`

The column of the row numbers, true by default.

***

### rowDetailsComponent?

> `optional` **rowDetailsComponent?**: `string`

The tag of the Custom Element of the row details; without it the rows have no details. The table measures the
height of the details when they open: details opened in a hidden table take the height of a row until their next
opening, and a component that renders its content later, after a request, loads from the server (rowDetailsServer).

#### Inherited from

`Omit.rowDetailsComponent`

***

### rowDetailsIsland?

> `optional` **rowDetailsIsland?**: `boolean`

Island Details: the open details of a row stand apart from the other rows, with spaces around them.

#### Inherited from

`Omit.rowDetailsIsland`

***

### rowDetailsMotion?

> `optional` **rowDetailsMotion?**: `"kinetic"` \| `"eased"`

The motion of the row details: kinetic by default, as the pages move; eased opens and closes them in the time of
--bro-details-duration.

#### Inherited from

`Omit.rowDetailsMotion`

***

### rowDetailsProgressMode?

> `optional` **rowDetailsProgressMode?**: [`BroProgressMode`](../type-aliases/BroProgressMode.md)

The progress bar of the row details that load from the server: indeterminate, or determinate by their progress.

#### Inherited from

`Omit.rowDetailsProgressMode`

***

### rowDetailsServer?

> `optional` **rowDetailsServer?**: `boolean`

The row details load from the server: the element of the details gets the attribute server="true" and reports its
progress by the bro-details-server-loaded event.

#### Inherited from

`Omit.rowDetailsServer`

***

### searchDebounce?

> `optional` **searchDebounce?**: `number`

The delay of the search after the last key in ms: 100 by default, 400 in the server mode.

#### Inherited from

`Omit.searchDebounce`

***

### server?

> `optional` **server?**: `boolean`

The server mode: the application loads the rows by the load intent of the table (bro-filters-server-loaded) and
gives them by replaceRows() with their total; the table neither filters, sorts nor pages them itself.

#### Inherited from

`Omit.server`

***

### shadowsEnabled

> **shadowsEnabled**: `boolean`

The shadows of the table, true by default.

***

### shortColumnTitle

> **shortColumnTitle**: (`col`) => `string`

The short title of a column, the first word of its title by default.

#### Parameters

##### col

[`BroCol`](BroCol.md)

#### Returns

`string`

***

### skin

> **skin**: [`BroSkin`](../type-aliases/BroSkin.md)

configure() takes no config without a skin.

***

### stateAnimationEffect?

> `optional` **stateAnimationEffect?**: `"alt"`

The other animation of the icon of a state: 'alt' turns it from a smaller angle and keeps its place.

#### Inherited from

`Omit.stateAnimationEffect`

***

### styleNonce?

> `optional` **styleNonce?**: `string`

The nonce of a Content Security Policy without 'unsafe-inline' for styles: the table gives it to the \<style\>
elements of its column widths. The application passes the nonce of its page.

#### Inherited from

`Omit.styleNonce`

***

### texts

> **texts**: [`BroTexts`](BroTexts.md)

The English texts with the ones of the config of the application over them.

***

### theme

> **theme**: [`BroUserTheme`](../type-aliases/BroUserTheme.md)

The theme of the config, 'auto' by default.

***

### themeAttribute?

> `optional` **themeAttribute?**: `string`

The attribute of the color mode from the config of the skin: only a skin whose UI library has one gives it.

***

### toolbar?

> `optional` **toolbar?**: `boolean`

false renders the table without its toolbar, with its title, its search and its buttons, as a table in the row
details of another table.

#### Inherited from

`Omit.toolbar`

***

### toolbarTitle

> **toolbarTitle**: `string`

The title of the toolbar, an empty string by default.

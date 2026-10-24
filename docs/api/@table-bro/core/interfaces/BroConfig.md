# Interface: BroConfig\<T\>

The config of a table: its skin, its classes, texts and theme, its data mode and its features. T is the row type of
the application, as of the columns of configure(), for the functions of the config that take a column.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

## Properties

### autoColumnWidth?

> `optional` **autoColumnWidth?**: `boolean`

false turns off the auto-detected column widths, for an application that knows the widths it needs: the table
measures nothing and writes no widths, and the CSS of the application gives every column its width through its
class (BroCol.className), for the header and body cells. A long value keeps to the one line of its row and does
not widen its column: it shows its first line with an ellipsis; in a column with a width, its whole value shows in the tooltip of the skin.

***

### components?

> `optional` **components?**: [`BroDeepPartial`](../type-aliases/BroDeepPartial.md)\<[`BroSkinComponents`](BroSkinComponents.md)\>

The settings of the components of the skin. The table puts the config of the application over a copy of the config
of the skin, so a config gives only what it changes, at any depth.

***

### css?

> `optional` **css?**: [`BroDeepPartial`](../type-aliases/BroDeepPartial.md)\<[`BroConfigCSS`](BroConfigCSS.md)\>

The classes of the table: the config of the application changes those of the skin, at any depth.

***

### debug?

> `optional` **debug?**: `boolean`

Debugging: the table logs every update with its reason and phases, every received action, and its warnings.

***

### debugAnimation?

> `optional` **debugAnimation?**: `boolean`

Debugging of the animations: every animation of the table runs six times slower with its real curve, and every
ended one is logged with its reason and duration and measured on the Performance timeline of the browser.

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

***

### header?

> `optional` **header?**: `boolean`

false hides the header of the table, as a table in the row details of another table with the same columns. The
header keeps its place in the DOM: the widths and the sort of the columns stay as they are.

***

### pageSize?

> `optional` **pageSize?**: `number`

The rows on a page, 5 by default.

***

### pageSizeOptions?

> `optional` **pageSizeOptions?**: `number`[]

The page sizes that the paginator offers, [5, 10, 15, 20, 25, 50, 100] by default: the ones up to the number of all
rows, the first one above it and the current one.

***

### rowCounter?

> `optional` **rowCounter?**: `boolean`

The column of the row numbers, on by default.

***

### rowDetailsComponent?

> `optional` **rowDetailsComponent?**: `string`

The tag of the Custom Element of the row details; without it the rows have no details. The table measures the
height of the details when they open: details opened in a hidden table take the height of a row until their next
opening, and a component that renders its content later, after a request, loads from the server (rowDetailsServer).

***

### rowDetailsIsland?

> `optional` **rowDetailsIsland?**: `boolean`

Island Details: the open details of a row stand apart from the other rows, with spaces around them.

***

### rowDetailsMotion?

> `optional` **rowDetailsMotion?**: `"kinetic"` \| `"eased"`

The motion of the row details: kinetic by default, as the pages move; eased opens and closes them in the time of
--bro-details-duration.

***

### rowDetailsProgressMode?

> `optional` **rowDetailsProgressMode?**: [`BroProgressMode`](../type-aliases/BroProgressMode.md)

The progress bar of the row details that load from the server: indeterminate, or determinate by their progress.

***

### rowDetailsServer?

> `optional` **rowDetailsServer?**: `boolean`

The row details load from the server: the element of the details gets the attribute server="true" and reports its
progress by the bro-details-server-loaded event.

***

### searchDebounce?

> `optional` **searchDebounce?**: `number`

The delay of the search after the last key in ms: 100 by default, 400 in the server mode.

***

### server?

> `optional` **server?**: `boolean`

The server mode: the application loads the rows by the load intent of the table (bro-filters-server-loaded) and
gives them by replaceRows() with their total; the table neither filters, sorts nor pages them itself.

***

### shadowsEnabled?

> `optional` **shadowsEnabled?**: `boolean`

The shadows of the table and of its regions, on by default; false leaves out the class css.shadow.

***

### shortColumnTitle?

> `optional` **shortColumnTitle?**: (`col`) => `string`

The short title of a column: a column may get narrower down to its width, with an ellipsis. The first word of the
title by default. The type of a method, whose parameters TypeScript checks both ways, so a config of BroRow serves
the columns of Order too.

#### Parameters

##### col

[`BroCol`](BroCol.md)\<`T`\>

#### Returns

`string`

***

### skin?

> `optional` **skin?**: [`BroSkin`](../type-aliases/BroSkin.md)

The skin of the table; configure() takes no config without it.

***

### stateAnimationEffect?

> `optional` **stateAnimationEffect?**: `"alt"`

The other animation of the icon of a state: 'alt' turns it from a smaller angle and keeps its place.

***

### styleNonce?

> `optional` **styleNonce?**: `string`

The nonce of a Content Security Policy without 'unsafe-inline' for styles: the table gives it to the \<style\>
elements of its column widths. The application passes the nonce of its page.

***

### texts?

> `optional` **texts?**: [`BroTextsConfig`](../type-aliases/BroTextsConfig.md)

The texts of the table in the language of the application: a config gives the ones it changes, by the part of the
table, as texts.paginator. The flat fields of 1.1.0 still work and are deprecated.

***

### theme?

> `optional` **theme?**: [`BroUserTheme`](../type-aliases/BroUserTheme.md)

The theme of the table: 'auto' by default, the color scheme of the system; 'light' or 'dark' for a page that keeps
one theme. The theme attribute or property of the table wins over it.

***

### toolbar?

> `optional` **toolbar?**: `boolean`

false renders the table without its toolbar, with its title, its search and its buttons, as a table in the row
details of another table.

***

### toolbarTitle?

> `optional` **toolbarTitle?**: `string`

The title of the toolbar; without it the toolbar shows no text.

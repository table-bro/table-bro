# Interface: TableBroHTMLElement

The \<table-bro\> element: its methods and its theme. The methods take the rows of the application of type T.

## Extends

- `HTMLElement`

## Methods

### addEventListener()

#### Call Signature

> **addEventListener**\<`T`, `A`\>(`type`, `listener`, `options?`): `void`

Adds a listener of the actions of the table; a listener that takes CustomEvent\<BroActionDetail\<Order\>\> gets
the columns and the rows of the application of type Order, and one of BroActionDetail\<Order, 'edit'\> also the data
of the actions of the table by their names.

##### Type Parameters

###### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

###### A

`A` *extends* `string` = `string`

##### Parameters

###### type

`"bro-action"`

the name of the event

###### listener

(`this`, `event`) => `void`

the listener of the event

###### options?

`boolean` \| `AddEventListenerOptions`

the options of addEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.addEventListener`

#### Call Signature

> **addEventListener**\<`K`\>(`type`, `listener`, `options?`): `void`

Adds a listener of an event of the table, typed by TableBroHTMLElementEventMap.

##### Type Parameters

###### K

`K` *extends* keyof [`TableBroHTMLElementEventMap`](TableBroHTMLElementEventMap.md)

##### Parameters

###### type

`K`

the name of the event

###### listener

(`this`, `event`) => `void`

the listener of the event

###### options?

`boolean` \| `AddEventListenerOptions`

the options of addEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.addEventListener`

#### Call Signature

> **addEventListener**(`type`, `listener`, `options?`): `void`

Adds a listener of any other event.

##### Parameters

###### type

`string`

the name of the event

###### listener

`EventListenerOrEventListenerObject`

the listener of the event

###### options?

`boolean` \| `AddEventListenerOptions`

the options of addEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.addEventListener`

***

### appendRows()

> **appendRows**\<`T`\>(`rows`, `options`): `void`

Adds the rows of the next page in the server mode. The local mode adds the rows to its rows and shows them through
its filters and sort, on the shown page.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### rows

`T`[]

the rows of the page

##### options

[`BroAppendRowsOptions`](BroAppendRowsOptions.md)

the number of the rows of the query on the server

#### Returns

`void`

***

### configure()

> **configure**\<`T`\>(`options`): `void`

Creates the table with its columns, its first rows and its config. New columns or a new config need a new table.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### options

[`BroConfigureOptions`](BroConfigureOptions.md)\<`T`\>

the columns, the rows and the config; without rows the table shows its loading state

#### Returns

`void`

***

### removeEventListener()

#### Call Signature

> **removeEventListener**\<`T`, `A`\>(`type`, `listener`, `options?`): `void`

Removes a listener of the actions of the table.

##### Type Parameters

###### T

`T` *extends* `object` = [`BroRow`](BroRow.md)

###### A

`A` *extends* `string` = `string`

##### Parameters

###### type

`"bro-action"`

the name of the event

###### listener

(`this`, `event`) => `void`

the listener of the event

###### options?

`boolean` \| `EventListenerOptions`

the options of removeEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.removeEventListener`

#### Call Signature

> **removeEventListener**\<`K`\>(`type`, `listener`, `options?`): `void`

Removes a listener of an event of the table.

##### Type Parameters

###### K

`K` *extends* keyof [`TableBroHTMLElementEventMap`](TableBroHTMLElementEventMap.md)

##### Parameters

###### type

`K`

the name of the event

###### listener

(`this`, `event`) => `void`

the listener of the event

###### options?

`boolean` \| `EventListenerOptions`

the options of removeEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.removeEventListener`

#### Call Signature

> **removeEventListener**(`type`, `listener`, `options?`): `void`

Removes a listener of any other event.

##### Parameters

###### type

`string`

the name of the event

###### listener

`EventListenerOrEventListenerObject`

the listener of the event

###### options?

`boolean` \| `EventListenerOptions`

the options of removeEventListener of the DOM

##### Returns

`void`

##### Overrides

`HTMLElement.removeEventListener`

***

### replaceRows()

> **replaceRows**\<`T`\>(`rows`, `options?`): `void`

Replaces the rows of the table; an empty array shows the empty state.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### rows

`T`[]

the new rows of the application

##### options?

[`BroReplaceRowsOptions`](BroReplaceRowsOptions.md)

in the server mode the number of the rows of the query and the state of an empty answer

#### Returns

`void`

***

### setState()

> **setState**(`state`): `void`

Shows a state of the loading of the application.

#### Parameters

##### state

[`BroTableState`](../type-aliases/BroTableState.md)

loading without rows, refreshing over the rows, fail, or idle, which ends a refresh

#### Returns

`void`

## Properties

### theme

> **theme**: [`BroUserTheme`](../type-aliases/BroUserTheme.md) \| `null`

The theme of this table; reflects the theme attribute. null returns the theme from config.theme.

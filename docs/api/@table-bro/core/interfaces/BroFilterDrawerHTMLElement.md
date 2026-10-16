# Interface: BroFilterDrawerHTMLElement

The \<table-bro-filter-drawer-container\> element: a table with a drawer of the filters of the application next to it, outside of it.

## Extends

- `HTMLElement`

## Methods

### addEventListener()

#### Call Signature

> **addEventListener**\<`T`, `A`\>(`type`, `listener`, `options?`): `void`

Adds a listener of the actions of the table in the drawer container, which bubble up; a listener that takes
CustomEvent\<BroActionDetail\<Order\>\> gets the columns and the rows of the application of type Order, and one of
BroActionDetail\<Order, 'edit'\> also the data of the actions of the table by their names.

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

Adds a listener of an event of the drawer, typed by BroFilterDrawerHTMLElementEventMap.

##### Type Parameters

###### K

`K` *extends* keyof [`BroFilterDrawerHTMLElementEventMap`](BroFilterDrawerHTMLElementEventMap.md)

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

### removeEventListener()

#### Call Signature

> **removeEventListener**\<`T`, `A`\>(`type`, `listener`, `options?`): `void`

Removes a listener of the actions of the table in the drawer container.

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

Removes a listener of an event of the drawer.

##### Type Parameters

###### K

`K` *extends* keyof [`BroFilterDrawerHTMLElementEventMap`](BroFilterDrawerHTMLElementEventMap.md)

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

### toggle()

> **toggle**(): `void`

Opens a closed drawer and closes an opened one.

#### Returns

`void`

## Properties

### mode

> **mode**: `"side"` \| `"over"`

side, by default: the drawer stands next to the table, and lies over it with a scrim when the table would get
narrower than its minimum width; over: the drawer lies over the table always. Reflects the mode attribute.

***

### opened

> **opened**: `boolean`

Whether the drawer is opened; reflects the opened attribute.

***

### texts?

> `optional` **texts?**: `Partial`\<[`BroTexts`](BroTexts.md)\>

The texts of the drawer, as the texts of its table: its title and the name of its close button.

# Interface: BroServerContainer\<MODEL, EXTRA\>

Page-level state contract for a server-driven table.

Extends BroContainer with server-specific state and query handling logic.

Implementations are responsible for:
- handling table queries
- calling backend services
- updating rows and total count

## Extends

- [`BroContainer`](BroContainer.md)\<`MODEL`\>

## Type Parameters

### MODEL

`MODEL` *extends* `object`

Row model displayed by the table

### EXTRA

`EXTRA` *extends* `object` = `object`

Additional backend-specific filter fields

## Properties

### cols

> **cols**: `Signal`\<`BroCol`\<`MODEL`\>[]\>

Reactive column definitions bound to the table

#### Inherited from

[`BroContainer`](BroContainer.md).[`cols`](BroContainer.md#cols)

***

### conf

> **conf**: `Signal`\<`BroConfig`\<`MODEL`\>\>

Reactive table configuration for the page

#### Inherited from

[`BroContainer`](BroContainer.md).[`conf`](BroContainer.md#conf)

***

### initTable

> **initTable**: () => `void`

Page-level initialization hook coordinating the facade

#### Returns

`void`

#### Inherited from

[`BroContainer`](BroContainer.md).[`initTable`](BroContainer.md#inittable)

***

### onQueryTable

> **onQueryTable**: (`query`) => `void`

Handles table queries emitted by the facade.
Triggers server communication and state updates.

#### Parameters

##### query

`BroQuery`\<`MODEL`, `EXTRA`\>

#### Returns

`void`

***

### rows

> **rows**: `Signal`\<`MODEL`[] \| `null` \| `undefined`\>

Reactive row data consumed by the template

#### Inherited from

[`BroContainer`](BroContainer.md).[`rows`](BroContainer.md#rows)

***

### rowsToAppend?

> `optional` **rowsToAppend?**: `Signal`\<`MODEL`[] \| `undefined`\>

***

### total

> **total**: `Signal`\<`number`\>

Reactive total row count provided by the backend

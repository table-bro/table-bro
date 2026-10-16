# Interface: BroContainer\<MODEL\>

Page-level table state contract.

Describes the local state and behavior of a page component that injects
and coordinates a BroFacade.

The container:
- adapts facade data for the page template
- owns page-specific reactive state
- orchestrates table initialization and lifecycle

All properties are writable signals owned by the page component.

## Extended by

- [`BroServerContainer`](BroServerContainer.md)

## Type Parameters

### MODEL

`MODEL` *extends* `object`

Row model displayed by the table

## Properties

### cols

> **cols**: `Signal`\<`BroCol`\<`MODEL`\>[]\>

Reactive column definitions bound to the table

***

### conf

> **conf**: `Signal`\<`BroConfig`\<`MODEL`\>\>

Reactive table configuration for the page

***

### initTable

> **initTable**: () => `void`

Page-level initialization hook coordinating the facade

#### Returns

`void`

***

### rows

> **rows**: `Signal`\<`MODEL`[] \| `null` \| `undefined`\>

Reactive row data consumed by the template

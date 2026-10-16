# Interface: BroService\<MODEL, API_QUERY, API_PAGE, EXTRA\>

Service contract responsible for translating between the table domain model
and a specific backend API.

BroService defines how:
- a generic BroQuery (pagination, sorting, filtering) is transformed into
  an API-specific request format
- an API-specific response is mapped back into a normalized BroServerPage

This abstraction allows the table component and its containers to remain
backend-agnostic, while each integration provides its own mapping logic.

## Type Parameters

### MODEL

`MODEL` *extends* `object`

### API_QUERY

`API_QUERY` = `unknown`

### API_PAGE

`API_PAGE` = `unknown`

### EXTRA

`EXTRA` *extends* `object` = `object`

## Properties

### mapServerQuery

> **mapServerQuery**: (`query`) => `API_QUERY`

#### Parameters

##### query

`BroQuery`\<`MODEL`, `EXTRA`\>

#### Returns

`API_QUERY`

***

### mapServerResponse

> **mapServerResponse**: (`response`) => [`BroServerPage`](BroServerPage.md)\<`MODEL`\>

#### Parameters

##### response

`API_PAGE`

#### Returns

[`BroServerPage`](BroServerPage.md)\<`MODEL`\>

# Interface: TableBroHTMLElementEventMap

The events of the \<table-bro\> element.

## Extends

- `HTMLElementEventMap`

## Properties

### bro-action

> **bro-action**: `CustomEvent`\<[`BroActionDetail`](../type-aliases/BroActionDetail.md)\<[`BroRow`](BroRow.md), `string`\>\>

Every action of the table, of its skin and of the custom cells; bubbles from the element of the action.

***

### bro-error

> **bro-error**: `CustomEvent`\<[`BroErrorDetail`](BroErrorDetail.md)\>

An error of the table with its stable code; the table shows its fail state. The event bubbles.

***

### bro-theme-change

> **bro-theme-change**: `CustomEvent`\<[`BroTheme`](../type-aliases/BroTheme.md)\>

The computed theme of the table changed.

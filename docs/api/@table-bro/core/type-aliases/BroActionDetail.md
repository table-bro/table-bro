# Type Alias: BroActionDetail\<T, A\>

> **BroActionDetail**\<`T`, `A`\> = `{ [K in BroTableAction]: { action: K; data: BroActionDataMap<T>[K]; selector?: string } }`\[[`BroTableAction`](BroTableAction.md)\] \| \{ `action`: `A`; `data?`: [`BroCellActionData`](../interfaces/BroCellActionData.md)\<`T`\>; `selector?`: `string`; \}

detail of the bro-action event: an action of the table with its data, or a custom action of the application, of a cell
with its column and row or of a toolbar button without data. A check of a custom action, such as case 'edit' of a switch
on action, gives data as BroCellActionData; the data of an action of the table is BroActionDataMap[action]. A, the names
of the custom actions, as 'edit' | 'delete', or never without them, lets a check of an action of the table narrow its
data too: with the default string, a custom action may have any name, and its data stays in the union.

## Type Parameters

### T

`T` *extends* `object` = [`BroRow`](../interfaces/BroRow.md)

### A

`A` *extends* `string` = `string`

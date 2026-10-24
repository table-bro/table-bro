# Function: resolveTexts()

> **resolveTexts**(`texts?`): [`BroTexts`](../interfaces/BroTexts.md)

The texts of a table: the ones of a config over the English ones, a field of a group or a text of the core over its
deprecated flat field. A text that is undefined leaves the one below it, the flat field or the English one.
The default range is the one of MatPaginatorIntl of Angular Material (MIT), with its numbers formatted.

## Parameters

### texts?

[`BroTextsConfig`](../type-aliases/BroTextsConfig.md)

the texts of a config, by their groups or flat

## Returns

[`BroTexts`](../interfaces/BroTexts.md)

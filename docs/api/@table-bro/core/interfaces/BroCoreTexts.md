# Interface: BroCoreTexts

The texts of the parts of the table that the core renders, which no component of a skin holds: flat at the top level
of the texts of a config, named as the options of BroConfig, rowCounter* for the column of the row numbers and
rowDetails* for the row details.

## Since

1.2.0

## Properties

### rowCounterLabel

> **rowCounterLabel**: `string`

The name of the column of the row numbers for screen readers, whose short title they would read as a word.

***

### rowCounterTitle

> **rowCounterTitle**: `string`

The title of the column of the row numbers.

***

### rowDetailsLoadingMessage

> **rowDetailsLoadingMessage**: `string`

The message of the live region of the table while row details load from the server, for screen readers.

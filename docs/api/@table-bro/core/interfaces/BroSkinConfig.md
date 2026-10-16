# Interface: BroSkinConfig

The config of a skin, which registerSkin registers: its classes, its components and the attribute of its color mode.

## Properties

### components

> **components**: [`BroSkinComponents`](BroSkinComponents.md)

The components of the skin.

***

### css

> **css**: [`BroConfigCSS`](BroConfigCSS.md)

The classes of the table in the skin.

***

### themeAttribute?

> `optional` **themeAttribute?**: `string`

The attribute of the color mode of the UI library of the skin, as data-bs-theme of Bootstrap: a table with a theme
of its own sets it on its host to 'light' or 'dark', so the components of the library in the table take that mode.

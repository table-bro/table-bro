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

### defineElements?

> `optional` **defineElements?**: (`registry`) => `void`

Defines the elements of the skin in a registry of custom elements, unless they are defined. The module of a skin of
custom elements calls it with the registry of the page; prerenderTableBro() calls it with the registry of the window
of the server DOM, which the module of the skin, loaded without a DOM, has not found.

#### Parameters

##### registry

`CustomElementRegistry`

the registry of the custom elements

#### Returns

`void`

***

### elements?

> `optional` **elements?**: `Record`\<`string`, `string`\>

The optional elements of the skin: the function that defines each one, by its tag. A table that uses one of them
undefined names the function in the console.

***

### themeAttribute?

> `optional` **themeAttribute?**: `string`

The attribute of the color mode of the UI library of the skin, as data-bs-theme of Bootstrap: a table with a theme
of its own sets it on its host to 'light' or 'dark', so the components of the library in the table take that mode.

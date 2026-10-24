# Function: prerenderTableBro()

> **prerenderTableBro**\<`T`\>(`element`, `options`): `void`

Renders a \<table-bro\> element of a server DOM in the loading state of its columns and config, as the prerender of a
framework does: the regions of the table, the elements of its skin, which the server render of the framework renders
then, and the heights of the skin in CSS. It measures and animates nothing and leaves nothing running. In the browser
configure() on the same element renders the table in its place, at the same height. The table creates its nodes in the
document of the element: the render needs no global document. The custom elements of a skin render where the window of
that document has a registry of custom elements: the skin defines them in it (BroSkinConfig.defineElements).

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### element

`HTMLElement`

the \<table-bro\> element of the server DOM, empty

### options

[`BroConfigureOptions`](../interfaces/BroConfigureOptions.md)\<`T`\>

the columns and the config of configure(); the rows wait for the browser

## Returns

`void`

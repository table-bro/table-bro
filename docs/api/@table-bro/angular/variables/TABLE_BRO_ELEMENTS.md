# Variable: TABLE\_BRO\_ELEMENTS

> `const` **TABLE\_BRO\_ELEMENTS**: `InjectionToken`\<[`TableBroSkinElements`](../interfaces/TableBroSkinElements.md)[]\>

The elements of the skins for the prerender. The server DOM of Angular has no custom elements, so the prerender renders
the components of the elements into the elements of the table itself; a skin of Angular components provides them, as
provideTableBroMatSkin() does. A skin of custom elements needs none: the prerender gives the server DOM a registry of
custom elements, where the skin defines its elements (BroSkinConfig.defineElements). A table of a skin with neither
keeps an empty host on the server.

# Interface: BroToolbarMainTexts

The texts of the main line of the toolbar, components.toolbarMain of a skin: the group toolbarMain of the texts of a
config.

## Since

1.2.0

## Properties

### buttonRole

> **buttonRole**: `string`

The word after the titles of the buttons of the toolbar of the skins bs and nv, as visually hidden text: their role.
Their links, as Filters or Read more, get a descriptive text for search engines, Filters button. A screen reader
hears the role button of the link and not the word. An empty word adds no text.

***

### menuItemRole

> **menuItemRole**: `string`

The words after the titles of the items of the menu of the toolbar of the skin bs, as visually hidden text: their
role. Their links, as Print or Learn more, get a descriptive text for screen readers and search engines, Print menu
item. An empty string adds no text.

***

### menuRole

> **menuRole**: `string`

The word after the title of the menu of the toolbar of the skin bs, as visually hidden text: its role. The link of
the menu, as More, gets a descriptive text for screen readers and search engines, More menu. An empty word adds no
text.

***

### search

> **search**: `string`

The search button of the toolbar.

***

### searchRole

> **searchRole**: (`title`) => `string`

The words after the title of the search of the toolbar of the skins bs and nv, as visually hidden text, by the title
of the toolbar: what it searches. Its link, as Search, gets a descriptive text for screen readers and search engines,
Search for Orders, or Search for rows without a title. An empty string that it returns adds no text.

#### Parameters

##### title

`string`

#### Returns

`string`

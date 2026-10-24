# @table-bro/native

The native skin of [Table, Bro](https://table-bro.com): data tables on the native controls of the browser, without a
UI library. The skin is `nv`.

## With an AI coding agent

The skin `nv` gives a table made by the agent plain HTML elements and no UI library, for any framework. Tell your AI
assistant to use Table, Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the packages,
generates the table, its setup and its cells from one request, and checks the result.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.2.0
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install

```sh
npm install @table-bro/core @table-bro/native
```

## Use

Link the CSS of the core and of the skin, each from its package:

```html
<link rel="stylesheet" href="node_modules/@table-bro/core/dist/table-bro.min.css">
<link rel="stylesheet" href="node_modules/@table-bro/native/dist/table-bro.native.min.css">
```

Import the core and the skin once, before the tables. The import registers the skin:

```ts
import '@table-bro/core';
import '@table-bro/native';

const table = document.createElement('table-bro');

table.configure({
  cols: [
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ],
  rows: [{description: 'Modern Cotton Chair', price: 1}],
  conf: {skin: 'nv'}
});

document.body.append(table);
```

Without a bundler, load the UMD build after the core: it puts the skin on the `TableBroNative` global.

```html
<script src="https://cdn.jsdelivr.net/npm/@table-bro/core@1.2.0/dist/table-bro.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@table-bro/native@1.2.0/dist/table-bro.native.umd.js"></script>
```

Load one vanilla skin per page: `@table-bro/native` and `@table-bro/bootstrap` share elements, and the skin loaded
second warns about it.

## Elements for cells

The elements of the cells are optional: a page carries their code only when it defines them. After the import of the
skin, `withTags()` defines `bro-nv-tags` and `withSwitch()` defines `bro-switch`:

```ts
import {withSwitch, withTags} from '@table-bro/native';

withTags();
withSwitch();
```

Or define an element itself: `customElements.define('bro-nv-tags', BroNativeTagsComponent)`. The UMD build carries the code of both
and has the same functions on its global, as `TableBroNative.withTags()`. A table that uses an element that is not defined
names its function in the console.

A cell of tags without items shows No data: `withTags({texts: {empty: 'No tags'}})` gives the text of the
application, and `setTagsTexts({empty})` changes it at any time, as when the language of the page changes; the tags on
the page take it at once. Since 1.2.0; the deprecated `texts.noItems` of a config still works below them.

| Element | Value |
| --- | --- |
| `bro-nv-tags` | An array of strings in `row[col.name]`; the tags that do not fit become an ellipsis |
| `bro-switch` | A boolean from the attribute `checked`: `attrs: {checked: (_col, row) => row.done}`. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

## Settings

`nativeSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values
or functions, at any depth, for that table. The sizes and timings are CSS variables of the table: see the README of
`@table-bro/core`.

The skin has a light and a dark theme, as the README of `@table-bro/core` describes.

## License

MIT

# @table-bro/solid-suid

The SUID skin of [Table, Bro](https://table-bro.com): Material data tables built from the components of
[SUID](https://suid.dev), the port of MUI to Solid, in the SUID theme of the application, with the sizes of the tables
of the skin Angular Material. The skin is `suid`.

The package holds the config of the skin, its elements (Custom Elements that render the components of SUID in Solid
roots of their own) and its CSS. The table itself is `<table-bro>` of `@table-bro/core`, in the JSX of the application.

## With an AI coding agent

Tell your AI assistant to use Table, Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the
packages, generates the table, its setup and its cells from one request, and checks the result. The table is a module
that renders `<table-bro>` into a container, which a component of Solid gives it from `onMount()`.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.2.1
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install

In a project of Solid 1.9 with SUID 0.19, built by Vite with the plugin of Solid, which compiles the components of
SUID: SUID publishes them as JSX.

```sh
npm install @table-bro/core @table-bro/solid-suid @suid/material
```

SUID supports Solid 1: a project of Solid 2 waits for a release of SUID for it.

## Set up

`setSuidTheme()` gives the SUID theme of the application to the components of SUID in the table, and writes the CSS
variables of the theme, which the parts of the table read. The application renders the same theme with
`ThemeProvider`, as SUID describes:

```ts
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/solid-suid/dist/table-bro.solid-suid.min.css';
import {setSuidTheme} from '@table-bro/solid-suid';

import {createTheme} from '@suid/material/styles';

export const theme = createTheme();

setSuidTheme(theme);
```

The import of the package registers the skin and defines its elements. The elements that only some tables use are
optional: a page carries their code only when it calls their functions. `withTags()` adds the tags, `withSwitch()` the
switch. A table that uses an optional element without its function writes the function to add in the console.

A cell of tags without items shows No data: `withTags({texts: {empty: 'No tags'}})` gives the text of the application,
and `setTagsTexts({empty: 'No tags'})` changes it at any time, as when the language of the page changes.

The skin shows the ligature icons of Material. Load the font in `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

## Use

```tsx
import {onMount} from 'solid-js';

import type {BroCol, BroConfig, BroRow, TableBroHTMLElement} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const cols: BroCol<Order>[] = [
  {title: 'Description', name: 'description'},
  {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
];

const rows: Order[] = [
  {description: 'Modern Cotton Chair', price: 100},
  {description: 'Awesome Concrete Ball', price: 200}
];

const conf: BroConfig = {skin: 'suid', toolbarTitle: 'Orders'};

export function Orders() {
  let table!: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro ref={table}></table-bro>
    </div>
  );
}
```

Solid renders the root of a new element at once, also inside its effects, so the table measures the elements of the
skin rendered and an application calls `configure()` in `onMount()`. The values that change later, as the value of the
progress bar, render at once outside the effects of Solid and at the end of its updates inside them.

## Theme

The skin has no theme of its own: it takes the SUID theme of the application. The components of SUID in the table take
the theme of `setSuidTheme()`, its palette, typography, shapes and the settings of its components. SUID, a port of MUI
5, writes no CSS variables, so the skin writes the ones that the parts of the table read, as its rows and its header,
into a stylesheet of its own, with the names of the CSS variables of MUI: `--suid-palette-*`, `--suid-font-*` and
`--suid-shadows-16`. A theme whose palette is a getter, as one that follows the color scheme of the system, changes them
with the application, and so does a new theme of `setSuidTheme()`:

```ts
import {createPalette, createTheme} from '@suid/material/styles';
import {createMemo, createRoot}     from 'solid-js';

const palette = createRoot(() => createMemo(() => createPalette({mode: dark() ? 'dark' : 'light'})));

export const theme = createTheme({palette});
```

A table with a theme of its own, as `theme="dark"` in a light application, sets `data-suid-theme` on itself, and takes
the colors of that scheme: the skin writes the variables of each scheme for the rule `table-bro[data-suid-theme="dark"]`,
and the components of SUID in the table take the theme of the scheme. The theme of the other scheme has the main colors
of the palette of the application, as `primary`, its typography and its shapes, and the colors of the scheme of SUID.

## Parts that SUID does not port

SUID has no table pagination, no sort label and no tooltip. The skin takes the paginator and the sort header of the
vanilla skins, styled as the table pagination and the sort label of MUI in the theme of SUID, with the select of SUID
for the page sizes. Its tooltips render on the Popper of SUID in the look of the tooltip of MUI, with the behavior and
the positions of the tooltips of the skin mat: right of the sort headers, above the values of the cells, the buttons of
the toolbar and the buttons of the paginator. They show on the hover, the focus of the keyboard and a long press of a
touch, and hide when the pointer leaves, the focus goes, or Escape is pressed.

## Tooltip

`attachSuidTooltip(target, text, options?)` gives an element of the application the tooltip of the skin, as the buttons
of a cell or of a dialog take `matTooltip` in the skin mat: on the Popper of SUID, in the theme of the table of the
element, in a table or out of it. The text is a string, or a function that gives it each time the tooltip shows;
`options.placement` is `'top'`, the default, or `'right'`. It returns the function that takes the tooltip off the
element. In a component of Solid:

```tsx
import {onCleanup} from 'solid-js';

import {attachSuidTooltip} from '@table-bro/solid-suid';

<IconButton aria-label="Edit" ref={button => onCleanup(attachSuidTooltip(button, 'Edit'))}>
```

In a cell of Vanilla JS, the release of the cell takes it off:

```ts
const release = attachSuidTooltip(button, 'Edit');
```

## Elements for cells

The elements of the cells are optional: `withTags()` adds `bro-suid-tags`, `withSwitch()` adds `bro-suid-switch`.

| Element | Value |
| --- | --- |
| `bro-suid-tags` | An array of strings in `row[col.name]`, as the chips of SUID; the chips that do not fit become an ellipsis |
| `bro-suid-switch` | A boolean in `row[col.name]`, as the switch of SUID. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

```ts
{title: 'Done', name: 'done', component: {selector: 'bro-suid-switch', attrs: {name: 'order-done'}, event: 'action'}}
```

## Settings

`suidSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values or
functions, at any depth, for that table. The sizes and timings are CSS variables of the table, as `--bro-row-height`: see
the README of `@table-bro/core`.

## Server render

The elements of the skin render with Solid in the browser. A prerender of a table on the server, `prerenderTableBro()`
of `@table-bro/core`, leaves them empty, and the console names it once; the browser renders the table in its place.

## Build

```sh
npm run build -w @table-bro/solid-suid
```

The root of the repository builds the package after the core: `npm run build`.

## License

MIT

MUI is a trademark of its owner, and SUID is the project of its authors. Table, Bro is not affiliated with SUID or MUI or
endorsed by them: this package uses the public components and the theme of SUID, which the application installs.

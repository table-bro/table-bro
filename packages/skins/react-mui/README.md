# @table-bro/react-mui

The MUI skin of [Table, Bro](https://table-bro.com): Material data tables built from the components of
[MUI](https://mui.com/material-ui/) (Material UI) for React and Preact, in the MUI theme of the application, with the
sizes of the tables of the skin Angular Material. The skin is `mui`.

The package holds the config of the skin, its elements (Custom Elements that render the components of MUI in React roots
of their own) and its CSS. The table itself is `<table-bro>` of `@table-bro/core`, in the JSX of the application.

## With an AI coding agent

Tell your AI assistant to use Table, Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the
packages, generates the table, its setup and its cells from one request, and checks the result. The table is a module
that renders `<table-bro>` into a container, which a component of React or Preact gives it from an effect.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.2.1
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install

In a project of React 19 with MUI 9:

```sh
npm install @table-bro/core @table-bro/react-mui @mui/material @emotion/react @emotion/styled
```

A project of Preact takes React from `preact/compat`: the aliases `react`, `react-dom` and `react/jsx-runtime` of its
bundler, as the setup of MUI for Preact gives them. The working page of
[`samples/react-mui/preact`](https://github.com/table-bro/table-bro/tree/main/samples/react-mui/preact) has them in its
`vite.config.ts`.

## Set up

The table reads the colors of the MUI theme of the application from its CSS variables, so the theme turns them on
(`cssVariables`), and the application renders it with `ThemeProvider`, as MUI describes. `setMuiTheme()` gives the theme
to the components of MUI in the table:

```ts
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
import {setMuiTheme} from '@table-bro/react-mui';

import {createTheme} from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'},
  colorSchemes: {light: true, dark: true}
});

setMuiTheme(theme);
```

The import of the package registers the skin and defines its elements. The elements that only some tables use are
optional: a page carries their code only when it calls their functions. `withTags()` adds the tags, `withSwitch()` the
switch. A table that uses an optional element without its function writes the function to add in the console.

A cell of tags without items shows No data: `withTags({texts: {empty: 'No tags'}})` gives the text of the application,
and `setTagsTexts({empty: 'No tags'})` changes it at any time, as when the language of the page changes.

The skin shows the ligature icons of Material. Load the font in `index.html`, or give the icons of MUI the class of your
font by `components.MuiIcon.defaultProps.baseClassName` of the theme:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

## Use

```tsx
import {useEffect, useRef} from 'react';

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

const conf: BroConfig = {skin: 'mui', toolbarTitle: 'Orders'};

export function Orders() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;

    queueMicrotask(() => element.configure({cols, rows, conf}));
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro ref={table}></table-bro>
    </div>
  );
}
```

The elements of the skin render at once, by `flushSync` of React, since the table measures them right after it adds
them. React puts off such a render inside its own render and effects, until their end: there the table would measure
elements that are not rendered yet. So an application of React calls `configure()` and the other methods of the table
outside them, as `queueMicrotask()` in an effect does above, or in an event handler. The console names a call that React
put off. Preact renders at once everywhere: an application of Preact calls the methods in its effects as they are.

## Theme

The skin has no theme of its own: it takes the MUI theme of the application. The components of MUI in the table take
the theme of `setMuiTheme()`, its palette, typography, shapes and the settings of its components, and the parts of the
table, as its rows and its header, read the CSS variables of the theme, `--mui-palette-*`, `--mui-font-*` and
`--mui-shadows-*`. A dark scheme of the theme changes the variables, so the table turns dark with the application. A
table with a theme of its own, as `theme="dark"`, sets `data-mui-color-scheme` on itself: a theme whose
`colorSchemeSelector` is `data-mui-color-scheme` gives it that scheme.

## Elements for cells

The elements of the cells are optional: `withTags()` adds `bro-mui-tags`, `withSwitch()` adds `bro-mui-switch`.

| Element | Value |
| --- | --- |
| `bro-mui-tags` | An array of strings in `row[col.name]`, as the chips of MUI; the chips that do not fit become an ellipsis |
| `bro-mui-switch` | A boolean in `row[col.name]`, as the switch of MUI. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

```ts
{title: 'Done', name: 'done', component: {selector: 'bro-mui-switch', attrs: {name: 'order-done'}, event: 'action'}}
```

## Settings

`muiSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values or
functions, at any depth, for that table. The sizes and timings are CSS variables of the table, as `--bro-row-height`: see
the README of `@table-bro/core`.

## Server render

The elements of the skin render with React in the browser. A prerender of a table on the server, `prerenderTableBro()`
of `@table-bro/core` in a server DOM such as linkedom, renders them too with the server entry of the package,
`@table-bro/react-mui/server`: the toolbar, the sort labels, the progress bar and the paginator of MUI in the loading
state of the table, with the styles of Emotion in their markup. The server DOM gives its `HTMLElement` to the global
scope before the import of the entry, since the elements extend it:

```ts
import {parseHTML} from 'linkedom';

const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;

const {prerenderTableBro} = await import('@table-bro/core');
const {setMuiTheme}       = await import('@table-bro/react-mui/server');
```

The bundle of the browser does not carry the server entry, which renders by `react-dom/server`. Without it the
package registers only the config of the skin on the server, and a prerender leaves the elements of the skin empty.
The browser keeps the prerendered elements until `configure()` renders the table in their place. The setup with
Next.js is on the page [Next.js](https://table-bro.com/docs/ssr/nextjs), and the setup of Preact with Astro on the page
[Preact (Astro)](https://table-bro.com/docs/ssr/preact).

## Build

```sh
npm run build -w @table-bro/react-mui
```

The root of the repository builds the package after the core: `npm run build`.

## License

MIT

MUI is a trademark of its owner. Table, Bro is not affiliated with MUI or endorsed by it: this package uses the
public components and the theme of MUI, which the application installs.

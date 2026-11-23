# @table-bro/svelte-m3

The Svelte M3 skin of [Table, Bro](https://table-bro.com): Material 3 data tables built from the components of [M3
Svelte](https://github.com/KTibow/m3-svelte) for Svelte 5, in the Material 3 theme of the application, with the sizes of
the tables of the skin Angular Material. The skin implements Material M3. The skin is `m3-svelte`.

The package holds the config of the skin, its elements (Custom Elements that mount the components of M3 Svelte) and its
CSS. The table itself is `<table-bro>` of `@table-bro/core`, in the markup of a component of the application.

## Install with an AI coding agent

Tell your AI assistant to use Table, Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the
packages, generates the table, its setup and its cells from one request, and checks the result. The table is a module
that renders `<table-bro>` into a container, which a component of Svelte gives it in `onMount()`.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.3.0
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install manually

In a project of Svelte 5 with M3 Svelte 7 and Vite:

```sh
npm install @table-bro/core @table-bro/svelte-m3 m3-svelte
npm install -D vite-plugin-functions-mixins
```

M3 Svelte publishes its components as their sources: the bundler of the application compiles them with
`@sveltejs/vite-plugin-svelte`, and the CSS of their styles with `vite-plugin-functions-mixins`, as M3 Svelte describes:

```ts
import {svelte}          from '@sveltejs/vite-plugin-svelte';
import {defineConfig}    from 'vite';
import {functionsMixins} from 'vite-plugin-functions-mixins';

export default defineConfig({
  plugins: [svelte(), functionsMixins({deps: ['m3-svelte']})]
});
```

`vite-plugin-functions-mixins` names Vite 7 as its peer dependency and works with Vite 8: a project of Vite 8 lets npm
install it by an override in its `package.json`:

```json
"overrides": {
  "vite-plugin-functions-mixins": {
    "vite": "$vite"
  }
}
```

## Set up

The table reads the colors of the M3 Svelte theme of the application, its CSS variables `--m3c-*`, as the components of
M3 Svelte do: the application imports the styles of M3 Svelte and its theme, as the theme page of M3 Svelte writes it,
with the function `--m3-density` and the colors of the light and the dark scheme. Then it imports the CSS of the table
and the skin:

```ts
import './theme.css';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/svelte-m3/dist/table-bro.svelte-m3.min.css';
import '@table-bro/svelte-m3';
```

```css
/* theme.css */
@import "m3-svelte/etc/styles.css";
@import "m3-svelte/etc/recommended-styles.css";

@function --m3-density(--size) {
  result: var(--size);
}

:root {
  color-scheme: light dark;
}

@layer tokens {
  :root {
    --m3c-surface: light-dark(#fdf7fe, #0f0d12);
    --m3c-on-surface: light-dark(#34313a, #eae3ef);
    /* ... the other colors of the theme */
  }
}
```

The import of the package registers the skin and defines its elements. The elements that only some tables use are
optional: a page carries their code only when it calls their functions. `withTags()` adds the tags, `withSwitch()` the
switch. A table that uses an optional element without its function writes the function to add in the console.

A cell of tags without items shows No data: `withTags({texts: {empty: 'No tags'}})` gives the text of the application,
and `setTagsTexts({empty: 'No tags'})` changes it at any time, as when the language of the page changes.

The skin shows the icons of Material Symbols by their names, as the icons of the config of a table name them. Load the
font in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
```

## Use

```svelte
<script lang="ts">
  import {onMount} from 'svelte';

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

  const conf: BroConfig = {skin: 'm3-svelte', toolbarTitle: 'Orders'};

  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro bind:this={table}></table-bro>
</div>
```

The elements of the skin render at once: `mount()` of Svelte renders a component synchronously, and an element renders
a change by `flushSync()`, since the table measures the elements right after it adds them. An application of Svelte
calls `configure()` and the other methods of the table where it needs, as in `onMount()` above.

## Theme

The skin has no theme of its own: it takes the M3 Svelte theme of the application. The components of M3 Svelte in the
table read its CSS variables themselves, and the parts of the table, as its rows and its header, read the same
variables in the roles of a table of Material 3: `--m3c-surface`, `--m3c-on-surface`, `--m3c-outline`, the
shapes `--m3-shape-*`, the elevations `--m3-elevation-*` and the font `--m3-font`. The theme writes its colors with
`light-dark()`, so the table turns dark with the color scheme of the page. A table with a theme of its own, as
`theme="dark"`, takes that color scheme. The outlines of the rows, of the header and of the toolbar take the property
`--bro-m3-svelte-outline-color`, the outline of the theme by default, which an application sets for its tables:

```css
.m3-svelte {
  --bro-m3-svelte-outline-color: light-dark(rgba(0, 0, 0, .12), #798180);
}
```

M3 Svelte has no component of a table, a toolbar, a sort header or an indeterminate progress bar, and does not export
its tooltip: the skin builds them from the tokens of the theme, in the look of Material 3. The tooltips of the sort
headers, the cut cells and the buttons of the toolbar are the plain tooltip of Material 3 with the behavior of the
tooltips of the skin Angular Material: a hover of the pointer and a focus of the keyboard show them, Escape hides them,
and a touch shows them after a long press. The buttons, the menu of the toolbar, the select of the page size, the
chips, the switch and the determinate progress bar are the components of M3 Svelte.

## Elements for cells

The elements of the cells are optional: `withTags()` adds `bro-m3-svelte-tags`, `withSwitch()` adds
`bro-m3-svelte-switch`.

| Element | Value |
| --- | --- |
| `bro-m3-svelte-tags` | An array of strings in `row[col.name]`, as the input chips of M3 Svelte; the chips that do not fit become an ellipsis |
| `bro-m3-svelte-switch` | A boolean in `row[col.name]`, as the switch of M3 Svelte. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

```ts
{title: 'Done', name: 'done', component: {selector: 'bro-m3-svelte-switch', attrs: {name: 'order-done'}, event: 'action'}}
```

## Tooltip

M3 Svelte does not export a tooltip, so the skin has its own: the plain tooltip of Material 3 in the tokens of the
theme of M3 Svelte, with the behavior of the tooltips of the skin Angular Material, as `matTooltip`. The skin shows it
on its sort headers, its cut cells and the buttons of its toolbar, and `attachM3SvelteTooltip()` gives it to the nodes
of the application, as the buttons of a cell, in place of the attribute `title`:

```ts
import {attachM3SvelteTooltip} from '@table-bro/svelte-m3';

const button = document.createElement('button');

button.textContent = 'Edit';
cell.append(button);

// Above the button, the side of matTooltipPosition="above"; the returned function removes the tooltip
const release = attachM3SvelteTooltip(button, 'Edit the order');
```

A hover of the pointer shows the tooltip at once and its leave hides it; a focus of the keyboard shows it and a blur
hides it; Escape and a wheel away from the target hide it; a touch shows it after a long press and hides it 1.5 s after
its end. It shows 8px from the target on the side of its option `position`, `'above'` or `'right'`, or on the opposite
side when it has no room there. The text may be a function, which gives it at the time the tooltip shows; an empty text
shows no tooltip. The parent of the target holds the popover of the tooltip, or the element of the option `host`, and
the tooltip takes its color scheme. In a component of Svelte an attachment gives it to an element:

```svelte
<button {@attach node => attachM3SvelteTooltip(node, 'Edit the order')}>Edit</button>
```

The CSS of the skin styles the tooltip on every node of the page, in a table or out of it. A server DOM has no pointer
and no focus: the target gets no tooltip there.

## Settings

`m3SvelteSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values
or functions, at any depth, for that table. The sizes and timings are CSS variables of the table, as `--bro-row-height`:
see the README of `@table-bro/core`.

## Server render

The elements of the skin mount the components of M3 Svelte in the browser. A prerender of a table on the server,
`prerenderTableBro()` of `@table-bro/core` in a server DOM such as linkedom, renders them too with the server entry of
the package, `@table-bro/svelte-m3/server`: the toolbar, the sort headers, the progress bar and the paginator with the
components of M3 Svelte in the loading state of the table, by `render()` of `svelte/server`, which is synchronous. The
bundler of the server compiles the components of M3 Svelte for the server, as SvelteKit does; the condition `svelte`
of the exports of the package lets the plugin of Svelte bundle the skin with them. The server DOM gives its
`HTMLElement` to the global scope before the server imports the core and the skin, since the elements extend it, as the
hooks of the server of SvelteKit do:

```ts
// src/hooks.server.ts
import {parseHTML} from 'linkedom';

globalThis.HTMLElement ??= parseHTML('<!doctype html><html><body></body></html>').window.HTMLElement;
```

```ts
import {prerenderTableBro} from '@table-bro/core';
import '@table-bro/svelte-m3/server';
import {parseHTML} from 'linkedom';

const {document} = parseHTML('<!doctype html><html><body></body></html>');
const table = document.createElement('table-bro');

document.body.append(table);
prerenderTableBro(table, {cols, conf});
```

The bundle of the browser does not carry the server entry. Without it the package registers only the config of the
skin on the server, and a prerender leaves the elements of M3 Svelte empty. The browser keeps the prerendered elements
until `configure()` renders the table in their place. The setup with SvelteKit is on the page
[SvelteKit](https://table-bro.com/docs/ssr/sveltekit).

## Your own skin

This skin is one of the skins of Table, Bro, with `@table-bro/angular-material`, `@table-bro/react-mui`,
`@table-bro/solid-suid`, `@table-bro/vue-vuetify`, `@table-bro/bootstrap` and `@table-bro/native`. A skin of your design
system, or of the component library of your framework, is built the same way: see [Create your own
skin](https://github.com/table-bro/table-bro#create-your-own-skin) in the README of the repository and [Your own
skin](https://table-bro.com/docs/design/your-own-skin) in the Docs.

## Build

```sh
npm run build -w @table-bro/svelte-m3
```

The root of the repository builds the package after the core: `npm run build`.

## License

MIT

Svelte and M3 Svelte are trademarks of their owners. Table, Bro is not affiliated with M3 Svelte or endorsed by it: this
package uses the public components and the theme of M3 Svelte, which the application installs.

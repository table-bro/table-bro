# @table-bro/vue-vuetify

The Vue Vuetify skin of [Table, Bro](https://table-bro.com): Material data tables built from the components of
[Vuetify](https://vuetifyjs.com/) for Vue, in the themes of the Vuetify of the application, with the sizes of the tables
of the skin Angular Material. The skin implements Material M3 with the blueprint `md3` of Vuetify, which the setup below
installs. The skin is `vuetify`.

The package holds the config of the skin, its elements (Custom Elements that render the components of Vuetify in Vue
roots of their own) and its CSS. The table itself is `<table-bro>` of `@table-bro/core`, in the template of the
application.

## With an AI coding agent

Tell your AI assistant to use Table, Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the
packages, generates the table, its setup and its cells from one request, and checks the result. The table is a module
that renders `<table-bro>` into a container, which a component of Vue gives it in `onMounted()`.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.2.2
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install

In a project of Vue 3 with Vuetify 4:

```sh
npm install @table-bro/core @table-bro/vue-vuetify vuetify
```

Vue compiles `<table-bro>` of a template as a Custom Element when its plugin knows the tag, in `vite.config.ts`:

```ts
vue({template: {compilerOptions: {isCustomElement: tag => tag.startsWith('table-bro')}}})
```

## Set up

The table reads the colors of the themes of Vuetify from the CSS variables that Vuetify writes, so the application
imports the styles of Vuetify and installs it, as Vuetify describes. `setVuetify()` gives the same instance to the
components of Vuetify in the table:

```ts
import 'vuetify/styles';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css';
import {setVuetify} from '@table-bro/vue-vuetify';

import {createApp}     from 'vue';
import {createVuetify} from 'vuetify';
import {md3}           from 'vuetify/blueprints';

import App from './App.vue';

const vuetify = createVuetify({blueprint: md3});

setVuetify(vuetify);
createApp(App).use(vuetify).mount('#app');
```

The import of the package registers the skin and defines its elements. The elements that only some tables use are
optional: a page carries their code only when it calls their functions. `withTags()` adds the tags, `withSwitch()` the
switch. A table that uses an optional element without its function writes the function to add in the console.

A cell of tags without items shows No data: `withTags({texts: {empty: 'No tags'}})` gives the text of the application,
and `setTagsTexts({empty: 'No tags'})` changes it at any time, as when the language of the page changes.

The skin shows the ligature icons of Material, whatever icon set the application gives Vuetify. Load the font in
`index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

The components of Vuetify in the table show the icons of its icon set, as the arrow of the select of the page size:
the set `md` of `vuetify/iconsets/md` takes the same font, `icons: {defaultSet: 'md', aliases, sets: {md}}` of
`createVuetify()`. An application with another font of the same ligatures gives its class: `setVuetify(vuetify, {iconClass:
'material-symbols-rounded'})` for Material Symbols Rounded.

## Use

```vue
<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

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

const conf: BroConfig = {skin: 'vuetify', toolbarTitle: 'Orders'};

const table = useTemplateRef<TableBroHTMLElement>('table');

onMounted(() => table.value!.configure({cols, rows, conf}));
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro ref="table"></table-bro>
  </div>
</template>
```

The elements of the skin render at once, by `render()` of Vue, which patches their components before it returns, since
the table measures them right after it adds them. So an application calls `configure()` and the other methods of the
table where it likes: in `onMounted()`, in a watcher or in an event handler.

## Theme

The skin has no theme of its own: it takes the themes of the Vuetify of the application. The components of Vuetify in
the table take the instance of `setVuetify()`, its current theme, its defaults, as the ones of a blueprint, its icons and
its locale, and the parts of the table, as its rows and its header, read the CSS variables of the theme, as
`--v-theme-surface`, `--v-theme-on-surface` and `--v-border-color`, and its typography classes. A change of the theme of
the application changes the variables, so the table turns dark with the application. A table with a theme of its own,
as `theme="dark"`, sets `data-vuetify-theme` on itself: the stylesheet that `setVuetify()` writes, and updates when the
themes change, gives it and the components in it the variables of the theme of that name, `light` or `dark`. The menus
and the tooltips of the table open in the overlay of Vuetify on the page, in the theme of the application.

## Elements for cells

The elements of the cells are optional: `withTags()` adds `bro-vuetify-tags`, `withSwitch()` adds `bro-vuetify-switch`.

| Element | Value |
| --- | --- |
| `bro-vuetify-tags` | An array of strings in `row[col.name]`, as the chips of Vuetify; the chips that do not fit become an ellipsis |
| `bro-vuetify-switch` | A boolean in `row[col.name]`, as the inset switch of Vuetify. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

```ts
{title: 'Done', name: 'done', component: {selector: 'bro-vuetify-switch', attrs: {name: 'order-done'}, event: 'action'}}
```

## Settings

`vuetifySkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values
or functions, at any depth, for that table. The sizes and timings are CSS variables of the table, as `--bro-row-height`:
see the README of `@table-bro/core`.

## Server render

The elements of the skin render with Vue in the browser. A prerender of a table on the server, `prerenderTableBro()`
of `@table-bro/core` in a server DOM such as linkedom, renders them too with the server entry of the package,
`@table-bro/vue-vuetify/server`: the toolbar, the sort headers, the progress bar and the paginator of Vuetify in the
loading state of the table. The prerender renders the elements at once, so the entry renders each of them by the
synchronous part of the server render of Vue, `ssrRenderVNode`, which `renderToString` runs inside its promise: the
components of the skin have no asynchronous setup. The server DOM gives its `HTMLElement` to the global scope before
the import of the entry, since the elements extend it, and `setVuetify()` gives the Vuetify of the render of the server:

```ts
import {parseHTML} from 'linkedom';

const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;

const {prerenderTableBro} = await import('@table-bro/core');
const {setVuetify}        = await import('@table-bro/vue-vuetify/server');
```

The bundle of the browser does not carry the server entry. Without it the package registers only the config of the
skin on the server, and a prerender leaves the elements of the skin empty, which the console names once. The browser
keeps the prerendered elements until `configure()` renders the table in their place. The setup with Nuxt is on the page
[Nuxt](https://table-bro.com/docs/ssr/nuxt).

## Your own skin

This skin is one of the skins of Table, Bro, with `@table-bro/angular-material`, `@table-bro/react-mui`,
`@table-bro/solid-suid`, `@table-bro/svelte-m3`, `@table-bro/bootstrap` and `@table-bro/native`. A skin of your design
system, or of the component library of your framework, is built the same way: see [Create your own
skin](https://github.com/table-bro/table-bro#create-your-own-skin) in the README of the repository and [Your own
skin](https://table-bro.com/docs/design/your-own-skin) in the Docs.

## Build

```sh
npm run build -w @table-bro/vue-vuetify
```

The root of the repository builds the package after the core: `npm run build`.

## License

MIT

Vuetify is a trademark of its owner. Table, Bro is not affiliated with Vuetify or endorsed by it: this package uses the
public components and the themes of Vuetify, which the application installs.

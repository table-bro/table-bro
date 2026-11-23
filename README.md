# Table, Bro

Pixel-perfect Material data tables for any framework and plain JavaScript.\
A Web Components table engine on top of existing UI components: Angular Material, React MUI, Solid SUID, Svelte M3, Vue Vuetify, Bootstrap, or a skin of your own.

Table, Bro is the Custom Element `<table-bro>`, a data table built for the look of a design system and the speed of a
native page. Rows have a fixed height, pages turn with a kinetic scroll, row details open as animated islands with
Material 3 corners, and search, sort and filters run on the client or go to your server as one query. The core has no
runtime dependencies and works with any framework or none; Angular gets its own wrapper. The look and the controls of
the table come from a skin: a thin layer that puts the components of a UI library into the toolbar, the paginator, the
cells and the filter drawer. The skins Angular Material, MUI, SUID, M3 Svelte, Vuetify, Bootstrap 5 and plain HTML ship
with the table, and a skin for your own design system is written the same way, so the table uses your components and
follows the theme of your application instead of bringing its own.

[Demo](https://table-bro.com) · [Docs](https://table-bro.com/docs) · [Examples](https://table-bro.com/examples) ·
[Architecture](ARCHITECTURE.md) · [Interactive diagram](https://table-bro.com/architecture) ·
[API reference](docs/api/README.md) · [Changelog](CHANGELOG.md)

## Features

### Basics

- **Fixed row height.** Every body row of the table has one fixed height: a design decision that the whole table is
  built on. The geometry of the body is arithmetic, so the page scroll, the opening of the details and the motion of the
  rows compute every position without measuring a row, and in Chromium the page scroll keeps 60 frames per second at
  any number of rows. A text longer than its cell truncates with a tooltip, larger content opens in the row details, and
  the CSS variable `--bro-row-height` sets the height itself.
- **Stable column widths.** Set a width per column, or let the table measure the content once and keep that width: the
  columns never shift while the pages scroll, whatever the next page holds.
- **Truncated text with hover tooltips.** Cell content stays on one line; what does not fit becomes an ellipsis with the
  full value on hover, tags included.
- **Animated pagination and page size.** A page turn is a kinetic scroll, a page size change grows or shrinks the table
  in place.
- **Animated table states.** Every state of the table is designed with its own motion: loading, empty, error and data
  change into each other without a jump of the layout.

### Design

- **CSS styling of a real `<table>`.** The table is a plain `<table>` in the light DOM: your stylesheet, your selectors,
  your design tokens apply as they are.
- **Custom content through Custom Elements.** A cell renders any Custom Element: buttons, toggles, tags, icons, your own
  components, with the data of the row as attributes.
- **Shadows and rounded corners.** Material 3 elevation and corner radius on every piece of the table, the open details
  included, with the corners animated as the details open.
- **Dark and light mode.** The table follows the color scheme of the page, with a theme attribute for a page of the
  other scheme.
- **Any design system through a skin.** The Angular Material skin follows the theme of the application through Material
  system tokens; the Bootstrap skin uses the variables of Bootstrap 5; the Native skin is plain HTML. They are the base
  and the reference: a skin for your own component library gives the table your buttons, fields, toggles and tags.

### Details

- **Island Details as expansion panels.** A row opens into an island: a panel with Material 3 corners, a shared clip box
  with its row and a liquid merge with the header and the paginator. Available as the paid module
  `@table-bro-extended/island-details`.
- **Default details as a regular row below.** Free row details render as one more row under the row, with the same
  animation.
- **Server-side details.** Both kinds load their content from a server on open, with a loading state in the panel.
- **Details height computed on render.** The height of the details is measured at render time, so a panel of any content
  opens to exactly its size.

### Filtering and sorting

- **Toolbar with search.** A toolbar in the style of the skin, with a title, a search field and the buttons of the
  table.
- **Custom user filters and sorting rules.** Filters and sort rules are functions of your own; the table applies them on
  the client or passes them to the server in its query.
- **Filter Drawer.** A side drawer with the filters of the table, in the controls of the skin: Material form fields,
  Bootstrap inputs or native ones.
- **Server mode.** Pages, search, sort, filters and details go to your server as one query object; the emulated server
  of the Docs shows the contract.

### AI

- **MCP server for AI coding agents.** `@table-bro/mcp` gives Claude Code, Codex, Cursor or VS Code the reference of the
  table, a check of a table spec and a code generator for Angular, Vanilla JS and the pages of React, Preact, Solid,
  Svelte and Vue, in every skin of the table. The agent writes the files; the server only reads. With it an agent builds
  a full table up to 2× faster and with ~45% fewer tokens, measured with Claude Opus, Sonnet and Haiku. [Getting
  started](#getting-started) gives its setup.

## On the roadmap

Responsive layout for mobile, multi-row selection and inline cell editing.

## Frameworks

- **One Custom Element for every framework.** Every framework that renders HTML elements renders `<table-bro>`, without
  a wrapper package: a page gives the table its columns, rows and config by `configure({cols, rows, conf})`, listens to
  its `bro-action` events and sets its `theme` attribute.
  [Custom Elements Everywhere](https://custom-elements-everywhere.com/) tests how each framework passes data and events
  to Custom Elements.
- **Angular.** `@table-bro/angular` gives the component `<table-bro-ng>` with the signal inputs `cols`, `rows` and
  `conf` and the outputs `action` and `query`, in the three skins.
- **Preact, React, Solid, Svelte and Vue.** Each framework has a Vite project in
  [`samples/frameworks`](samples/frameworks) with its working page on the site and StackBlitz in the Bootstrap skin,
  and its page of the Docs:
  [Preact](https://table-bro.com/docs/frameworks/preact), [React](https://table-bro.com/docs/frameworks/react),
  [Solid](https://table-bro.com/docs/frameworks/solid), [Svelte](https://table-bro.com/docs/frameworks/svelte),
  [Vue](https://table-bro.com/docs/frameworks/vue).
- **Polymer and Lit.** They build Custom Elements themselves, so their templates render `<table-bro>` as any HTML
  element.

## Server-side rendering

- **Prerendered loading state.** On the server the table renders its toolbar, header, loading row and paginator, so
  the page shows its layout before any script runs; in the browser the table takes its place, and the loading
  animation goes on.
- **Angular SSR.** `<table-bro-ng>` prerenders during Angular server-side rendering in the skins `mat`, `bs` and `nv`,
  with the template of the browser.
- **Any other server.** `prerenderTableBro()` of `@table-bro/core` renders the same loading state into a server DOM,
  such as linkedom. A skin on the components of a framework renders its elements there with its server entry,
  `@table-bro/<package>/server`; the vanilla skins need none, as their packages define their elements in the server DOM.

| Framework | Server render | Skin, package | Server entry | Sample | Docs |
| --- | --- | --- | --- | --- | --- |
| Angular | Angular SSR | Angular Material, `@table-bro/angular-material` | None: `<table-bro-ng>` of `@table-bro/angular` prerenders the table, and `provideTableBroMatSkin()` gives it the components of the skin | [`samples/angular-ssr`](samples/angular-ssr) | [Angular SSR](https://table-bro.com/docs/ssr/angular) |
| React | Next.js | React MUI, `@table-bro/react-mui` | `@table-bro/react-mui/server` | [`samples/react-mui/next`](samples/react-mui/next) | [Next.js](https://table-bro.com/docs/ssr/nextjs) |
| Preact | Astro | React MUI, `@table-bro/react-mui` | `@table-bro/react-mui/server`, through `preact/compat` | [`samples/preact-astro`](samples/preact-astro) | [Preact (Astro)](https://table-bro.com/docs/ssr/preact) |
| Solid | SolidStart | Solid SUID, `@table-bro/solid-suid` | `@table-bro/solid-suid/server` | [`samples/solid-suid/start`](samples/solid-suid/start) | [SolidStart](https://table-bro.com/docs/ssr/solidstart) |
| Svelte | SvelteKit | Svelte M3, `@table-bro/svelte-m3` | `@table-bro/svelte-m3/server` | [`samples/svelte-m3/sveltekit`](samples/svelte-m3/sveltekit) | [SvelteKit](https://table-bro.com/docs/ssr/sveltekit) |
| Vue | Nuxt | Vue Vuetify, `@table-bro/vue-vuetify` | `@table-bro/vue-vuetify/server` | [`samples/vue-vuetify/nuxt`](samples/vue-vuetify/nuxt) | [Nuxt](https://table-bro.com/docs/ssr/nuxt) |
| Vanilla JS | `prerenderTableBro()` on any server with a DOM | Vanilla Bootstrap, `@table-bro/bootstrap`; Vanilla HTML, `@table-bro/native` | None: the package of the skin | None: the page of Docs gives the code | [Prerender function](https://table-bro.com/docs/ssr/prerendering) |

[Server-side rendering](https://table-bro.com/docs/ssr) of the Docs describes the prerender and its limits.

## Accessibility & localization

- **Screen readers.** The toolbar links of the Bootstrap and Native skins say what they do, the ones that act on the
  table are buttons, and a live region tells the state of the table and the loading of row details.
- **Keyboard and focus.** Focus rings show in full, the hidden items of a cell are out of the tab order, and the focus
  goes back to the Filters button when the filter drawer closes.
- **Texts in the language of the application.** `config.texts` sets the words of the toolbar, the search line, the
  filter drawer, the paginator, the progress bar, the states and the row numbers, by the component of the skin; the
  texts it does not set stay English. The paginator of the Angular Material skin takes its texts from
  `MatPaginatorIntl`.

## Packages

A page takes the core and one skin; an Angular application also takes the wrapper. All packages share one version.
The Angular packages support Angular `>=20 <23`.

### Core and MCP server

| Package | What it gives |
| --- | --- |
| [`@table-bro/core`](packages/core) | The table, `<table-bro>`, its CSS and the filter drawer container |
| [`@table-bro/mcp`](packages/mcp) | The MCP server: the reference, the spec check and the code generator of a table for AI coding agents |

### Skins

| Package | Design | What it gives |
| --- | --- | --- |
| [`@table-bro/angular-material`](packages/skins/angular-material) | Material | The skin `mat` on the components of Angular Material, in the theme of the application |
| [`@table-bro/react-mui`](packages/skins/react-mui) | Material | The skin `mui` on the components of MUI for React and Preact, in the theme of the application |
| [`@table-bro/solid-suid`](packages/skins/solid-suid) | Material | The skin `suid` on the components of SUID, the port of MUI to Solid, in the theme of the application |
| [`@table-bro/svelte-m3`](packages/skins/svelte-m3) | Material | The skin `m3-svelte` on the components of M3 Svelte for Svelte, in the Material 3 theme of the application |
| [`@table-bro/vue-vuetify`](packages/skins/vue-vuetify) | Material | The skin `vuetify` on the components of Vuetify for Vue, in the themes of the application |
| [`@table-bro/bootstrap`](packages/skins/bootstrap) | Bootstrap | The skin `bs` on the components and the classes of Bootstrap 5 |
| [`@table-bro/native`](packages/skins/native) | HTML | The skin `nv`: plain HTML elements, no UI library |

### Framework wrappers

| Package | What it gives |
| --- | --- |
| [`@table-bro/angular`](packages/angular) | `<table-bro-ng>`, the Angular wrapper with signal inputs and outputs |

### Settings of the table

The table is set up through the core, the same way for every skin: the config, the columns, the server mode, the
themes, the styling, the CSS variables `--bro-*` and loading without a bundler. The README of
[`@table-bro/core`](packages/core) describes them.

## Skins

Table, Bro is a table engine, and a skin gives it the look and the controls of a UI library. The skins that ship today:
Angular Material for Angular apps, MUI for React and Preact, SUID for Solid, M3 Svelte for Svelte, Vuetify for Vue,
Bootstrap 5 for any framework, and Native, plain HTML elements, the reference skin to start your own from. The goal is
any framework with any UI components: a skin of your design system, or of the component library of your framework, is
built the same way.

### Create your own skin

A skin is a config that `registerSkin(name, config)` of `@table-bro/core` registers once, before the tables, and
`conf.skin` of a table names. The config, `BroSkinConfig`, holds the classes of the parts of the table in `css`; the
Custom Elements of its controls in `components`, each by its `selector`: the toolbar, the sort header, the paginator,
the progress bar, the buttons and the dropdowns; and the attribute of the color mode of your UI library in
`themeAttribute`, as `data-bs-theme` of Bootstrap, which the table sets on its host to `'light'` or `'dark'`. The table
also puts the name of the skin on its host as a class, so the CSS of your skin applies under that class.

Native is the skin to start from: its config `nativeSkinConfig` of `@table-bro/native` and its sources in
[`packages/skins/native`](packages/skins/native) show the parts of a skin. Give the parts the classes of your design
system, or replace the elements with Custom Elements of your UI components, as the skin Angular Material does with the
components of Angular Material, then register the config under a name of its own:
`registerSkin('brand', brandSkinConfig)` and `conf: {skin: 'brand'}`. To change a part of a shipped skin for one table,
`config.components` and `config.css` of the table are enough: they change any value or function of the config of the
skin.

An AI coding agent builds a skin of the components of your library with the skill
[`create-skin`](.agents/skills/create-skin/SKILL.md) of the repository: the package, the elements and their contract
with the table, the theme, the styles, a sample and the checks. The skin `mui` on MUI is its reference.

## Getting started

### With the MCP server

The quickest start is the MCP server of Table, Bro: add it to your AI coding agent and describe the table you need. The
agent installs the packages, generates the table, its setup and its cells, and checks the result. For Claude Code, in
the root of the project:

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.2.2
```

The README of [`@table-bro/mcp`](packages/mcp) gives the setup for Codex, Cursor, VS Code and Claude Desktop, and the
site describes the server on [MCP server](https://table-bro.com/docs/ai/mcp-server).

### Manual setup

The site gives these steps on the pages of its frameworks: [Angular data table](https://table-bro.com/docs/frameworks/angular)
for Angular Material and [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla) for Vanilla Bootstrap.

#### Angular Material

```sh
npm install @table-bro/core @table-bro/angular @table-bro/angular-material @angular/elements
```

Add `node_modules/@table-bro/core/dist/table-bro.min.css` and
`node_modules/@table-bro/angular-material/dist/table-bro.material.min.css` to `"styles"` of `angular.json`, and
`provideTableBroMatSkin()` to the providers of `app.config.ts`. Then:

```ts
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                     from '@table-bro/angular';
import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: `<table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ]);

  rows = signal<Order[]>([
    {description: 'Modern Cotton Chair', price: 100},
    {description: 'Awesome Concrete Ball', price: 200}
  ]);

  conf = signal<BroConfig>({skin: 'mat', toolbarTitle: 'Orders'});
}
```

The [working page](https://table-bro.com/samples/angular-material/) of
[`samples/angular-material`](samples/angular-material) shows this table. The README of
[`@table-bro/angular-material`](packages/skins/angular-material) gives the whole setup, with the theme and the icon font.

#### Vanilla Bootstrap

```sh
npm install @table-bro/core @table-bro/bootstrap bootstrap @types/bootstrap
```

Link the CSS of Bootstrap 5, then the CSS of the core and of the skin:

```html
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/@table-bro/core/dist/table-bro.min.css">
<link rel="stylesheet" href="node_modules/@table-bro/bootstrap/dist/table-bro.bootstrap.min.css">
```

Register the skin once, before the tables: the import registers the skin, which takes the classes of Bootstrap:

```ts
import {useBootstrap}      from '@table-bro/bootstrap';
import {Dropdown, Tooltip} from 'bootstrap';

useBootstrap({Dropdown, Tooltip});
```

Then the table:

```ts
const table = document.createElement('table-bro');

table.configure({
  cols: [
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ],
  rows: [
    {description: 'Modern Cotton Chair', price: 100},
    {description: 'Awesome Concrete Ball', price: 200}
  ],
  conf: {skin: 'bs', toolbarTitle: 'Orders'}
});

document.body.append(table);
```

The [working page](https://table-bro.com/samples/bootstrap/) of [`samples/bootstrap`](samples/bootstrap) shows this
table. The README of [`@table-bro/bootstrap`](packages/skins/bootstrap) gives the elements of the cells, the settings
and loading without a bundler.

#### Vanilla HTML

```sh
npm install @table-bro/core @table-bro/native
```

```html
<link rel="stylesheet" href="node_modules/@table-bro/core/dist/table-bro.min.css">
<link rel="stylesheet" href="node_modules/@table-bro/native/dist/table-bro.native.min.css">
```

```ts
import '@table-bro/core';
import '@table-bro/native';

const table = document.createElement('table-bro');

table.configure({
  cols: [
    {title: 'Description', name: 'description'},
    {title: 'Price', name: 'price', dataType: 'number', className: 'bro-col_text-right'}
  ],
  rows: [
    {description: 'Modern Cotton Chair', price: 100},
    {description: 'Awesome Concrete Ball', price: 200}
  ],
  conf: {skin: 'nv', toolbarTitle: 'Orders'}
});

document.body.append(table);
```

The [working page](https://table-bro.com/samples/native/) of [`samples/native`](samples/native) shows this table.

## Development

Node.js 22.12 or newer.

```sh
npm ci                                  # also sets the git hook of the lint
npx playwright install chromium         # the browser of the unit tests
npm run build                           # every package: dist/ of each package, dist/ of the Angular packages
npm test                                # the architecture rules, the public API reports and the unit tests
```

[CONTRIBUTING.md](CONTRIBUTING.md) describes the repository, the checks and the commits.
[SECURITY.md](SECURITY.md) tells how to report a vulnerability.

## License

[MIT](LICENSE). The notices of the code of Angular Material and Bootstrap are in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

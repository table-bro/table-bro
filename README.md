# Table, Bro

Pixel-perfect Material data tables for Angular, and more.\
A Web Components table engine on top of existing UI components.

Table, Bro is the Custom Element `<table-bro>`, a data table built for the look of a design system and the speed of a
native page. Rows of a fixed height render without measurement, pages turn with a kinetic scroll, row details open as
animated islands with Material 3 corners, and search, sort and filters run on the client or go to your server as one
query. The core has no runtime dependencies and works with any framework or none; Angular gets its own wrapper. The look
and the controls of the table come from a skin: a thin layer that puts the components of a UI library into the toolbar,
the paginator, the cells and the filter drawer. Three skins ship with the table, Angular Material, Bootstrap 5 and plain
HTML, and a skin for your own design system is written the same way, so the table uses your components and follows the
theme of your application instead of bringing its own.

[Demo](https://table-bro.com) · [Docs](https://table-bro.com/docs) · [Examples](https://table-bro.com/examples) ·
[Architecture](ARCHITECTURE.md) · [Interactive diagram](https://table-bro.com/architecture) ·
[API reference](docs/api/README.md) · [Changelog](CHANGELOG.md)

## Basics

- **Fixed row height.** Every body row has one height, so the table never measures rows and never reflows on data: a
  page of 1000 rows renders as fast as a page of 10.
- **Stable column widths.** Set a width per column, or let the table measure the content once and keep that width: the
  columns never shift while the pages scroll, whatever the next page holds.
- **Truncated text with hover tooltips.** Cell content stays on one line; what does not fit becomes an ellipsis with the
  full value on hover, tags included.
- **Animated pagination and page size.** A page turn is a kinetic scroll, a page size change grows or shrinks the table
  in place.
- **Animated table states.** Every state of the table is designed with its own motion: loading, empty, error and data
  change into each other without a jump of the layout.

## Design

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

## Details

- **Island Details as expansion panels.** A row opens into an island: a panel with Material 3 corners, a shared clip box
  with its row and a liquid merge with the header and the paginator. Available as the paid module
  `@table-bro-extended/island-details`.
- **Default details as a regular row below.** Free row details render as one more row under the row, with the same
  animation.
- **Server-side details.** Both kinds load their content from a server on open, with a loading state in the panel.
- **Details height computed on render.** The height of the details is measured at render time, so a panel of any content
  opens to exactly its size.

## Filtering and sorting

- **Toolbar with search.** A toolbar in the style of the skin, with a title, a search field and the buttons of the
  table.
- **Custom user filters and sorting rules.** Filters and sort rules are functions of your own; the table applies them on
  the client or passes them to the server in its query.
- **Filter Drawer.** A side drawer with the filters of the table, in the controls of the skin: Material form fields,
  Bootstrap inputs or native ones.
- **Server mode.** Pages, search, sort, filters and details go to your server as one query object; the emulated server
  of the Docs shows the contract.

## AI

- **MCP server for AI coding agents.** `@table-bro/mcp` gives Claude Code, Codex, Cursor or VS Code the reference of the
  table, a check of a table spec and a code generator for Angular and Vanilla JS with the three skins. The agent writes
  the files; the server only reads. With it an agent builds a full table up to 2× faster and with ~45% fewer tokens,
  measured with Claude Opus, Sonnet and Haiku.

  ```sh
  claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.1.0
  ```

## On the roadmap

Responsive layout for mobile, multi-row selection and inline cell editing.

## Packages

| Package | What it gives |
| --- | --- |
| [`@table-bro/core`](packages/core) | The table, `<table-bro>`, its CSS and the filter drawer container |
| [`@table-bro/angular-material`](packages/skins/angular-material) | The skin `mat` on the components of Angular Material, in the theme of the application |
| [`@table-bro/bootstrap`](packages/skins/bootstrap) | The skin `bs` on the components and the classes of Bootstrap 5 |
| [`@table-bro/native`](packages/skins/native) | The skin `nv`: plain HTML elements, no UI library |
| [`@table-bro/angular`](packages/angular) | `<table-bro-ng>`, the Angular wrapper with signal inputs and outputs |
| [`@table-bro/mcp`](packages/mcp) | The MCP server: the reference, the spec check and the code generator of a table for AI coding agents |

All packages share one version. Angular packages support Angular `>=20 <23`.

## Getting started

The site gives these steps on [Getting started](https://table-bro.com/docs/getting-started).

### Angular Material

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

### Vanilla Bootstrap

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

### Vanilla HTML

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

### Settings of the table

The table is set up through the core, the same way for every skin: the config, the columns, the server mode, the
themes, the styling, the CSS variables `--bro-*` and loading without a bundler. The README of
[`@table-bro/core`](packages/core) describes them.

### With an AI coding agent

`npx -y @table-bro/mcp@1.1.0` starts the MCP server: the agent gets the docs, checks a table spec and generates the
code of the table for your project. The README of [`@table-bro/mcp`](packages/mcp) gives the setup for each agent, and
the site describes the server on [MCP server](https://table-bro.com/docs/ai/mcp-server).

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

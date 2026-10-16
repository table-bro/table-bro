# Table, Bro

Pixel-perfect Material data tables for Angular, and more.\
A Web Components table engine on top of existing UI components.

The table is the Custom Element `<table-bro>`: pages, sort, search, row details, a filter drawer, a server mode, light
and dark themes, a kinetic page scroll and animated row details. A skin gives it the look and the controls of a UI
library: Angular Material, Bootstrap 5, or plain HTML. The core has no runtime dependencies and works with any framework or none;
Angular gets its own wrapper.

[Demo](https://table-bro.com) · [Docs](https://table-bro.com/docs) · [Examples](https://table-bro.com/examples) ·
[Architecture](ARCHITECTURE.md) · [Interactive diagram](https://table-bro.com/architecture) ·
[API reference](docs/api/README.md) · [Changelog](CHANGELOG.md)

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

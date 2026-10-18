# @table-bro/angular-material

The Angular Material skin of [Table, Bro](https://table-bro.com): pixel-perfect Material (M3) data tables built from the
components of Angular Material, in the theme of the application. The skin is `mat`.

The package holds the config of the skin, its elements (Angular components that the table creates as Custom Elements),
its CSS and its filter drawer container. The table itself is `<table-bro-ng>` of `@table-bro/angular`.

## With an AI coding agent

The skin `mat` is the look that the agent gives an Angular table by default: a pixel-perfect Material Design 3 (M3) data
table in the theme of the application. Tell your AI assistant to use Table, Bro, or add its MCP server to Claude Code,
Cursor or Codex: the agent installs the packages, generates the table, its setup and its cells from one request, and
checks the result.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.1.0
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs), [Material Design](https://table-bro.com/docs/design/material-design).

## Install

In a project with Angular Material (`ng add @angular/material` adds it):

```sh
npm install @table-bro/core @table-bro/angular @table-bro/angular-material @angular/elements
```

`@angular/elements` turns the components of the skin and of your cells into Custom Elements.

## Set up

Add the CSS of the core and of the skin to `"styles"` of `angular.json`:

```json
"styles": [
  "src/styles.scss",
  "node_modules/@table-bro/core/dist/table-bro.min.css",
  "node_modules/@table-bro/angular-material/dist/table-bro.material.min.css"
]
```

Register the skin and its elements in the providers of `app.config.ts`:

```ts
import type {ApplicationConfig} from '@angular/core';

import {provideTableBroMatSkin} from '@table-bro/angular-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTableBroMatSkin()
  ]
};
```

The elements that only some tables use are optional: a table carries their code only when the application adds them
with their functions. `withTags()` adds the tags, `withSwitch()` the switch, `withToolbarMenu()` the menu of the toolbar,
a button of `components.toolbarMain.buttons` with the mode `navbar-dropdown`:

```ts
provideTableBroMatSkin(withTags(), withSwitch(), withToolbarMenu())
```

In the dev mode a table that uses an optional element without its function writes the function to add in the console.

The skin shows the ligature icons of Material. Load the font in `index.html`:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

## Use

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

The README of `@table-bro/angular` describes the inputs and outputs of the table and the server mode.

## Theme

The skin has no theme of its own: it takes the Angular Material theme of the application, as the components of
Angular Material do, and the table looks as a `mat-table` of the application. Its parts read the tokens of `mat-table`,
`--mat-table-*`, and else the system tokens, `--mat-sys-*`, which `mat.theme()` of the application gives. A table in the
dark theme sets `color-scheme: dark` on itself: a theme with both color schemes turns dark there.

The skin does not theme the components of Angular Material outside the table. An override of the application, as
`mat.table-overrides()`, reaches the table when it is scoped to `table-bro`.

## The filter drawer

`<table-bro-filter-drawer-container-ng>` is `<table-bro-ng>` in the content of a `mat-drawer-container`, with the
filters of the application, the content of the component, in the drawer. It takes the inputs and gives the outputs of
`<table-bro-ng>`; `[(opened)]` binds the drawer, and `mode` is the mode of `mat-drawer`. The Filters button of the
toolbar of the table opens the drawer, any other button of the page calls its `toggle()`. The toolbar has only its
search by default, so the config adds the button:

```ts
import {TableBroFilterDrawerContainerNg} from '@table-bro/angular-material';
import {type BroConfig, events}          from '@table-bro/core';

const conf: BroConfig = {
  skin: 'mat',
  components: {
    toolbarMain: {
      buttons: [{buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list', buttonTooltip: 'Filters'}]
    }
  }
};
```

```html
<table-bro-filter-drawer-container-ng [cols]="cols()" [rows]="rows()" [conf]="conf()" [filter]="filter()">
  <app-order-filters (changeFilter)="filter.set($event)"></app-order-filters>
</table-bro-filter-drawer-container-ng>
```

## Elements for cells

The elements of the cells are optional: `withTags()` adds `bro-mat-tags`, `withSwitch()` adds `bro-mat-slide-toggle`.

| Element | Value |
| --- | --- |
| `bro-mat-tags` | An array of strings in `row[col.name]`, as the chips of Material; the chips that do not fit become an ellipsis |
| `bro-mat-slide-toggle` | A boolean in `row[col.name]`, as a slide toggle. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the toggle |

```ts
{title: 'Done', name: 'done', component: {selector: 'bro-mat-slide-toggle', attrs: {name: 'order-done'}, event: 'action'}}
```

## Settings

`matSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its values or
functions, at any depth, for that table. The sizes and timings are CSS variables of the table, as
`--bro-row-height`: see the README of `@table-bro/core`.

## Versions of Angular Material

The skin and this package are built for Angular Material 20, 21 and 22. The skin can work with another version of
Angular Material too, but that takes a build from the sources and a check of the result: the SCSS of the skin compiled
with the Sass of that version, as the theme writes the token names of the version it is compiled with, and the
templates of this package with the selectors of that version, as `matButton` and `matIconButton` exist only from
Angular Material 20.

## Build

```sh
npm run build:material
```

The root of the repository builds the package into `dist/table-bro.angular-material`, after the core and
`@table-bro/angular`.

## License

MIT

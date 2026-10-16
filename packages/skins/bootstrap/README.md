# @table-bro/bootstrap

The Bootstrap skin of [Table, Bro](https://table-bro.com): data tables built from the components and the styles of
Bootstrap 5. The skin is `bs`.

## Install

```sh
npm install @table-bro/core @table-bro/bootstrap bootstrap @types/bootstrap
```

The skin needs Bootstrap `^5.3.0`: its CSS, and its `Dropdown` and `Tooltip`. `@types/bootstrap` gives the types of
Bootstrap, which the import of `Dropdown` and `Tooltip` needs in a strict TypeScript project.

## Use

Link the CSS of Bootstrap, then the CSS of the core and of the skin, each from its package:

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
  rows: [{description: 'Modern Cotton Chair', price: 1}],
  conf: {skin: 'bs'}
});

document.body.append(table);
```

Without `useBootstrap()` the skin takes the classes from `window.bootstrap`, which the script of Bootstrap creates.
Without a bundler, load the scripts in this order: Bootstrap, the core, the skin. The UMD build puts the skin on the
`TableBroBootstrap` global.

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@table-bro/core@1.1.0/dist/table-bro.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@table-bro/bootstrap@1.1.0/dist/table-bro.bootstrap.umd.js"></script>
```

Load one vanilla skin per page: `@table-bro/bootstrap` and `@table-bro/native` share elements, and the skin loaded
second warns about it.

## Elements for cells

The elements of the cells are optional: a page carries their code only when it defines them. After the import of the
skin, `withTags()` defines `bro-bs-tags` and `withSwitch()` defines `bro-switch`:

```ts
import {withSwitch, withTags} from '@table-bro/bootstrap';

withTags();
withSwitch();
```

Or define an element itself: `customElements.define('bro-bs-tags', BroBootstrapTagsComponent)`. The UMD build carries the code of both
and has the same functions on its global, as `TableBroBootstrap.withTags()`. A table that uses an element that is not defined
names its function in the console.

| Element | Value |
| --- | --- |
| `bro-bs-tags` | An array of strings in `row[col.name]`, as badges; the badges that do not fit become an ellipsis |
| `bro-switch` | A boolean from the attribute `checked`: `attrs: {checked: (_col, row) => row.done}`. With the attribute `name` and `event: 'action'` a change sends the action `name` with the column and the row; the title of the column names the switch |

## Settings

`bootstrapSkinConfig` is the config of the skin. `config.components` and `config.css` of a table change any of its
values or functions, at any depth, for that table. The sizes and timings are CSS variables of the table: see the
README of `@table-bro/core`.

The skin has a light and a dark theme, as the README of `@table-bro/core` describes.

## License

MIT

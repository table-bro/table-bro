# @table-bro/core

Pixel-perfect Material (M3) data tables as Web Components: the core of [Table, Bro](https://table-bro.com) with its CSS,
for any framework or none.

The table is the Custom Element `<table-bro>` with pages, sort, search, row details, a filter drawer and a server mode.
A skin gives it the look and the controls of a UI library:

| Package | What it gives |
| --- | --- |
| `@table-bro/core` | The table itself and the CSS of the core |
| `@table-bro/native` | The native skin `nv`: plain HTML elements, no UI library |
| `@table-bro/bootstrap` | The Bootstrap skin `bs` |
| `@table-bro/angular-material` | The Angular Material skin `mat` |
| `@table-bro/angular` | `<table-bro-ng>`, the Angular wrapper of the table |

## With an AI coding agent

The core is what the AI coding agent puts on the page: a pixel-perfect Material (M3) data table with search, paging,
sorting, row details and dark mode, for React, Vue, Svelte, Angular and plain HTML. Tell your AI assistant to use Table,
Bro, or add its MCP server to Claude Code, Cursor or Codex: the agent installs the packages, generates the table, its
setup and its cells from one request, and checks the result.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.1.0
```

The setup for Cursor, Codex and VS Code is in the README of
[`@table-bro/mcp`](https://github.com/table-bro/table-bro/tree/main/packages/mcp) and on [MCP
server](https://table-bro.com/docs/ai/mcp-server). Docs: [Getting started](https://table-bro.com/docs/getting-started),
[Docs](https://table-bro.com/docs).

## Install

With Angular and Angular Material:

```sh
npm install @table-bro/core @table-bro/angular @table-bro/angular-material @angular/elements
```

or, with Bootstrap:

```sh
npm install @table-bro/core @table-bro/bootstrap bootstrap
```

or, with plain HTML elements:

```sh
npm install @table-bro/core @table-bro/native
```

## Getting started

Link the CSS of the core and of the skin:

```html
<link rel="stylesheet" href="node_modules/@table-bro/core/dist/table-bro.min.css">
<link rel="stylesheet" href="node_modules/@table-bro/native/dist/table-bro.native.min.css">
```

Import the core and the skin, then configure a table:

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
    {description: 'Modern Cotton Chair', price: 1},
    {description: 'Awesome Concrete Ball', price: 2}
  ],
  conf: {skin: 'nv', toolbarTitle: 'Orders'}
});

document.body.append(table);
```

The import of a skin package registers the skin. `configure()` throws when `config.skin` names no registered skin.

### Without a bundler

The UMD builds put the core on the `TableBro` global and the skins on `TableBroNative` and `TableBroBootstrap`.
Load the core first:

```html
<script src="https://cdn.jsdelivr.net/npm/@table-bro/core@1.1.0/dist/table-bro.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@table-bro/native@1.1.0/dist/table-bro.native.umd.js"></script>
```

## CSS

Each package holds its own CSS. A page links the CSS of the core and of its skin:

| File | For |
| --- | --- |
| `@table-bro/core/dist/table-bro.min.css` | Every table |
| `@table-bro/native/dist/table-bro.native.min.css` | The skin `nv` |
| `@table-bro/bootstrap/dist/table-bro.bootstrap.min.css` | The skin `bs`, after the CSS of Bootstrap |
| `@table-bro/angular-material/dist/table-bro.material.min.css` | The skin `mat` |

## The element

| Member | Meaning |
| --- | --- |
| `configure({cols, rows, conf})` | Creates the table. New columns or a new config need a new table. Without `rows` the table shows its loading state |
| `replaceRows(rows, options?)` | Replaces the rows; `[]` shows the empty state. In the server mode `options` carry `total` and `emptyState` |
| `appendRows(rows, {total})` | Adds the rows of the next page in the server mode; the local mode shows the added rows through its filters and sort |
| `setState(state)` | `'loading'` without rows, `'refreshing'` over the rows, `'fail'`, or `'idle'`, which ends a refresh |
| `theme` | `'light'`, `'dark'` or `'auto'` for this table; reflects the `theme` attribute |

All body rows have one fixed height, `--bro-row-height` of the skin. All loaded rows are in the DOM. A row may be an
object of a class: the table takes the values of its getters with the rows, as the values of its fields.

The calls of `replaceRows`, `appendRows` and `setState` before the table renders, as before it is in the document, wait
for its first render and apply in their order. A new `configure()` drops the calls that wait.

### Texts

`config.texts` changes the words of the table, as for the language or the tone of the application; the texts it does
not set stay the standard ones. A table with words of its own, for example:

```ts
const texts: BroTextsConfig = {
  // Core texts
  rowCounterTitle: '#',
  rowCounterLabel: 'Order number',

  // Skin component texts
  paginator: {
    itemsPerPageLabel: 'Rows per page:',
    getRangeLabel: (page, pageSize, length) => `Rows ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, length)} of ${length}`
  },
  state: {'no-data': 'Nothing here yet', 'not-found': 'No matches'},
  toolbarMain: {search: 'Find'},
  toolbarSearch: {field: 'Find an order'}
};
```

Since 1.2.0 the texts of the parts that the core renders are flat, named as the options of the config:
`rowCounterTitle` and `rowCounterLabel` of the column of the row numbers, `rowDetailsLoadingMessage` of the row details.
The texts of a component of the skin go in a group named as the component, in the order of the components of a skin
config, and the fields of a group have short names: `filterDrawer` (`title`, `close`), `paginator`, whose labels have
the names of `MatPaginatorIntl`, as `itemsPerPageLabel` and `getRangeLabel`, `progressBar` (`label`), `state`, with the
messages of the states by their names, `toolbarMain` and `toolbarSearch`. The text of a cell of tags without items
belongs to the tags of the skin: `withTags({texts: {empty: 'No tags'}})`, and later `setTagsTexts()` of `bs` and `nv` or
`TableBroMatTagsTexts` of `mat`.
The flat fields of 1.1.0, as `{itemsPerPage: 'Rows per page:'}`, still work and are deprecated; they are removed in 2.0. A
field in a group and a text of the core win over their flat field; a text that is undefined keeps the one below it.

The fields name the buttons of the search line and of the filter drawer, the paginator of the skins `bs` and `nv` and
the messages of the states. For screen readers `rowCounterLabel` names the column of the
row numbers, whose title is short. A live region of the table has screen readers say the
state of the table and the loading of row details from the server, `rowDetailsLoadingMessage`. The skin `mat` takes the texts of its paginator from
`MatPaginatorIntl`, as an application of Angular Material gives them. The filter drawer of the skins `bs` and `nv`
takes its title and the name of its close button from its own property `texts`.

The toolbar links of the skins `bs` and `nv` that act on the table, the search, the buttons and the menu, have the role
`button`, as Bootstrap gives it to a link that goes nowhere, and take Space; the items of the menu of `bs` and the
links of the paginator stay links, as in the markup of Bootstrap. The toolbar links say what they are with visually
hidden words after their titles, for screen readers and search engines, in `toolbarMain`: `searchRole(title)` by the title of the toolbar
(Search for Orders, Search for rows without a title), `buttonRole` (Filters button, for search engines only: a screen
reader hears the role), `menuRole` (More menu) and `menuItemRole` of the items of the menu of `bs` (Print menu item).
An empty string adds no words.

### Errors

A wrong call throws at once: `configure()` without a registered skin, `replaceRows()` without an array, a method before
`configure()`. A failure of a render shows the fail state, reaches the window as an uncaught error and comes as
`bro-error` with its code; the event bubbles, so one listener of the page hears all its tables. The messages of the
table, also its warnings with `config.debug`, start with `[table-bro]`.

### Events

| Event | `detail` |
| --- | --- |
| `bro-action` | `{action, selector, data}`: every action of the table, of its skin and of custom cells |
| `bro-error` | `{code, message}`: `render-failed` when a render of the table throws, `island-details-missing` when a table with `rowDetailsIsland` renders without the Island Details module; the table shows its fail state. The event bubbles |
| `bro-theme-change` | The new computed theme, `'light'` or `'dark'` |

The page sends actions to the table with `dispatchAction(table, action, data)`, for example the filters of a
filter drawer with `events.filtersFilterEvent`. A cleared filter goes as `undefined`, `null` or `''`; `false` and `0`
are values of a filter, and `config.filtersTransform` of the local mode gets them.

## Columns

| Field | Meaning |
| --- | --- |
| `title` | The title of the column |
| `name` | The field of the row that the column shows |
| `dataType` | `'string'`, `'number'` or `'boolean'`; the local sort compares the values of a `'number'` column as numbers, also the ones given as text |
| `sortKey` | The field the column sorts by. The local sort compares text in the language of the page, without case and with the numbers in it (`Item 2` before `Item 10`), and puts empty values last |
| `tooltip` | The tooltip of the header |
| `className` | A class of the header and body cells of the column |
| `component` | `{selector, attrs, event}`: a Custom Element for the cells; the table sets its properties `col` and `row`. `attrs` sets the attributes of the element as they are: an address from the data of a row, as `href`, needs the check of the application, as its scheme, before it goes there |
| `html` | The values are HTML, see below |

Name your own elements of the cells and of the row details `bro-cell-*`, as `bro-cell-order-status`: the library
never defines this prefix and leaves it to the application.

### HTML in cells

A column with `html: true` and the element `bro-table-html-cell` insert their values as HTML, without sanitizing.
The table does not sanitize HTML, as `v-html` of Vue and `dangerouslySetInnerHTML` of React do not: the application
sanitizes HTML from untrusted sources itself, for example with [DOMPurify](https://github.com/cure53/DOMPurify):

```ts
import DOMPurify from 'dompurify';

const rows = orders.map(order => ({...order, note: DOMPurify.sanitize(order.note)}));

table.configure({
  cols: [{title: 'Note', name: 'note', html: true}],
  rows,
  conf: {skin: 'nv'}
});
```

## Row details

`config.rowDetailsComponent` names the tag of a Custom Element of the application. The table creates it under a row
that opens and sets its property `row`. The details button of the core opens and closes them:

```ts
import {events} from '@table-bro/core';

const detailsColumn = {
  title: '',
  component: {selector: 'bro-details-button', attrs: {title: 'Details', name: events.detailsToggleEvent}, event: 'action'}
};
```

With `config.rowDetailsServer: true` the element gets the attribute `server` and reports its loading with the event
`bro-details-server-loaded`, the loaded part in `detail`, 1 at the end. A failed loading is the event
`bro-details-server-failed`: the row ends its loading closed, and its next opening loads the details again.

## The server mode

With `config.server: true` the table does not sort, filter or page its rows itself. The page loads the first page,
`config.pageSize` rows (5 by default). After that, on every gesture of the user the table sends the action
`bro-filters-server-loaded` with a `BroQuery`: `page`, `pageSize`, `filter` and `sort`. The page loads the rows and
gives them to the table with their total:

```js
const pageSize = 10;

table.configure({cols, conf: {skin: 'nv', server: true, pageSize}});

let loadedQuery = '';
let lastQuery;

async function load(query) {
  const queryKey = JSON.stringify([query.filter, query.sort]);

  lastQuery = query;

  try {
    const {rows, total} = await loadOrders(query); // your API

    if (query !== lastQuery) {
      return; // a newer query came while this one loaded
    }

    // Other filters or another sort replace the rows, the next pages of the same query add to them
    if (queryKey !== loadedQuery) {
      loadedQuery = queryKey;
      table.replaceRows(rows, {total});
    } else {
      table.appendRows(rows, {total});
    }
  } catch {
    if (query === lastQuery) {
      table.setState('fail');
    }
  }
}

table.addEventListener('bro-action', ({detail}) => {
  if (detail.action === 'bro-filters-server-loaded') {
    load(detail.data);
  }
});

load({page: 1, pageSize});
```

## Skins

`config.skin` is `'nv'`, `'bs'` or `'mat'`. Each skin package registers its skin and exports its config:
`nativeSkinConfig`, `bootstrapSkinConfig` and `matSkinConfig`. `config.components` and `config.css` of a table change
any value or function of the config of its skin, at any depth. `registerSkin(name, config)` registers a skin of
your own.

The skin `mat` and `@table-bro/angular-material` are built for Angular Material 20, 21 and 22. The skin can work with
another version of Angular Material too, but that takes a build from the sources and a check of the result: the SCSS
of the skin compiled with the Sass of that version, as its theme writes the token names of the version it is compiled
with, and the templates of `@table-bro/angular-material` with the selectors of that version, as `matButton` and
`matIconButton` exist only from Angular Material 20.

### Themes

Every skin has a light and a dark theme. By default a table follows the color scheme of the system: its theme is
`'auto'`. A page that keeps one theme gives the table `'light'` or `'dark'`, by the `theme` attribute or property of the
table or by `config.theme`; the attribute wins over the config. The table puts the class `bro-dark-theme` on
itself for the dark theme and `bro-light-theme` for the light one, and keeps its theme on a page of the other theme; a
filter drawer around the table takes the same class. The skin `bs` gives the table the color mode of Bootstrap of its
theme too, `data-bs-theme` on its host, by `themeAttribute` of the config of the skin: a skin on another UI library
names the attribute of the color mode of that library there.

The skin `mat` has no theme of its own: it takes the Angular Material theme of the application, as the components of
Angular Material do, and the table looks as a `mat-table` of the application. Its parts read the tokens of `mat-table`,
`--mat-table-*`, and else the system tokens of the theme, `--mat-sys-*`, which `mat.theme()` of the application gives
(`ng add @angular/material` writes it). The class `bro-dark-theme` sets `color-scheme: dark` on the table: a theme with
both color schemes (`theme-type: color-scheme`) turns dark there, a theme of the light scheme only stays light. The
class `bro-light-theme` sets `color-scheme: light`.

### The filter drawer

`<table-bro-filter-drawer-container skin="nv">` holds a table and the filters of the application, an element with
`slot="filters"`, in a drawer next to the table, for the skins `nv` and `bs`. Call
`defineTableBroFilterDrawerContainer()` once before using it. The skin `mat` has its own container in
`@table-bro/angular-material`.

The filters are the region of the drawer, named by its title unless the application names them. The drawer opened from
the Filters button of the table takes the focus into the filters, Escape in it closes it, and the focus goes back to the
button, which says by `aria-expanded` and `aria-controls` whether the drawer is open.

### Lottie animations of the states

By default the states show the icons of the skin: font icons in `mat`, Bootstrap Icons in `bs` and emojis in `nv`. The
package `@table-bro/core` also holds Lottie animations of the states for the skins `mat` and `bs`: `loading.json`,
`no-data.json` and `fail.json` in `dist/lottie/mat` and `dist/lottie/bs`, and their dark variants in `dark/` there. A
Lottie player shows them, for example [lottie-player](https://www.npmjs.com/package/@lottiefiles/lottie-player):

```sh
npm install @lottiefiles/lottie-player
```

The application serves the files of `node_modules/@table-bro/core/dist/lottie` with its own files. An Angular application
copies them by an entry of `assets` in `angular.json`:

```json
{"glob": "**/*", "input": "node_modules/@table-bro/core/dist/lottie", "output": "lottie"}
```

Then `config.components.state` turns the animations on. The table shows the animation of a state without its message,
and screen readers still say the message:

```ts
import '@lottiefiles/lottie-player';

const lottie = '/lottie/mat';

table.configure({
  cols,
  rows,
  conf: {
    skin: 'mat',
    components: {
      state: {
        fontIcon: false, // the skin mat shows font icons unless this is false
        lottie: true,
        lottieHTML: src => `<lottie-player autoplay mode="normal" src="${src}"></lottie-player>`,
        states: {
          loading: [`${lottie}/loading.json`, 'Loading'],
          'no-data': [`${lottie}/no-data.json`, 'No data'],
          'not-found': [`${lottie}/no-data.json`, 'No records found'],
          fail: [`${lottie}/fail.json`, 'Failed']
        },
        statesDark: {
          loading: [`${lottie}/dark/loading.json`, 'Loading'],
          'no-data': [`${lottie}/dark/no-data.json`, 'No data'],
          'not-found': [`${lottie}/dark/no-data.json`, 'No records found'],
          fail: [`${lottie}/dark/fail.json`, 'Failed']
        }
      }
    }
  }
});
```

A page without a bundler loads the player by
`<script src="https://cdn.jsdelivr.net/npm/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js"></script>` and may
take the animations from the CDN of the package: `https://cdn.jsdelivr.net/npm/@table-bro/core@1.1.0/dist/lottie/mat`.

## Styling

The application may style the table by these classes and attributes: they are part of the public API, keep their names
in every build and change only in a major version. Every other class and attribute of the table is internal and may
change in any version.

| Class or attribute | Where |
| --- | --- |
| `bro-col--<key>` | The header and body cells of a column. The key is the `name` of the column, else its `sortKey`, else its position from 1; whitespace becomes `-`, and a key that repeats gets `-2`, `-3` |
| `bro-header-row`, `bro-header-cell` | The row and the cells of the header |
| `bro-row`, `bro-cell` | The rows and the cells of the body |
| `bro-sort-header` | The sort header in a header cell |
| `data-row-number` | The number of a body row from 1, an attribute of the row |
| `bro-dark-theme` | The class of the dark theme, see Themes |
| `bro-col_text-right` | A class of the core for `className` of a column: its cells align right |

The table measures the widths of its columns in a hidden copy of its header and rows with the same classes and
attributes, so a style of one of them changes the measured widths together with the visible cells.

The shadow of the table lies under its rows, at `z-index: -1`. An ancestor of the table with a background of its own,
as an element with the class `mat-app-background` of Angular Material, needs its own stacking context, for example
`isolation: isolate`; otherwise its background covers the shadow.

### CSS variables

A skin declares its sizes and timings as CSS variables on the table, and the table reads them at render. Set a value
on the element itself, before the table renders, for example `#orders-table { --bro-row-height: 64px; }`: the CSS and
the script of the table take it together.

| Variable | Meaning |
| --- | --- |
| `--bro-row-height` | The height of a body row |
| `--bro-header-height` | The height of the header |
| `--bro-shadow-size` | The size of the shadow of the table, and the room the filter drawer leaves for it |
| `--bro-corner-radius` | The radius of the corners of the table; `0` keeps them square |
| `--bro-island-space-size` | The space between the table and the filter drawer |
| `--bro-table-min-width` | The narrowest table, as wide as its paginator in one line; the filter drawer lies over a table that would be narrower next to it |
| `--bro-filter-drawer-width` | The width of the filter drawer |
| `--bro-filter-drawer-corner-radius` | The radius of the corners of the filter drawer |
| `--bro-filter-drawer-duration` | The duration of the motion of the filter drawer and of the columns with it |
| `--bro-details-duration` | The duration of opening the row details |
| `--bro-details-easing` | The curve of the row details with `config.rowDetailsMotion: 'eased'` |
| `--bro-kinetic-time-constant` | The time constant of the kinetic scroll |
| `--bro-state-icon-duration` | The duration of the animation of the state icon |
| `--bro-state-message-duration` | The duration of the animation of the state message |
| `--bro-refresh-overlay-opacity` | How much the body fades during a refresh, in the light theme, from 0 to 1 |
| `--bro-refresh-overlay-opacity-dark` | The same in the dark theme |
| `--bro-table-body-container-z-index` | The layer of the body of the table |

The filter drawer container of the skins `nv` and `bs` reads the variables of the shadow, the corners, the space and
the drawer itself. `--bro-duration-scale`, `--bro-filter-drawer-opened` and `--bro-filter-drawer-modal` are not
settings: the skin sets the scale to 0 for `prefers-reduced-motion`, and the drawer moves the other two as it opens.

### Short class names in your own build

The production build keeps the readable class names of development, so the styles of an application work with both.
A build from the sources may shorten the internal names: fill the production selector maps with short names and
build the package with `npm run build`. The maps are `table-bro-selectors.prod.ts` and
`shared/shared-selectors.prod.ts` of the core, and their Sass pairs `_table-bro-selectors.prod.scss` and
`shared/_shared-selectors.prod.scss`; the TypeScript and the Sass map of a name must agree. Keep
`rowNumberAttribute` and `rowCounter`: the application sees them, as the `data-row-number` attribute and as the
`sortKey` of the column No that goes to the server. The other classes and attributes of Styling are not in the maps.

## Architecture

The table is a strict MVC inside one Custom Element. A gesture of the user changes many regions of the table at once:
the rows move with a kinetic page scroll, row details open while the body grows, the columns take new widths, the
header shows a progress. To keep every frame of such a change consistent, the table has one owner of its state, one
place that changes it, and views that only draw it. So the code reads from the top down, a part changes without its
neighbours, and the table has no runtime dependencies.

### The layers

| Layer | Where | What it does, and why it is a layer of its own |
| --- | --- | --- |
| The element `<table-bro>` | `table-bro.ts` | The public API and the lifecycle. At every render it makes the context and the controller and asks `BroTableRegions` to render the regions. The application sees one object, and the internal objects are made in one place |
| The context `ctx` | `types/context.ts`, `shared/context.ts` | The data of one table: its columns, config, state, models, views, the services of the instance and the signal of its connection. It is frozen and has no methods, so no view can call the controller through it, and nothing is passed down through constructors. With `config.debug` the element shows it as `table[Symbol.for('table-bro:debug')]` |
| The controller | `controller/` | Reacts to the calls of the API and to the actions. It is the only writer of the state, makes the models, and calls the views. "What happens on X" has one place: the input of X. `BroController` takes the calls and the actions, by a map of the actions, and runs each change as an update. Its parts do the rest: `BroBodyController` writes the rows of the state (the body, its states, the page scroll, the details, the paginator, the status), `BroColumnsController` measures and lays out the columns, `BroHostWidthController` follows the width of the host, `BroDetailsController` opens and loads the details |
| The state `ctx.state` | `controller/state.ts` | What the table shows: the rows, the filter, the sort, the pagination, the status. Read only for everyone but the controller. Its transitions are functions that see only the state, the columns and the config, so they have unit tests without the DOM |
| The models `ctx.model` | `model/` | The geometry: the slots of the displayed rows, the heights of the rows and their details, the measurements and the widths of the columns. Plain objects and functions without the DOM, so the geometry has unit tests without a layout |
| The views | `view/dom/`, `view/features/` | The DOM of their regions, the measurements of the layout and the animations. They form a tree: the regions, the toolbar, the table for screen readers with the header and the body, the paginator |
| The layout of the body `ctx.layout` | `view/features/body-layout/` | The gaps between the rows, the decorations of the rows and the window of the page. Alone it has no gaps and one shadow along the window. It is the one extension point of the body: an extension module, such as Island Details, connects through `useIslandDetails()` and gets the facts of the body from the layout only |
| The motion `ctx.motion` | `shared/motion.ts` | Every animation of the table, in one frame loop: named tracks, cancelling, kinetic and eased motion, `prefers-reduced-motion`, and its debugging |
| The update and its frame | `controller/`, `shared/frame.ts` | One change runs in phases: the state, the writes, the reads of the layout, the writes that depend on them, the animations, the events. The browser lays the table out once per change, and the events come when the DOM is ready. Each method of the controller names its place in the update with the JSDoc tag `@phase`: `input`, `state`, `render` or `events` |
| The services | `shared/` | The theme, the sizes and timings of the skin read from its CSS variables at render, the config of the skin under the config of the table, the registry of the skins |
| The skins | their packages | Custom Elements and a config: the look and the controls of a UI library. `registerSkin()` registers a skin |

### How the data flows

Down: the application calls the element (`configure`, `replaceRows`, `appendRows`, `setState`). The element hands the
call to the controller, which changes the state in the state phase of an update and calls the views. A view renders
its region and the views that it makes; the table sets the properties `col` and `row` of the Custom Elements of the
cells, and `row` of the row details, as the objects of the application, never serialized into attributes.

Up: an element inside the table, a cell, a control of the skin, the sort header, the paginator, the toolbar, tells
what happened with one bubbling event `bro-action`, `{action, selector, data}` (`dispatchAction`). The element hands
it to the controller, which changes the state in an update; the same event goes on to the application. A view never
calls the controller: it renders and reports. The table tells the application only through the events of its host:
`bro-action`, including the load intent of the server mode as a `BroQuery`, `bro-error` and `bro-theme-change`.

Between the views: a view talks only to the views that it makes, by its own references, and puts them into the
registry `ctx.view`, which only the controller reads. A link between two regions goes through the controller.

### The rules

`npm run check:arch` holds them in the code:

- views and models do not import the controller or the element;
- skins, adapters and framework wrappers import the core only from `@table-bro/core`;
- no global object of the table, every table has its own context;
- animations run only through `BroMotion`, and only its clock asks for animation frames;
- views and models read no views from `ctx.view`, and views assign no fields of `ctx.model`;
- models write no DOM; the controller neither writes nor measures the DOM; the element renders no regions;
- each method and function of the controller names its phase of the update with `@phase`.

### What the architecture leaves out, and why

- **No DI container, no event bus of the application, no singletons.** The dependencies show in the code: the context
  carries the services of one table, and the order of loading is not a part of the contract.
- **No `DataSource`.** The table does not load data. In the server mode it gives a `BroQuery` and takes rows with
  `replaceRows` and `appendRows`; the application owns its requests, their cancelling, stale answers, authorization and
  caching. The framework wrappers describe a service of the page for it instead.
- **No immutable store, reducer or snapshots.** The state has one owner that changes it in the phases of an update; a
  gesture allocates no copies of the state, and the context shows it as it is.
- **No virtual DOM and no framework at runtime.** Plain Custom Elements without dependencies; the framework wrappers wrap
  the element.
- **No virtualization.** All loaded rows are in the DOM and have one fixed height, so the page scroll moves them as one
  layer; this holds for thousands of rows.
- **No Shadow DOM.** The table lives in the light DOM, so the styles of the skins and of UI libraries such as Angular
  Material reach it; the classes and attributes of Styling are its public styling surface.
- **No plugin API.** The extension points are the Custom Elements of the cells, the row details, the toolbar and the
  filters, named by selectors in the config, the skins, the events, and the layout of the body for an extension module.

## Performance

All loaded rows are in the DOM, so the time of a change grows with their number. Measured in headless Chromium 153 on
an M-chip 12-core CPU, a table of a name and a price with a page of 50 rows, the nv and mat skins alike:

| Rows    | Render | Search | Search cleared | Sort   | Scroll frame, p95 | JS heap | DOM nodes   |
|---------|--------|--------|----------------|--------|-------------------|---------|-------------|
| 1 000   | 0.15 s | 0.03 s | 0.1 s          | 0.07 s | 17 ms             | 2 MB    | 18 000      |
| 10 000  | 1.4 s  | 0.15 s | 1 s            | 0.6 s  | 18 ms             | 7 MB    | 170 000     |
| 100 000 | 15 s   | 1.2 s  | 10 s           | 7 s    | 20 ms             | 50 MB   | 1.7 million |

The scroll keeps 60 frames per second at any number of rows. Up to about 10 000 rows a table answers within a second
or two; with more, let the server mode load the pages that the user opens.

A column of tags costs more. In the nv skin 1 000 rows render in 0.3 s, 10 000 in 5 s. In the mat skin the tags
are the chips of Angular Material, which weigh much more: about 45 MB for 1 000 rows, also in a production build, and
10 000 rows of chips exhausted the memory of a tab.

## Browsers

The browsers of Angular 20: Chrome and Edge 107+, Firefox 104+, Safari 16+. The CSS is built for them.

The core and the skins can be imported without a DOM, as in a server render: they define their elements only in the
browser.

## License

MIT

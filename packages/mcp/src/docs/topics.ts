import {cellCode}                                                                      from '../generate/cells.js';
import {type BroTarget, setupSteps, setupText}                                         from '../generate/setup.js';
import {builtinSpecs}                                                                  from '../spec/builtin-specs.js';
import {cssVariables, excludedCssVariables}                                            from '../spec/css-variables.js';
import {specSchema}                                                                    from '../spec/schema.js';
import {type BroSkinConfigShape, skinCallbacks, skinConfigShape, skinElementContracts} from '../spec/skin-config.js';
import type {BroSpecSkin}                                                              from '../spec/spec.js';
import {docPageMarkdown, docPages}                                                     from './pages.js';

export interface BroDocTopic {
  name: string;
  title: string;
  summary: string;
  text: () => string;
}

const pairs: [BroTarget, BroSpecSkin][] = [['angular', 'mat'], ['angular', 'bs'], ['angular', 'nv'], ['vanilla', 'bs'], ['vanilla', 'nv']];

/**
 * The topics of the reference. The texts that the package knows as data, the setup, the spec, the CSS variables,
 * the settings of the skins and the scaffolds of the cells, are made from that data, so they cannot drift from it.
 */
export const topics: BroDocTopic[] = [
  {
    name: 'basics',
    title: 'How Table, Bro works',
    summary: 'The facts a model cannot guess: the element, configure, skins, cells, the one event, the server mode',
    text: () => `
- Table, Bro is a Web Components table engine on top of existing UI components: the table is the Custom Element \`<table-bro>\`, and a skin gives it the controls and the look of a UI library. Its columns, rows and config come once, in \`configure({cols, rows, conf})\`. New columns or a new config make a new table; rows change with \`replaceRows\` and \`appendRows\`, the loading and the failure with \`setState\`.
- A skin is required: \`config.skin\` is \`mat\` (Angular Material: pixel-perfect Material data tables for Angular), \`bs\` (Bootstrap 5) or \`nv\` (native HTML, no library). The import of a vanilla skin package registers it, \`provideTableBroMatSkin()\` registers the skin mat; \`configure\` throws without a registered skin. The table needs the CSS of the core and of the skin.
- The content of a custom cell is a Custom Element: the column names its tag in \`component.selector\`. The table creates it for every row and sets the properties \`col\` and \`row\`, the objects of the application.
- The tags of the ready elements depend on the skin: the tags are \`bro-mat-tags\`, \`bro-bs-tags\` or \`bro-nv-tags\`.
- Every action comes in one event \`bro-action\` with \`detail = {action, selector, data}\`. A custom cell sends its actions through the event named in \`component.event\`, and the table gives the page \`data = {col, row}\`.
- In the server mode the table tells what to load: a \`BroQuery\` in the action \`bro-filters-server-loaded\`, the output \`query\` of the Angular wrapper.
- All body rows have one fixed height, the CSS variable \`--bro-row-height\` of the skin, not the content.
- All loaded rows are in the DOM: there is no virtualization.
- The table creates the cells also to measure the widths of the columns, for a row of the longest values: a cell has no side effects when it connects.
- The filters of the application live outside of the table, in the Filter Drawer next to it. The table itself searches the string fields of its columns; other filters go through \`config.filtersTransform\` in the local mode.`
  },
  {
    name: 'fillings',
    title: 'The fillings of generate_code',
    summary: 'The format of the fillings: the templates of the cells, the rules of the custom filters and the bodies of the functions of the skin config',
    text: () => `
\`generate_code\` writes the scaffolds, and the fillings are the parts that you write. Without them the files keep TODOs. The format:

\`\`\`json
{
  "cells": {
    "status": {
      "mat": {
        "imports": [{"name": "OrderBadge", "from": "./order-badge"}],
        "template": "<span class=\\"status\\">{{ row.status }}</span>",
        "styles": ".status { font-weight: 500; }",
        "members": "get label() { return this.row.status.toUpperCase(); }"
      },
      "bs": {"template": "..."},
      "nv": {"template": "..."}
    }
  },
  "filterRules": {"overdue": "row.total > value"},
  "callbacks": {"mat": {"components.sortHeader.afterRender": "console.log(arguments)"}}
}
\`\`\`

- \`cells\`: by the name of a cell of the spec, then by the skin. \`template\`, \`styles\` and \`members\` are the parts of the component for Angular; \`render\` is the body of \`render()\` for Vanilla JS.
- \`imports\`: only classes of your project, as \`{name, from}\`. The classes of Angular Material and the pipes of Angular come from the template itself, so leave them out. A string is only the name of such a class (\`"DatePipe"\`), not an import statement.
- \`filterRules\`: by the name of a filter with \`match: "custom"\`, the body of \`(row, value) => boolean\`.
- \`callbacks\`: by the skin, then the path of the function in the config of the skin (get_docs, topic skin-config), the body of the function.
- \`generate_code\` checks the imports before it writes: a wrong entry comes back as an error with its path.`
  },
  {
    name: 'workflow',
    title: 'The order of the tools',
    summary: 'Which tools to call for a new table, a cell, a question or a table that does not render',
    text: () => `
| Task | Calls |
| --- | --- |
| A new table | \`get_started\`, \`inspect_project\`, \`validate_spec\` and \`generate_code\` with a spec, with row details by default (topic spec; \`get_docs\` topic fillings has the format of the fillings); write the templates of the cells, write the files, build the project |
| A cell, row details or filters for an existing table | \`inspect_project\`, \`scaffold_component\`; write the files |
| A change of a table, a question about the API | \`get_docs\` with a topic |
| A table that does not render | \`inspect_project\`, then \`get_docs\` with the topic errors |

\`validate_spec\` checks a spec and tells for every problem the path, what is wrong and how it should be; \`generate_code\` runs it first. The server writes no files: the agent writes them.`
  },
  {
    name: 'spec',
    title: 'The table spec, BroTableSpec',
    summary: 'The fields of the spec that validate_spec checks and generate_code takes',
    text: () => `
The spec is the table as data, with the names of BroCol and BroConfig, without functions and without the tags of a skin.

${schemaLines(specSchema, '').join('\n')}

- \`component.cell\` names a custom cell of \`cells\`: the generator writes its component with the tag \`bro-cell-<row-type>-<cell>\`. \`component.element\` is a ready element of the skins.
- A cell of the kind \`details\` is the row details, named in \`config.rowDetailsComponent\`. Every table has row details by default: a details cell with what the row has no room for, and a column with the element \`details-button\`. A table goes without them only when the request asks for that.
- A filter compares the field of the row by its control: \`text\` a string with \`contains\` or \`startsWith\`, \`select\` the \`values\` of the field with \`eq\`, \`range\` a number with two keys \`<name>From\` and \`<name>To\`, \`checkbox\` a boolean; \`match: "custom"\` with a \`rule\` in words is a condition that a model writes.
- \`skinConfig\` holds the settings of one skin with the names of BroConfig: see the topic skin-config.
- \`cssVars\` sets the CSS variables of the table: see the topic css-variables.

Example:

\`\`\`json
${JSON.stringify(builtinSpecs[0].spec, null, 2)}
\`\`\``
  },
  {
    name: 'setup',
    title: 'The setup of a project',
    summary: 'The packages, the CSS and the registration of the skin, once for all tables of a project',
    text: () => pairs.map(([target, skin]) => `**${target === 'angular' ? 'Angular' : 'Vanilla JS'}, skin ${skin}**\n\n${setupText(setupSteps(target, skin))}`).join('\n\n')
  },
  {
    name: 'columns',
    title: 'Columns, BroCol',
    summary: 'title, name, dataType, sortKey, tooltip, component, html, className and short titles',
    text: () => `
| Field | Meaning |
| --- | --- |
| \`title\` | The title of the column; an empty string for a column of buttons |
| \`name\` | The field of the row the column shows |
| \`tooltip\` | The tooltip of the header |
| \`dataType\` | \`string\`, \`number\` or \`boolean\`: a number column has the arrow of the sort before its title |
| \`sortKey\` | The field the column sorts by |
| \`component\` | \`{selector, attrs, event}\`: the tag of a Custom Element for the cells; \`attrs\` sets attributes from values or functions \`(col, row) => value\`, always as strings and as they are, so an address from the data of a row, as \`href\`, needs a check of its scheme in the code of the page; \`event\` names the event of the element that the table gives the page as a \`bro-action\` action |
| \`html\` | The values are HTML: the table inserts them without sanitizing, so only trusted values |
| \`className\` | A class of the header and body cells: its rules are CSS of the application. The spec has no such field: a column of a number field is aligned right by the generator, with the class \`bro-col_text-right\` of the skin; another class goes into \`cols\` of the generated page by hand |

The columns of a page are \`BroCol<Row>[]\` of its row type: TypeScript checks \`name\` and \`sortKey\` against the fields of the row.

A date or an amount of money is a string field that holds the text as the cell shows it, as \`"Sep 1, 2026"\` or \`"$15"\`, formatted for the language of the user by \`Intl.DateTimeFormat\` and \`Intl.NumberFormat\` with its currency, never the raw \`2026-09-01\` or \`15\`: the search of the toolbar looks in the string fields of the columns, so the user finds what he sees on the screen. For the order of the sort add a number field with the time or the amount (\`createdAt\`, \`total\`) and name it in \`sortKey\` of the column; the filters (\`range\`) read that number field too.

The table measures the widths of the columns itself. A column may get narrower down to the width of its short title, by default the first word of the title; \`config.shortColumnTitle(col)\` gives other short titles. A column of a component is never narrower than its content.

Ready elements of the skins:

| Element | mat | bs | nv | Value |
| --- | --- | --- | --- | --- |
| tags | \`bro-mat-tags\` | \`bro-bs-tags\` | \`bro-nv-tags\` | an array of strings in \`row[col.name]\` |
| switch | \`bro-mat-slide-toggle\` | \`bro-switch\` | \`bro-switch\` | a boolean; \`bro-switch\` takes it from the attribute \`checked\`: \`attrs: {checked: (_col, row) => row.done}\`. With the attribute \`name\` and \`event: 'action'\` a change sends the action \`name\` with the column and the row |
| details button | \`bro-details-button\` | the same | the same | \`attrs: {title: 'Details', name: events.detailsToggleEvent}, event: 'action'\` |

The tags and the switch are optional elements of the skins, as the menu of the toolbar in the skin mat: the setup of the project gives \`withTags()\`, \`withSwitch()\` and \`withToolbarMenu()\` to \`provideTableBroMatSkin()\`, and calls \`withTags()\` and \`withSwitch()\` after the import of a vanilla skin. \`withTags({texts: {empty: 'No tags'}})\` gives the text of a cell of tags without items, No data by default (since 1.2.0); \`setTagsTexts({empty})\` of bs and nv and the signal \`empty\` of \`TableBroMatTagsTexts\` of mat change it at any time, and the tags on the page take it at once.`
  },
  {
    name: 'config',
    title: 'Config, BroConfig',
    summary: 'The fields of the config, their defaults and how the config of a skin lies under it',
    text: () => `
| Field | Meaning |
| --- | --- |
| \`skin\` | Required: \`mat\`, \`bs\` or \`nv\`, registered by the package of the skin |
| \`toolbar\` | \`false\` renders the table without its toolbar, as a table in the row details of another table |
| \`header\` | \`false\` hides the header of the table, as a table in the row details of another table with the same columns |
| \`toolbarTitle\` | The title of the toolbar |
| \`pageSize\` | The rows on a page, 5 by default |
| \`pageSizeOptions\` | The page sizes of the paginator, \`[5, 10, 15, 20, 25, 50, 100]\` by default: it offers the ones up to the number of all rows, the first one above it and the current one |
| \`searchDebounce\` | The delay of the search after the last key in ms: 100 by default, 400 in the server mode |
| \`server\` | The rows come from the server by the query of the table: see the topic server-mode |
| \`rowCounter\` | The column of the row numbers, on by default |
| \`shadowsEnabled\` | The shadows of the table, on by default |
| \`theme\` | \`auto\` by default, the theme of the system; \`light\` or \`dark\` for a page that keeps one theme |
| \`texts\` | The words of the table in the language of the application, English by default (since 1.2.0): first the texts of the core, the parts that the core renders, flat and named as the options of the config: \`rowCounterTitle\`, the title of the column of the row numbers, \`rowCounterLabel\`, its name for screen readers, and \`rowDetailsLoadingMessage\`, what screen readers hear while row details load from the server; then the texts of the components of the skin, by groups in the order of the skin config: \`filterDrawer\` with \`title\` and \`close\`; \`paginator\` with the labels of the paginator of bs and nv in the order of \`MatPaginatorIntl\`, \`itemsPerPageLabel\`, \`nextPageLabel\`, \`previousPageLabel\`, \`firstPageLabel\`, \`lastPageLabel\` and \`getRangeLabel(page, pageSize, length)\`, then \`label\`, the name of the paginator, \`navigationLabel\`, the name of its navigation, and \`firstText\`, \`previousText\`, \`nextText\` and \`lastText\`, the words of its buttons; \`progressBar\` with \`label\`, the name of the progress bar of bs and nv; \`state\` with the messages of the states by their names; \`toolbarMain\` with \`search\` and the visually hidden words after the titles of the toolbar links of bs and nv: \`searchRole(title)\` by the title of the toolbar (Search for Orders, or Search for rows), \`buttonRole\` (Filters button, for search engines only: a screen reader hears the role button), \`menuRole\` (More menu) and \`menuItemRole\` of the items of the menu of bs (Print menu item); \`toolbarSearch\` with \`field\`, \`back\` and \`clear\`; as \`{paginator: {itemsPerPageLabel: 'Rows:'}, state: {'no-data': 'No orders'}}\`. The text of a cell of tags without items belongs to the tags of the skin: \`withTags({texts: {empty}})\`. The flat fields of 1.1.0, as \`itemsPerPage\`, still work and are deprecated; they are removed in 2.0. A field in a group and a text of the core win over their flat field. The paginator of mat takes \`MatPaginatorIntl\` |
| \`rowDetailsComponent\` | The tag of the element of the row details: see the topic row-details |
| \`rowDetailsServer\` | The row details load from the server |
| \`rowDetailsMotion\` | \`'kinetic'\` by default: the row details move as the pages do; \`'eased'\` opens and closes them in \`--bro-details-duration\` |
| \`shortColumnTitle\` | \`(col) => string\`: the short title of a column |
| \`filtersTransform\` | \`(rows, filters) => rows\`: the filters of the application in the local mode, see the topic filters |
| \`components\`, \`css\` | The settings of the skin: see the topic skin-config |
| \`autoColumnWidth\` | \`false\` turns the auto widths off: the CSS of the application sizes every column by its class |
| \`styleNonce\` | The nonce of a Content Security Policy for the styles of the column widths |

The table takes a copy of the config of the skin, adds the defaults, and puts the config of the application over it: nested objects are merged, arrays and functions are replaced as a whole.`
  },
  {
    name: 'events',
    title: 'Events and actions',
    summary: 'The event bro-action, its actions, and the event bro-error',
    text: () => `
Every action comes in the event \`bro-action\` on the table, with \`detail = {action, selector, data}\` of the type \`BroActionDetail<Row>\`. The Angular wrapper gives it as the output \`action\`, and the action \`bro-filters-server-loaded\` as the output \`query\`. A check of an action of a custom cell, as \`case 'edit'\` of a \`switch\` on \`action\`, gives \`data\` as \`BroCellActionData<Row>\` (\`data?.row\`); \`BroActionDataMap\` gives the data of each action of the table. In Vanilla JS a listener takes the row type and the names of the custom actions, \`table.addEventListener<Row, 'edit' | 'delete'>('bro-action', event => ...)\` (\`never\` without them), on the table and on the \`table-bro-filter-drawer-container\` that the actions of its table bubble up to: \`data?.row\` is a \`Row\`, and a case of an action of the table narrows \`data\` to its type, as \`BroQuery<Row>\` of \`bro-filters-server-loaded\`, without a cast.

| Action | From | data |
| --- | --- | --- |
| a name of an action of a custom cell, as \`edit\` | the cell, through \`component.event\` | \`{col, row}\` |
| the \`eventType\` of a toolbar button, the \`value\` of a menu item | the toolbar | |
| \`bro-filters-toggle\` | the Filters button of the toolbar | |
| \`bro-filters-server-loaded\` | the table in the server mode | \`BroQuery\`: \`page\`, \`pageSize\`, \`filter\` with the search, \`sort\` |
| \`bro-details-toggle\` | the details button or a custom cell: the table opens or closes the row details | |

The page sends actions to the table with \`dispatchAction(table, action, data)\`: \`events.filtersFilterEvent\` (\`bro-filters-filter\`) with the filters of the page, \`events.columnsWidthEvent\` with a known new width of the table.

The table reports its errors with the DOM event \`bro-error\` on the host, \`detail = {code, message}\`: \`render-failed\` when a write of the table throws. The table shows the state fail.`
  },
  {
    name: 'server-mode',
    title: 'The server mode',
    summary: 'config.server, BroQuery and the rules of delivering the rows',
    text: () => `
With \`config.server: true\` the table does not sort, filter or page its rows itself. On every gesture it sends the action \`bro-filters-server-loaded\` with a \`BroQuery\`: \`page\`, \`pageSize\`, \`filter\` (the search and the filters of the page) and \`sort\` (\`keys\` with a direction and their \`order\`).

Delivery: in Angular the inputs \`rows\` and \`total\` for the first page of a query, or \`rowsToAppend\` and \`total\` for its next pages; in Vanilla JS \`table.replaceRows(rows, {total})\` for the first page of a query or \`table.appendRows(rows, {total})\` for its next pages. A query with other filters or another sort starts from its first page. The table takes the page and the page size of its last query.

The table does not ask for its first page: the page loads it itself, \`{page: 1, pageSize}\` with the \`pageSize\` of the config, and the table asks for the pages after it and for the first page of other filters. \`generate_code\` writes it so in both targets: \`initTable()\` of the Angular page, and \`onQueryTable\` with \`loadPage\` in the Vanilla JS module.

1. One batch per delivery: the rows with their total in one call.
2. One gesture, one query: only the action of the table starts a load.
3. The page drops stale answers: it keeps the query of each load and cancels the old ones (\`switchMap\`, \`AbortController\` or a generation number).
4. The filters of the table and the filters of the page are merged: each field has one owner, the page wins.
5. A change of a filter of the page loads page 1 and replaces the rows.
6. The rows are an array, \`[]\` an empty result; an empty result of a query with a search or filters is the state \`not-found\`, the input \`emptyState\` in Angular, \`replaceRows(rows, {total, emptyState: 'not-found'})\` in Vanilla JS, else the state \`no-data\` of an empty table shows. The state messages go into \`config.texts.state\`, the icons stay the ones of the skin. The loading and a failure are the inputs \`loading\` and \`failed\` in Angular, \`table.setState('loading')\` and \`table.setState('fail')\` in Vanilla JS.

In Angular the contracts of \`@table-bro/angular\` hold the parts apart:
- the page implements \`BroServerContainer<Row>\`: the signals \`cols\`, \`rows\`, \`conf\`, \`total\` and \`rowsToAppend\`, \`initTable()\` that starts the table and asks for page 1, and \`onQueryTable(query)\` that asks the service for a page and delivers it: the first page of a query to \`rows\`, the next pages to \`rowsToAppend\`, an answer to an older query left out;
- a service implements \`BroService<Row, ApiQuery, ApiPage>\` and sends the requests, as Angular services do: \`loadPage(query)\` requests a page of the API and gives a \`BroServerPage<Row>\`, the rows with their total; \`mapServerQuery(query)\` turns a \`BroQuery\` into the request of the API, \`mapServerResponse(response)\` turns its answer into the rows, field by field from the names of the API;
- the page holds no request and no map: they live in the service.`
  },
  {
    name: 'row-details',
    title: 'Row details',
    summary: 'The element of the row details, its button and the details that load from the server',
    text: () => `
\`config.rowDetailsComponent\` names the tag of a Custom Element. The table creates it under a row that opens and sets its property \`row\`.

- The details open by the action \`bro-details-toggle\`: the details button (\`bro-details-button\`, see the topic columns) sends it, a custom cell may send it too.
- With \`config.rowDetailsServer: true\` the element gets the attribute \`server\` and reports its loading with the event \`bro-details-server-loaded\` (\`events.detailsServerLoadedEvent\` of @table-bro/core), \`detail\` the loaded part, 1 at the end. A failed loading is the event \`bro-details-server-failed\` (\`events.detailsServerFailedEvent\`): the row ends its loading closed, and its next opening loads the details again.
- The element keeps its markup when the table moves it in the DOM: build it once.

The scaffold of a details element is the scaffold of a cell with the kind details: see the topic cells.`
  },
  {
    name: 'filters',
    title: 'Filters and the Filter Drawer',
    summary: 'The Filter Drawer of each skin, how the page gives the filters to the table, filtersTransform and the server mode',
    text: () => `
The filters of the application live outside of the table, in the Filter Drawer next to it. The Filters button of the toolbar (\`events.filtersToggleEvent\`) opens it, and \`toggle()\` of the container too. When the table would get narrower than its minimum width next to the drawer, the drawer lies over the table with a scrim, as the modal side sheet of Material 3; \`mode="over"\` on the container lays it over the table always.

| Skin | Container | The filters |
| --- | --- | --- |
| mat | \`<table-bro-filter-drawer-container-ng>\` of table-bro.angular-material: it takes the inputs and outputs of \`<table-bro-ng>\` and renders the table | its content |
| bs, nv | \`<table-bro-filter-drawer-container skin="bs">\` of the core, defined by \`defineTableBroFilterDrawerContainer()\` | an element with \`slot="filters"\` next to the table |

The title of the drawer and the name of its close button come from \`texts.filterDrawer\` (\`title\`, \`close\`) of the config of the table in every skin (since 1.2.0); the container of bs and nv reads them when it connects and when it opens, so a new \`configure()\` of the table shows at the next opening. The property \`texts\` of \`<table-bro-filter-drawer-container>\` of 1.1.0 still works and wins over the config of the table; it is deprecated and removed in 2.0.

- The page gives the filters to the table: the input \`filter\` of the wrapper, or the action \`bro-filters-filter\` in Vanilla JS. The table accumulates the changes, so a cleared field goes as \`undefined\`.
- Local mode: the table searches by itself; the other filters go through \`config.filtersTransform(rows, filters)\`. The table calls it only when some filter has a value: undefined, null and '' clear a filter, false and 0 are values. \`matchesFilterCondition(value, {eq, in, contains, startsWith, gte, lte})\` of @table-bro/core compares one value; an undefined condition matches.
- Server mode: the filters come in \`query.filter\`, and the server applies them.
- A date filter is the date range picker of Angular Material in mat (\`mat-date-range-input\` with \`provideNativeDateAdapter()\`, the dates go to the filters as \`yyyy-mm-dd\`), an \`<input type="date">\` in bs and nv.
- The type of the filters is \`BroFilters<Row, {custom filters}>\`; \`search\` and \`advancedFilters\` belong to the table.

\`generate_code\` writes the filters component \`app-<row-type>-filters\`, a component of the application as the page \`app-<row-type>-table\`, \`filtersTransform\` and the container from \`filters\` of the spec.`
  },
  {
    name: 'cells',
    title: 'Custom cells: the recipe',
    summary: 'The contract of a cell, the scaffolds for Angular and for Vanilla JS, and the rules',
    text: () => {
      const spec = builtinSpecs[0].spec;
      const cell = spec.cells![2];

      return `
The table creates the element of \`component.selector\` for every row and for the measure of the widths, sets the properties \`col\`, \`row\` and \`config\` and the class \`bro-cell_component\`, sets the attributes of \`component.attrs\`, and gives the page the event named in \`component.event\` as the action \`detail\` of \`bro-action\`, with \`data = {col, row}\`. A cell implements \`BroCellElement<Row>\` and the row details \`BroRowDetailsElement<Row>\` of the row type, with \`col?: BroCol<Row>\` and \`row?: Row\`: the code reads the fields of the row without a cast.

Rules:

1. Names: the tag \`bro-cell-<row-type>-<cell>\`, a prefix that the library leaves to the application, the class \`<RowType><Cell>Cell\` without the prefix \`Bro\` of the library, the file \`<row-type>-<cell>-cell.ts\` next to the page, without the suffix \`.component\`, as \`ng generate\` names the files since Angular 20.
2. An Angular component has no \`selector\`: it lives only as a Custom Element. The components of one cell for the three skins with the same template open it with an attribute of their skin, \`<span data-skin="bs" class="status">\`: Angular gives components of the same template one id and one set of styles. Never a static host class, \`host: {class: ...}\`: it replaces the class attribute of the element, with the class \`bro-cell_component\` that the table gives it for the width of its column.
3. Register the elements once, before the table: \`customElements.define\` with a \`customElements.get\` guard; Angular needs \`@angular/elements\`.
4. The content fits the height of the row. Two lines fit with a smaller font, or with a larger \`--bro-row-height\`: the rows of bs and nv are 40 px, so a cell of two lines with an avatar takes \`--bro-row-height: 52px\` there, and the avatar is 32 px in bs and nv, 40 px in mat.
5. The styles of a cell are styles of its component, without rules for the table or other cells.
6. No side effects on connect: a request or a subscription per cell runs for every row.
7. One output \`action\`, its value is the name of the action.
8. Vanilla JS puts values in with \`textContent\`.
9. Inputs and outputs with \`@Input()\` and \`@Output()\`, not \`input()\` and \`output()\`; a component imports the classes of Angular Material (\`MatIcon\`), not their NgModules.
10. The components of a library keep their own look: no colors, sizes, fonts or tokens (\`--mat-*\`, \`--mdc-*\`, \`--bs-*\`) of their own unless the user asks for them; the styles of a cell only place them. A custom element that needs a color, as an avatar, reads a color role of the theme: \`var(--mat-sys-*)\` for mat, \`var(--bs-*)\` for bs, the system colors (\`Canvas\`, \`CanvasText\`, \`GrayText\`, \`AccentColor\`) for nv. No literal colors.
11. Angular Material by the selectors of version 20: \`matButton="text|filled|tonal|outlined|elevated"\`, \`matIconButton\`, \`matMiniFab\`, \`matFab\`; not \`mat-button\`, \`mat-icon-button\` and the other old ones. A tooltip shows above its element: \`matTooltipPosition="above"\`. An icon of a cell or of a dialog is a Material Symbol, the current set of Material icons, Rounded and light (weight 300), with the glyphs of Material 3, as \`badge\`, \`alternate_email\`, \`business_center\`, \`travel_explore\`, \`check_circle\`: \`<mat-icon fontSet="material-symbols-rounded">edit</mat-icon>\`. An icon of a cell or of a dialog of bs is the inline SVG of Bootstrap Icons, the set of Bootstrap 5.3, first: its \`<svg>\` as the site of Bootstrap Icons gives it, of 16 by 16 px, with \`fill="currentColor"\` and \`aria-hidden="true"\`, the counterpart of the Material Symbol of mat, as \`person-vcard\`, \`at\`, \`briefcase\`, \`globe-americas\`, \`check-circle\`. Its paths are never written from memory: an icon of these docs, as the states of the table and the buttons of the skin, takes the SVG they give, and any other icon takes the file \`node_modules/bootstrap-icons/icons/<name>.svg\` of the package \`bootstrap-icons\` or the SVG of https://icons.getbootstrap.com; the page needs no font of Bootstrap Icons and no \`<i class="bi">\`.
12. The actions of a row stay in the row, not in a menu, and look as the Details button of the skin, in its color: mat, \`matIconButton\` with a \`mat-icon\` and a tooltip in the primary color, a delete too, \`:host { --mat-icon-button-icon-color: var(--mat-sys-primary); }\`; bs, buttons with the classes \`btn btn-link\` and no size, as \`btn-sm\`; nv, links as buttons in the color of links, \`<a href="" role="button" (click)="$event.preventDefault(); action.emit('edit')">Edit</a>\` with \`a { color: LinkText; }\`.
13. The row details start where the cells of the row do: the paddings of the row are on their content, \`dl { padding: 16px 24px; }\` for mat and \`padding: 12px 16px\` for bs and nv. Their host is \`:host { display: block; }\` without paddings or borders: the table opens the details by the height of the host. Values show as pairs of a label and a value in columns, a \`<dl>\` in a grid; a list of items as the chips of Angular Material, the badges of Bootstrap, or one line; no bulleted list. A label takes the secondary color role: \`var(--mat-sys-on-surface-variant)\`, \`var(--bs-secondary-color)\`, \`GrayText\`.
14. A progress bar fills the width of its cell, whatever the width of the column: \`mat-progress-bar\` and the \`.progress\` of Bootstrap do it themselves, a native \`<progress>\` or \`<meter>\` takes \`progress { width: 100%; }\`.
15. A table in the row details of another table is a part of its row: \`toolbar: false\`, \`header: false\` when its columns are the ones of the main table, \`shadowsEnabled: false\` and \`rowCounter: false\`, and \`pageSize: Math.min(5, rows.length)\`, so it keeps no empty rows under its paginator. It renders when its rows come, with its first config. Its columns line up with the columns of the main table, also when the Filter Drawer makes the table narrower: the main table keeps its auto widths (\`autoColumnWidth\` by default), which it writes for the keys of its columns and recalculates with the drawer, and the inner table has \`autoColumnWidth: false\` and the same columns, so the same keys take the same widths. The inner table keeps the column of the details button with the button hidden, \`visibility: hidden\`.
16. The dialogs of the page, as a form of a row or the confirmation of a delete, follow the skin as the cells do: \`MatDialog\` of Angular Material for mat, the \`Modal\` of Bootstrap for bs, the native \`<dialog>\` with \`showModal()\` for nv. Each looks as its library shows it, not in the fonts of the page: mat, \`mat-form-field appearance="outline"\` with an icon \`matPrefix\` and a \`mat-error\`, a gap of 16 px between the fields for the error, text buttons for Cancel and the action, as the dialogs of Material 3 have them, and the confirmation of a delete as the basic dialog of Material 3: a headline, its text and two text buttons, Delete in the color of errors; bs, the markup of the modal of the docs of Bootstrap 5.3: \`h1.modal-title\` with \`font-family: var(--bs-body-font-family)\` and \`font-size: 1.25rem\` in the styles of the dialog, as the page may give its headings and \`.fs-5\` its own font and sizes, a \`.btn-close\` in the header, a \`label.col-form-label\` above each field, and the field in an \`.input-group\` with the SVG of Bootstrap Icons that matches the Material Symbol of the mat dialog in a \`<span class="input-group-text">\`, the buttons \`btn-secondary\` for Cancel and \`btn-primary\` for the action, \`btn-danger\` for Delete; nv, the controls of the browser in \`font-family: system-ui\`. The fields of the dialogs of all skins have one layout, the one of the mat dialog: a grid of two columns with a gap of 16 px, where a long field, as a name, an email or a status, takes the whole line and two short ones share a line, \`.row.g-3\` with \`.col-12\` and \`.col-6\` in bs. The Bootstrap modal keeps the paddings of the docs of Bootstrap, 1rem, also in a project with its own spacer of Bootstrap: \`--bs-modal-padding: 1rem\` and \`--bs-modal-header-padding: 1rem 1rem\` on \`.modal\`, \`--bs-gutter-x: 1rem\` and \`--bs-gutter-y: 1rem\` on the \`.row\` of the fields in place of \`.g-3\`. The buttons of a dialog have no icons.
17. A status, a state or a yes or no value is a component, never the raw text or \`true\`: in mat a \`mat-chip\` of Angular Material with a Material Symbol of the state, \`<mat-chip><mat-icon matChipAvatar fontSet="material-symbols-rounded">check_circle</mat-icon>Active</mat-chip>\`, in the color roles of the theme by the tokens of the chip (\`--mat-chip-elevated-container-color: var(--mat-sys-primary-container)\` for a good state, \`var(--mat-sys-error-container)\` for a bad one); a badge of the skin with a dot in bs and nv, the subtle colors of bs (\`badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle\`), the system colors of nv (\`AccentColor\`, \`GrayText\`). A yes or no value shows its meaning in words, as Remote or On-site.

In an Angular project a cell is an Angular component in every skin, with the markup of the skin in its template: Angular Material for mat, the classes of Bootstrap for bs, plain HTML for nv. Its imports come from the template.

\`\`\`ts
${cellCode(spec, cell, 'angular', builtinSpecs[0].fillings.cells?.['actions']?.mat).content}\`\`\`

On a page without a framework a cell is a Custom Element in Vanilla JS:

\`\`\`ts
${cellCode(spec, cell, 'vanilla', builtinSpecs[0].fillings.cells?.['actions']?.bs).content}\`\`\``;
    }
  },
  {
    name: 'toolbar',
    title: 'The toolbar',
    summary: 'The buttons and the menu of the toolbar and their actions',
    text: () => `
\`config.components.toolbarMain.buttons\` holds the buttons and one menu of the toolbar. The toolbar of every skin has only its search; a table with filters needs the Filters button, which opens the Filter Drawer.

- A button, \`BroButton\`: \`{buttonTitle, eventType, iconHTML, buttonTooltip}\`. A click sends the action \`eventType\`. In the mat skin a button is an icon with a tooltip: \`iconHTML\` is the name of a Material icon.
- The Filters button: \`eventType: events.filtersToggleEvent\`, in the mat skin with \`iconHTML: 'filter_list'\`.
- A menu, \`BroDropdown\`: \`{buttonTitle, mode: 'navbar-dropdown', options: [{value, title, iconHTML}]}\`; an item sends its \`value\`.
- The titles of the buttons, the menu and its items say what they do, as \`More actions\` or \`Export orders\`, not \`More\` or \`Read more\`: the skin bs renders them as links, and nv its buttons, which screen readers and search engines read by their text. A link that acts on the table, the search, a button or the menu, has the role \`button\`, as Bootstrap gives it to a link that goes nowhere, and takes Space; the items of the menu of bs stay links, as in the markup of Bootstrap. The skin adds visually hidden words after the title that say what the link is: \`texts.toolbarMain.searchRole(title)\` of the search by \`toolbarTitle\` (Search for Orders, or Search for rows without a title), \`texts.toolbarMain.buttonRole\` (\`button\`, which only the text of the link keeps: a screen reader hears its role), \`texts.toolbarMain.menuRole\` of the menu (\`menu\`) and \`texts.toolbarMain.menuItemRole\` of its items (\`menu item\`); an empty string turns them off.

The search is not among these buttons: the toolbar of every table has its search button first, in every skin, and there is nothing to turn on. A click opens the field of the search. In the local mode the table searches the string fields of its columns, so a date or an amount that the cell shows as a string is found by the text the user sees (get_docs, topic columns). With \`config.server: true\` the text goes to the server as \`filter.search\` of the query. \`components.toolbarSearch.beforeRender\` of the config of the skin changes the opened field.`
  },
  {
    name: 'skin-config',
    title: 'The settings of a skin',
    summary: 'The components and the classes of a skin, its functions, and custom elements in place of its elements',
    text: () => `
The config of the application changes any value or function of the config of the skin before \`configure\`, without a new build of the skin. The exported configs are \`matSkinConfig\` (@table-bro/angular-material), \`bootstrapSkinConfig\` (@table-bro/bootstrap) and \`nativeSkinConfig\` (@table-bro/native).

\`themeAttribute\` of the config of a skin is the attribute of the color mode of its UI library, which the table sets on its host to \`light\` or \`dark\` by its theme: \`data-bs-theme\` in the skin bs; the skins mat and nv have none.

The values:

${shapeLines(skinConfigShape.css, 'css').concat(shapeLines(skinConfigShape.components, 'components')).join('\n')}

The functions:

| Path | Signature | Skins | When |
| --- | --- | --- | --- |
${skinCallbacks.map(callback => `| \`${callback.path}\` | \`${callback.signature}\` | ${callback.skins.join(', ')} | ${callback.description} |`).join('\n')}

The elements of the mat skin are Angular components with their own templates: they read no classes of the config and call no functions themselves; the functions that the core calls work in every skin, as the column Skins above says. A function replaces the function of the skin: keep what the skin does there, see its config.

A custom element in place of an element of a skin follows its contract, a type of Table, Bro: ${Object.entries(skinElementContracts).map(([name, contract]) => `${name} \`${contract}\``).join(', ')}.

A config gives only what it changes, at any depth: \`components\` of BroConfig is a \`BroDeepPartial<BroSkinComponents>\`.`
  },
  {
    name: 'css-variables',
    title: 'The CSS variables',
    summary: 'The sizes and timings of a table without a new build of the skin',
    text: () => `
A skin declares its sizes and timings as CSS variables on the table, and the table reads them at render. A value set on the table changes the CSS and the script together, without a new build of the skin. Set it on the element itself, before the table renders: a global rule by the id of the table (\`#orders-table { --bro-row-height: 64px; }\`, the input \`tableId\` of the wrapper), or \`table.style.setProperty\` before \`configure\`. The container of the Filter Drawer reads its own variables.

| Variable | Value | Element | Meaning |
| --- | --- | --- | --- |
${cssVariables.map(variable => `| \`${variable.name}\` | ${variable.kind} | ${variable.target === 'both' ? 'table and drawer container' : variable.target === 'drawer' ? 'drawer container' : 'table'} | ${variable.description} |`).join('\n')}

The table and the Filter Drawer have the rounded corners of Material 3 by default, 12 px and 16 px. For square corners set \`--bro-corner-radius\` and \`--bro-filter-drawer-corner-radius\` to \`0\`.

Not settable: ${Object.entries(excludedCssVariables).map(([name, reason]) => `\`${name}\`: ${reason}`).join('; ')}.

Other sizes, fonts and colors of a skin need changes of its SCSS and a new build.`
  },
  {
    name: 'errors',
    title: 'A table that does not render',
    summary: 'The event bro-error and the usual causes',
    text: () => `
- \`configure\` throws: \`config.skin\` is missing, or its skin is not registered (import the skin package, or two copies of @table-bro/core on the page).
- No layout, no styles: the CSS of the core or of the skin is missing.
- Empty custom cells: the tag is not defined before the table, or the tag in \`component.selector\` differs from the defined one.
- An Angular cell shows a raw \`<mat-icon>\`: the component imports an NgModule where it needs the class (\`MatIcon\`), or does not import it.
- The state fail with \`bro-error\` \`render-failed\`: a write of the table threw, the message tells where.
- The rows of the server mode do not come: the page does not answer \`bro-filters-server-loaded\`, see the topic server-mode.`
  },
  {
    name: 'angular-wrapper',
    title: 'The Angular wrapper, <table-bro-ng>',
    summary: 'The inputs and outputs of the wrapper of @table-bro/angular',
    text: () => `
| Input | Meaning |
| --- | --- |
| \`cols\`, \`conf\` | The columns and the config; a new value creates a new table |
| \`rows\` | An array replaces the rows, \`[]\` an empty state; without a value the table keeps what it shows |
| \`loading\` | \`true\`: the loading state, or a refresh over the shown rows |
| \`failed\` | \`true\`: the failure state |
| \`total\` | The total of the server, read together with \`rows\` or \`rowsToAppend\` |
| \`rowsToAppend\` | The rows of the next page for the last \`query\` |
| \`filter\` | The filters of the page, as of a Filter Drawer |
| \`emptyState\` | \`not-found\` for an empty answer to a query with filters |
| \`tableId\` | The \`id\` of \`<table-bro>\` |
| \`theme\` | \`light\`, \`dark\` or \`auto\` |

| Output | Meaning |
| --- | --- |
| \`query\` | The \`BroQuery\` of the server mode |
| \`action\` | Every other action of \`bro-action\`: \`BroActionDetail<Row>\`, with \`data?.row\` for custom cells |

The wrapper creates the table outside of the Angular zone; its outputs emit inside it.`
  },
  // The pages of Docs on table-bro.com, from the same source as the site
  ...docPages.map(page => ({name: page.path, title: page.name, summary: `The page of Docs ${page.name}, with its code`, text: () => docPageMarkdown(page)}))
];

/** The fields of a JSON Schema that its lines show. */
interface BroSchemaNode {
  type?: string;
  const?: unknown;
  enum?: unknown[];
  description?: string;
  properties?: Record<string, BroSchemaNode>;
  required?: string[];
  items?: BroSchemaNode;
}

/** The lines of a JSON Schema: the path, the type and the description of every field. */
function schemaLines(schema: BroSchemaNode, path: string): string[] {
  const lines: string[] = [];
  const properties: Record<string, BroSchemaNode> = schema['properties'] ?? schema['items']?.['properties'] ?? {};
  const required: string[] = schema['required'] ?? schema['items']?.['required'] ?? [];

  for (const [name, property] of Object.entries(properties)) {
    const fieldPath = path ? `${path}.${name}` : name;
    const type = ('const' in property) ? JSON.stringify(property['const']) : property['enum'] ? property['enum'].map((value: unknown) => JSON.stringify(value)).join(' | ') : (property['type'] === 'array' ? `${property['items']?.['type'] ?? 'object'}[]` : property['type'] ?? 'object');

    lines.push(`- \`${fieldPath}\`${required.includes(name) ? '' : '?'}: ${type}${property['description'] ? `: ${property['description']}` : ''}`);

    if ((property['type'] === 'object' && property['properties'] && path.split('.').length < 2 && name !== 'cssVars' && name !== 'skinConfig') || (property['type'] === 'array' && property['items']?.['properties'])) {
      lines.push(...schemaLines(property, property['type'] === 'array' ? `${fieldPath}[]` : fieldPath).map(line => '  ' + line));
    }
  }

  return lines;
}

function shapeLines(shape: BroSkinConfigShape, path: string): string[] {
  if (typeof shape === 'string') {
    return [`- \`${path}\`: ${shape === 'state' ? '[icon, message]' : shape}`];
  }

  return Object.entries(shape).flatMap(([name, item]) => shapeLines(item, `${path}.${name}`));
}

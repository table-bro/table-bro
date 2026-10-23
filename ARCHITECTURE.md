# Architecture

This document describes how Table, Bro is built: the parts and what each of them owns, the lifecycle of a table, the
phases of an update, the rules between the parts, how to add a feature, the words of the code, and the decisions that a
reviewer may question, with their reasons. The [Interactive diagram](https://table-bro.com/architecture) shows the same
parts and flows as diagrams. Its source is [docs/architecture.html](docs/architecture.html); serve the folder `docs`
over HTTP to open it locally, for example with `npx http-server docs`.

## The parts

The packages build on each other, from the bottom up:

| Part | Package, folder | What it owns |
| --- | --- | --- |
| The core | `@table-bro/core`, `packages/core` | The element `<table-bro>`, the state of each table, its geometry, its DOM, its motion and its public types. No runtime dependencies |
| The vanilla skins | `@table-bro/native`, `@table-bro/bootstrap`, `packages/skins/{native,bootstrap,shared}` | The look and the controls of a UI library: Custom Elements of the toolbar, the sort header, the paginator and the cells, a config, and CSS |
| The Material skin | `@table-bro/angular-material`, `packages/skins/angular-material` | The same for Angular Material: Angular components that the table creates as Custom Elements, and the filter drawer of Material |
| The wrapper | `@table-bro/angular`, `packages/angular` | `<table-bro-ng>`: signal inputs and outputs over the element, and the contracts of a page and of its service |
| The MCP server | `@table-bro/mcp`, `packages/mcp` | The reference, the spec check and the code generator of a table for AI coding agents. It reads, never writes |

A skin, the wrapper and the Material skin import the core only by its name, `@table-bro/core`, as an application does.
The core knows the skins only as configs in its registry, by `registerSkin()`.

Inside the core the table is a strict MVC in one Custom Element. A gesture of the user changes many regions at once:
the rows move with a kinetic page scroll, row details open while the body grows, the columns take new widths, the
header shows a progress. To keep every frame of such a change consistent, the table has one owner of its state, one
place that changes it, and views that only draw it:

| Layer | Where | What it owns |
| --- | --- | --- |
| The element | `table-bro.ts` | The public API and the lifecycle. At every render it makes the context and the controller and asks `BroTableRegions` to render the regions. The one place where the objects of a table are made |
| The context `ctx` | `types/context.ts`, `shared/context.ts` | The data of one table: its columns, config, state, models, views, services and the signal of its render. Frozen and without methods, so no view can reach the controller through it |
| The controller | `controller/` | The only writer of the state. It takes the calls of the API and the actions of the views, makes the models and calls the views. `BroController` maps each action to its handler; `BroBodyController` writes the rows, `BroColumnsController` measures and lays out the columns, `BroHostWidthController` follows the width of the host, `BroDetailsController` opens and loads the row details |
| The state `ctx.state` | `controller/state.ts` | What the table shows: the rows, the filter, the sort, the pagination, the status. Its transitions are functions of the state, the columns and the config, tested without the DOM |
| The models `ctx.model` | `model/` | The geometry: the slots of the displayed rows, the heights of the rows and their details, the measurements and widths of the columns. Plain objects without the DOM |
| The views | `view/dom/`, `view/features/` | The DOM of their regions, the measurements of the layout and the animations. A tree: the regions, the toolbar, the header, the body, the paginator |
| The layout of the body `ctx.layout` | `view/features/body-layout/` | The gaps between the rows, their decorations and the window of the page. The one extension point of the body: an extension module, as Island Details, connects by `useIslandDetails()` |
| The motion `ctx.motion` | `shared/motion.ts`, `shared/clock.ts` | Every animation of the table in one frame loop: named tracks, cancelling, kinetic and eased motion, `prefers-reduced-motion` |
| The services | `shared/` | The theme, the sizes and timings read from the CSS variables of the skin, the config of the skin under the config of the table, the registry of the skins |

Data flows down and actions flow up. The application calls the element; the element hands the call to the controller,
which changes the state and calls the views. A view renders its region and reports what the user did with one bubbling
event, `bro-action`, `{action, selector, data}`; the controller handles it, and the same event goes on to the
application. A view never calls the controller, and two regions talk only through it.

## The lifecycle of a table

1. **Creation.** `document.createElement('table-bro')` or markup. The import of `@table-bro/core` defined the element;
   in a browser without `customElements`, as a server render, the import defines nothing and touches no DOM.
2. **`configure({cols, rows, conf})`.** The element copies the columns and the rows, finds the skin of `conf.skin` in
   the registry, resolves the config of the table over the config of the skin, and gives the host an `id` and an
   instance attribute. A connected table renders at once; one not in the document waits for its connection. A missing
   or unknown skin throws here.
3. **The first render.** It waits for the fonts that the document is loading, because the table measures its titles
   and values in the fonts it shows them in. Then the element makes a new `AbortController`, the context and the
   controller, renders the regions, mounts the body with the rows, and listens to `bro-action` with the signal of the
   render.
4. **Calls before the render.** `replaceRows()`, `appendRows()` and `setState()` that come between `configure()` and
   the first render wait and apply after it, in their order. A call before `configure()` throws; a new `configure()`
   drops the calls that wait.
5. **Updates.** Every call and every action runs as one update, in phases (next section).
6. **Disconnection.** The element waits for a microtask: a move in the DOM disconnects and connects it in one task and
   keeps its regions. A table still out of the document then aborts its signal, which removes every listener, timer,
   observer and animation of the render, and disposes the controller.
7. **Reconnection.** A released table renders again from an empty host with its current rows.
8. **A new `configure()`** builds the table anew: new columns or a new config always mean a new table.

## The phases of an update

`BroController.update(reason, update)` runs one change of the table, so the browser lays the table out once per change
and the application hears of it only when the DOM is ready:

| Phase | Name | What runs |
| --- | --- | --- |
| 1 | `state` | Computes the new state and only then sets it. Nothing changes before the last step that may throw, so an exception leaves the table as it was |
| 2 | `render` | The writes of the regions through the views and the changes of the models. A region queues its reads, its dependent writes and its animations in the frame |
| 3 | frame: reads | Every read of the layout, after all the writes of phase 2 |
| 4 | frame: writes | The writes that depend on the reads of phase 3 |
| 5 | frame: animations | The start of the animations, after the dependent writes |
| 6 | `events` | The events to the application, in their order |

Each method and function of the controller names its place with the JSDoc tag `@phase`: `input` (an entry of the
controller, called from outside an update; it runs the updates), `state`, `render` or `events`. `shared/frame.ts`
defines the update and its frame.

## The rules

`npm run check:arch` (`scripts/check-arch.mjs`) checks these rules by searching the code, and `npm test` runs it first:

1. Views and models do not import the controller or the element.
2. Skins, the Material skin and the wrapper import the core only from `@table-bro/core`, their unit specs too.
3. Nobody reads or writes a global object of the table, and the core touches no `window` or `document` while its
   modules load.
5. Animations run only through `BroMotion`, and only its clock requests animation frames, also in the skins.
6. Views and models read no views from the registry `ctx.view`: a view talks to the views that it makes and only puts
   them into the registry, which the controller reads.
7. Views assign no fields of `ctx.model`. The slot of a row, `BroRowSlot`, is the exception by design: the views put
   the layers they render into it, and the details view writes the target height of the details.
8. Models write no DOM.
9. The controller neither writes nor measures the DOM: the views do.
10. The element renders no regions: `BroTableRegions` renders them.
11. Each method and function of the controller names its phase with `@phase`.
12. The stylesheets of the skins write the classes of the selector maps of the core through the variables of the maps:
    a build from the sources, as the one of the site, shortens the classes there.

Rule 4 and the rules below hold by review, as a search cannot check them:

- **4.** Mutable state at the level of a module that changes what a table does exists in four places only: the
  registry of the skins, the classes of Bootstrap that `useBootstrap()` gives the skin `bs`, the extension module
  that `useIslandDetails()` connects, and the texts of the optional elements of a skin, which `withTags()` and
  `setTagsTexts()` of `bs` and `nv` set, with the set of their elements in the DOM that takes a new text. Apart from them modules keep caches only: weak maps by element, class or table,
  one shared `ResizeObserver` of the items of cells, and a canvas and a range for measurements.
- Only the controller writes `ctx.state`.
- A new class takes `ctx` as its first parameter and takes no objects of the table as separate parameters.
- Listeners and timers of the views live with `ctx.signal`, so the release of a render removes them all.
- Values of the application go into the DOM by `textContent` and `setAttribute`; only a column with `html: true`
  inserts HTML.

## How to add a feature

1. **A new option.** A field in `BroConfig` or `BroSkinConfig` (`types/table-bro.ts`), its default in
   `resolveConfig()` (`shared/config.ts`).
2. **A new field of the state.** A field in `BroDataState` (`controller/state.ts`); only the controller writes it.
3. **A new region of the DOM.** A new view with the constructor `(ctx, local arguments)`. Its parent view or the
   controller makes it and puts it into `ctx.view`.
4. **A new action of the user.** A constant in `shared/events.ts`, the type of its data in `BroActionDataMap`, the
   dispatch by `dispatchAction()`, and its handler in the map `actions` of `BroController`.
5. **A new animation.** A named track of `ctx.motion`, never `requestAnimationFrame`.
6. **A new control of a skin.** A Custom Element in the package of the skin and its selector in the config of the skin.
7. **A new method of the controller.** Its `@phase` in the JSDoc: an entry in `BroController` or one of its parts, a
   transition of the state as a function in `controller/state.ts`, the writes of the rows in `BroBodyController`.
8. **The check.** `npm run check:arch`, then `npm test`.

## Glossary

- **The element** is the class `<table-bro>` and its public API; **the host** is its DOM node, which carries the
  attributes, classes and listeners.
- **A table**, or an instance, is one `<table-bro>` with its own context.
- **The context**, `ctx`, is the frozen object with the data of one table that the controller and the views get.
- **A view** is a class that builds the DOM of one region of the table. `ctx.view` is the registry of the rendered
  views, which only the controller reads.
- **A region** is a part of the DOM that one view renders: the toolbar, the header, the body, the shadows, the
  paginator, the row details, the state of the table.
- **A local argument** is a value that differs between objects of one class inside one table, as a row or a column.
- **The state**, `ctx.state`, is what the table knows about its data and its query, apart from the geometry,
  `ctx.model`, and the DOM. **The state of the table** in the API is the status it shows: `loading`, `no-data`,
  `not-found`, `fail`.
- **An action** is what a view or a control reports with `bro-action`, as a change of the page or a search; its
  **data** is `detail.data` of the event.
- **A load intent** is the action `bro-filters-server-loaded` of the server mode with its `BroQuery`: the page, the
  page size, the filter and the sort that the table needs.
- **An update** is one change of the table in its phases; **the frame** is its phases 3 to 5.
- **A slot** is the place of one displayed row in the body: its layers and their geometry.
- **Short titles** are the titles of the columns shortened by `shortColumnTitle`, for the minimum width of a column.
- **Synthetic rows** are the empty rows that fill the last page of a table up to its page size.
- **Island Details** is the mode `rowDetailsIsland`: an opened row stands apart from its neighbours by gaps above and
  below, with its own shadows and motion. It is the paid module `@table-bro-extended/island-details`.
- **The filter drawer** is the drawer next to the table that holds the filters of the application; the filters live
  outside the table.
- **The composition root** is the one place where the objects of a table are made and linked: the render of the
  element.

## Decisions a reviewer may question

These are deliberate decisions. They stay, and here are the reasons.

- **All body rows have one fixed height, without measuring rows.** The geometry of the body is arithmetic: the page
  scroll, the opening of the details and the motion of the rows compute every position without reading the layout of
  a row, so a frame of an animation does no layout reads. Content that needs more room goes into the row details.
- **No virtualization: the DOM grows with the loaded rows.** All loaded rows are in the DOM and move as one layer, so
  the kinetic page scroll keeps 60 frames per second at any number of rows. The README of `@table-bro/core` publishes
  the measured limits: up to about 10 000 rows a table answers within a second or two; more rows go to the server mode,
  which loads the pages that the user opens.
- **No `table-layout: fixed`.** The table keeps the automatic layout of HTML tables in every mode and solves the
  widths within it: it measures the columns in a hidden copy of the header and the rows and gives them their widths,
  so a column fits its content and the widths can move with an animation.
- **The element registers itself on import.** `import '@table-bro/core'` defines `<table-bro>`, as the import of a
  skin registers the skin: no setup call to forget or to order. Outside a browser the import defines nothing, so a
  server render imports the packages safely.
- **No defaults for a setup that does not work.** The table reads its sizes and timings from the CSS variables of its
  skin and does not repeat them in its script: every byte counts, and one source of the values keeps the CSS and the
  script in agreement. The consequence to know: without the CSS of the skin the durations are `NaN`, an animation never
  reaches its end, and the frame loop does not stop. Link the CSS of the core and of the skin.
- **A push model of data, no `DataSource`.** The table does not load data. In the server mode it gives a `BroQuery`
  and takes rows by `replaceRows()` and `appendRows()`: the application owns its requests, their cancelling, stale
  answers, authorization and caching, with the HTTP client it already has. The wrapper describes a service of the page
  for it instead (`BroService`).
- **The search field shows no focus line, only its caret.** The search opens with the focus in its field, so a focus
  line under it would be there all the time the search is open, also after a click. The caret shows the focus of a
  text field. Other controls keep their focus rings. An accessibility audit flags this against WCAG 2.4.7.
- **The suffix `Ng` in the names of Angular components.** `TableBroNg` and `TableBroFilterDrawerContainerNg`, with the
  selectors `table-bro-ng` and `table-bro-filter-drawer-container-ng`, are Angular components over the Custom Elements
  `<table-bro>` and `<table-bro-filter-drawer-container>` of the same names: the suffix tells an Angular component from
  the Custom Element, in imports and in templates.
- **The shared elements of the vanilla skins are in each skin.** `@table-bro/native` and `@table-bro/bootstrap` each
  bundle the elements they share, so each skin is one package without a third one. A page loads one vanilla skin; the
  skin loaded second warns that their elements are defined already.
- **The free core names the paid module in its error.** A table with `rowDetailsIsland` and without the module shows
  its fail state, and `bro-error` says which package gives the mode: `@table-bro-extended/island-details`. The
  message names what fixes the error, as any error of the table does.

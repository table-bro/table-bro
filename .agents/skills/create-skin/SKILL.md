---
name: create-skin
description: Create a new skin of Table, Bro in this repository, a package @table-bro/<library> on the components or the CSS of a UI library, with its elements, styles, sample, checks and docs. Use for a skin of a component library of a framework, as MUI, Vuetify, SUID or m3-svelte, or of a design system.
---

# Create a skin

A skin gives the table engine of `@table-bro/core` the look and the controls of a UI library. The core stays
framework-agnostic: framework code lives only in the package of the skin. Read `ARCHITECTURE.md` (the rules that
`npm run check:arch` checks) and `CONTRIBUTING.md` first.

## Choose the model

| The library gives | Model | Example |
| --- | --- | --- |
| CSS classes, no components | `packages/skins/bootstrap` (bs): plain Custom Elements with the classes of the library | Bootstrap 5 |
| Components of a framework | `packages/skins/angular-material` (mat) for the components, `packages/skins/bootstrap` for the package, its registration and its styles | MUI: `packages/skins/react-mui` |

`packages/skins/native` is the reference for the parts of a skin, not a model of the look. The skin of a framework
library is one package without a wrapper: a wrapper package of the framework only when the skin cannot work without
one, with the reason in the pull request.

## The package

`packages/skins/<library>`, the name `@table-bro/<library>`, the version of the other packages; `CHANGELOG.md` changes
only in the commit of a release. For a component library of a framework `<library>` names the framework first, then
the library: `react-mui`, `vue-vuetify`; for the CSS of a library, the library alone: `bootstrap`. The folder, the
files, the SCSS and the samples take this name. The skin itself keeps the short name of the library in `config.skin`,
its tags and its exports: `mui`, with `bro-mui-*` and `setMuiTheme()`. The skin `mui` shows the files:

| File | What it holds |
| --- | --- |
| `package.json` | ESM exports, `sideEffects` of the entry, scripts `build`, `build:js`, `build:css`, peer dependencies on the framework and the library by the range of their current major versions and on `@table-bro/core` |
| `tsdown.config.ts` | ESM with source maps and its `.d.ts`; the framework, the library and the core never bundled. No UMD: an application of a framework has a bundler |
| `tsconfig.json` | `paths` of `@table-bro/core` to its sources |
| `js/table-bro.<library>.ts` | The entry: defines the elements in the browser, registers the config, exports `with...()` of the optional elements and the setter of the theme |
| `js/table-bro.<library>.config.ts` | `BroSkinConfig` with `satisfies`: classes, components, `themeAttribute`, optional elements |
| `js/bro-<library>-element.ts` | The base of the elements: the render of the framework, moves, prerender |
| `js/bro-*.<library>.ts`, `js/toolbar/` | One element per component |
| `js/table-bro.<library>.spec.ts` | Unit specs in Chromium (Vitest takes `packages/skins/*/js/**/*.spec.ts`) |
| `styles/table-bro.<library>.scss`, `_table-bro.<library>.api.scss`, `skin/<library>/` | The CSS entry, its SCSS API, the variables, the themes and one partial per part |
| `README.md` | In the format of the README of mat: AI agent, Install, Set up, Use, Theme, Elements for cells, Settings, Build, License. The License of a skin of a library of another owner ends with the line of its trademark, as the ones of `mat`, `bs` and `mui`: the library is a trademark of its owner, Table, Bro is not affiliated with it or endorsed by it, and the package uses its public components, which the application installs |
| `table-bro.<library>.api.md` | `npm run check:api -- --update` writes it |
| `LICENSE` | MIT, as the other skins |

Write the elements without JSX when the framework allows it (`createElement` of React or `h` of Vue): the lint, the type
check and the specs of the repository need no JSX setup then.

## The elements and their contract

The core creates each element by the `selector` of `config.components`, sets its attributes and properties, appends
it, and right after that measures it. The skin `mui` implements each of them:

| Component | The core gives | The element gives back |
| --- | --- | --- |
| `button` | attributes `label` (name of an icon button), `button-class`, `button-title`, `icon` from `beforeRender`, `event-type` | event `action` with the event type; `iconSelector` finds the icon, which the details button turns |
| `sortHeader` | attributes `arrow-position`, `sort-id`, `data-type`, `header-title`, `tooltip` (changes later); property `activeSort` | `dispatchAction(this, events.filtersSortEvent, {sortKey, sortDirection})` in the order of mat: descending, ascending, none; `contentSelector` matches the element of the title, with `text-overflow: ellipsis` |
| `paginator` | with `inputsAsProperties: true` the properties `pageIndex`, `pageSize`, `length`, `pageSizeOptions`, `showFirstLastButtons`, `disabled` | event `page` with `{pageIndex, previousPageIndex, pageSize, length}`; texts of `config.texts`; the classes `bro-paginator-navigation-first`, `-previous`, `-next`, `-last` on its buttons; the element itself, as a block, carries the background and the corners: Island Details rounds the corners of this element |
| `progressBar` | attributes `mode`, `value` (changes later), `color`; property `config` | `aria-label` from `config.texts.loadingProgress` |
| `toolbar` | `appendToolbarContent(...nodes)` before and after its render; the drawer sets its `class` | the nodes of the table inside the toolbar of the library, `contentClassName` |
| `toolbarMain` | attributes `title`, `buttons` (JSON of the config); property `config` | event `bro-toolbar` with the action; the search button with the class `bro-toolbar-button-search`; the menu of a button with the mode `navbar-dropdown` |
| `textEllipsis` | attributes `value`, `container-class`; property `col` | the classes `broCellSelectors.ellipsisContainer` and `.ellipsis`, the whole value in a tooltip; markup only with `col.html` |
| `filterDrawer`, `toolbarSearch` | the close, back and clear buttons to `beforeRender` | their icons |
| optional cells (`elements` of the config) | properties `col`, `row`, `config`; attributes of `component.attrs` | tags: chips that `fitCellItems()` fits into one line, texts by `withTags({texts})` and `setTagsTexts()`; switch: event `action` with the attribute `name`, named by `col.title` |

The state icons go through `fontIcon` with `state.fontIcon: true`, as in mat.

## Rules of the render

- Render synchronously on connect and on every change of an attribute: the core measures the element in the same
  update. React renders by `flushSync`, which React puts off inside its own render and effects, so an application of
  React calls the methods of the table outside them (`queueMicrotask()` in an effect); the element reports such a
  deferred render in the console once. Preact, Solid and Svelte mount synchronously.
- Vue updates its reactive state on the next tick, which is too late for the measure: an element renders and patches
  by `render(h(Component, props), container)` of Vue, which is synchronous, with the new props every time. A library
  installed as a plugin of an app, as Vuetify, reaches such a root through the context of one app of the skin that
  installs it: `vnode.appContext = app._context` before `render()`. Prove both in the first spec of the skin.
- Render into a child container with `display: contents`, not into the element: the framework may clear its
  container, and the table and the element hold other nodes in the element.
- A move in the DOM disconnects and connects in one task: keep the tree, and drop it only when the element stays out of
  the DOM after a microtask.
- An element of a prerender (`isPrerendered(this)`) keeps its markup until the table renders its own elements in its
  place. The server render of the elements is in the section The server render below.
- Move the nodes of the table into a toolbar after the render, never inside a ref or a lifecycle hook of the
  framework: a node may be an element of the skin, whose own render would run inside the commit of another one.
- Extend `BroHTMLElement` of the core, so the module loads without a DOM, and define the elements only when
  `customElements` exists.

## The server render

`prerenderTableBro()` of the core renders a table in its loading state into a server DOM, and defines the elements of
the skin there by `defineElements(registry)` of the registered config. A skin of a framework renders them with the
server render of its framework, in a server entry of its own, `@table-bro/<library>/server`, as
`js/table-bro.react-mui.server.ts`:

- The entry gives the base element the render of a tree to markup (`setServerRender()`), registers the config again
  with `defineElements`, which defines every element, the optional ones too, and re-exports the entry of the browser.
  The bundle of the browser never imports it, so it carries no server render of the framework.
- In a server DOM, a window other than the global one, an element renders its markup into its container by that
  render, without a root of the framework; without the server entry it stays empty and names the entry in the console
  once.
- The styles of the library go into the markup: MUI renders by `renderToString` of `react-dom/server` inside a
  `CacheProvider` with a new cache of Emotion for each render, since a shared cache leaves out the styles that an earlier
  render, of another request or of the element before its inputs, has carried.
- The elements extend the `HTMLElement` of the server DOM: the page of the server gives it to the global scope before
  the import of the skin, `globalThis.HTMLElement ??= window.HTMLElement`, and imports the skin and the core after it.
- The two entries share one chunk with a fixed name (`chunkFileNames` of tsdown), which `sideEffects` of `package.json`
  names, and `packages.spec.ts` checks; the types of each entry are built on their own, so the report of `check:api`
  reads the whole API.
- The framework of the server render gets a sample, `samples/<library>/<server framework>`, as `samples/react-mui/next`
  with Next.js, and its section on the page Prerendering with the files of the sample, which `pages.spec.ts` compares
  (`nextFiles`), and an e2e spec of the sample, as `e2e/samples-react-mui.spec.ts`: the prerendered markup without
  scripts, and the table of the browser at the same height.
- The server render of Vue, `renderToString` of `@vue/server-renderer`, is asynchronous, while `prerenderTableBro()`
  renders the elements synchronously: a skin of Vue and its section of Nuxt need a decision of the owner on an
  asynchronous prerender before they start.
- The server render of Solid, `renderToString` of the server build of `solid-js/web`, is synchronous, as in
  `js/table-bro.solid-suid.server.ts`. The server bundle of the application compiles the JSX of the library for the
  server and carries the library, the skin and the core (`ssr.noExternal` of Vite); the core loads after a module of its
  own gives the `HTMLElement` of the server DOM to the global scope. The render of an element saves and restores
  `sharedConfig.context` of the render around it, turns hydration off on its own context, and gives the library ids that
  go on from render to render when it names its styles by them, as SUID does; the styles of `useAssets` go into the
  markup without their ids. A component of the library that fails in the server render gets a server form of its own,
  as the native select of SUID. The sample is `samples/solid-suid/start` with SolidStart.

## The theme

- The elements take the theme of the application: a setter, as `setMuiTheme(theme)`, gives the theme object to the
  provider of each root. That provider writes no global stylesheet, no attribute on `<html>` and no storage of the mode:
  the provider of the application does it once. Without the setter the elements name it in the console once.
- The shapes come from the theme of the library, as the corners of its chips; the skin sets only the geometry of the
  table that every skin has (`--bro-corner-radius`, the heights).
- The CSS of the parts of the table (rows, header, toolbar, paginator, drawer) reads the CSS variables of the theme of
  the library, as mat reads `--mat-sys-*`. The application turns them on; there is no fallback for a setup without
  them, and no `var()` fallbacks.
- `themeAttribute` names the attribute of the color scheme of the library, which a table with a theme of its own sets on
  its host. The core sets only an attribute, and stays so: a library that selects the scheme by a class, as
  `v-theme--light` and `v-theme--dark` of Vuetify, gets the variables of the class from the skin (the owner decided it
  on 2026-11-19). CSS cannot take the variables of another class, and Vuetify writes their values at runtime from the
  themes of the application, so the setter of the theme of the skin writes one stylesheet of its own: for each theme of
  the application the rule `table-bro[<themeAttribute>="<name>"]` with its `--v-theme-*` variables, from the themes of
  the instance of Vuetify, again when they change.
- A library without color schemes, as SUID, gets the theme of the other scheme from the main colors of the palette of the
  application, its typography and its shapes: the setter writes the variables of each scheme for the rule
  `table-bro[<themeAttribute>="<scheme>"]`, and an element gives its components the theme of the scheme of its table,
  which one observer of the attribute on the host of the table follows (`js/bro-suid-element.ts`).
- A library may give its colors as channels, as `--v-theme-primary: 98,0,238` of Vuetify: the CSS reads them as
  `rgb(var(--v-theme-primary))`, and the alpha of a state as `rgb(var(--v-theme-on-surface) / var(--v-hover-opacity))`.

## Rules of the styles

- One fixed height of all body rows, no measurement of rows; one-line cells; tags that do not fit become an ellipsis.
- No `!important`, no `table-layout: fixed`, no empty `class=""` and no spaces at the edges of a class.
- Never change `box-sizing` or `padding` of the `table-bro` host. When the texts of the toolbar and the paginator of the
  library lie in flex boxes, give the host `vertical-align: top`: the baseline of the inline block would otherwise add
  the descent of the font below the table, and the card of the filter drawer would be longer than the table.
- Sizes and timings come from the `--bro-*` variables that the table reads at render; a new size variable ends in
  `-height` or `-width`, a shared one is `$bro-*`. Take the sizes of the tables of mat unless the library defines its
  own table sizes.
- Reset the margins of the paragraphs that a component of the library centers by the default margins of the browser,
  as the labels of the pagination of MUI: the CSS of a page, as the reboot of Bootstrap, changes them.
- Motion of an edge that must stay still goes by layout, not by the compositor.
- Browsers: Baseline Widely Available.
- Name only what the library implements: no Material 3 for a library of Material Design 2.
- Comments and Markdown wrap at 120 columns; the inputs of the cell elements keep the order of mat, `col`, `row`,
  `config`.
- Class names of the library in PascalCase, as `.MuiChip-root`, need an override of `selector-class-pattern` in
  `stylelint.config.mjs` for the folder of the skin.

## The shared files

The skin changes these files with the minimal lines it needs, in the commit of the skin:

1. `package.json`: the workspace after `packages/skins/native`, the build after the vanilla skins, the type check;
   `package-lock.json` by `npm install` after the package exists.
2. `scripts/check-arch.mjs`, `scripts/check-api.mjs`, `scripts/check-pack.mjs`: the folder of the skin.
3. `stylelint.config.mjs`: only when the library names classes or variables outside kebab-case.
4. `packages/core/packages.spec.ts`: the package of the skin in the checks of the exports, the files and the side
   effects; a skin without a UMD bundle out of the check of the global names, by its name.
5. The tables of the packages: `README.md`, `packages/core/README.md`, `CONTRIBUTING.md` (the table of the
   repository), `ARCHITECTURE.md` (the parts, and rule 4 for a setter of module state, as the theme). The skins of the
   frameworks come first, the vanilla skins last: `@table-bro/core`, `@table-bro/angular-material`,
   `@table-bro/react-mui`, `@table-bro/vue-vuetify`, then `@table-bro/bootstrap`, `@table-bro/native`, then
   `@table-bro/angular` and `@table-bro/mcp`. Every list of the skins keeps this order, in the texts and in the code:
   `mat`, `mui`, the next skins of frameworks, `bs`, `nv`.
6. The texts that list the skins: the root `README.md` and the READMEs of the other skins (Your own skin). They name
   the skins without a count, so the next skin adds its name only. The README of Angular Material names only the skins
   for Angular.

The docs of the MCP server, `packages/mcp/src/docs/pages.ts`, go into a commit of their own, `Table, Bro MCP: ...`: the
skin in the texts and the table of the skins of Getting started. A skin gets no page of design of its own: a library of
Material Design, as MUI or Vuetify, gets a section of the page Material design, `#### React MUI`, `#### Vue Vuetify`,
in the order of the skins: what the skin renders, the versions it supports, how it takes the theme, its setup of the
theme as a file of the page, and the links to the pages of Frameworks of its framework. Name only what the library
implements: no M3 for a library of Material Design 2.

The pages of Frameworks of the framework of the skin, as React and Preact for `mui` and Vue for `vuetify`, show the
sample of the skin: the link of the working page `https://table-bro.com/samples/<library>/<framework>`, the link of
StackBlitz to `samples/<library>/<framework>`, and the manual setup with the files of that sample, as
`frameworks/react` shows them. `skinSamples` of `packages/mcp/src/docs/pages.spec.ts` names the sample of each such
page, and the spec compares the files of the page with it. The skins `bs` and `nv` stay the alternatives that the
intro of the page names.

The table «Texts by the part of the table» of `pages.ts` names in its column Skins every skin that shows a text, and the
docs of `BroTexts` in `packages/core/types/table-bro.ts` name the skins of a text that only some skins show, as
`loadingProgress`. Find what the skin shows: render a table of the skin with a marker in every text, as `Q<name>Q`,
open its search and its drawer, and read the markers in its DOM with their `aria-label`. The texts of the core, the
drawer, the states and the search of the toolbar are in every skin; the words of the paginator and the roles of the
toolbar of the vanilla skins are not.

The code generator and the spec check of the MCP server know the new skin in the same commit, as `mui` with the target
`vanilla`: a module that renders `<table-bro>` into a container, with its cells as Custom Elements in Vanilla JS and,
in the server mode, its service on `fetch`; a component of the framework calls it. The places:

- the type `BroSpecSkin` (`src/spec/spec.ts`), the enums of `src/server/server.ts`, `src/spec/schema.ts`, the skins of
  the callbacks (`src/spec/skin-config.ts`) and the checks of `src/spec/validate-spec.ts`;
- in `src/generate/`: the target that the skin does not support (`generate-code.ts`, `scaffold.ts`); the packages, the
  CSS and the setup steps (`setup.ts`); the buttons of the toolbar (`config.ts`); the tag of the switch (`angular.ts`);
  the form of the filters of Vanilla JS and its Clear (`filters.ts`);
- the registration in a project (`src/project/inspect-project.ts`), the pair of the setup topic (`src/docs/topics.ts`),
  the cells of the built-in specs in the look of the library (`src/spec/builtin-specs.ts`), and the pair and the path of
  the package in `scripts/check-generator.mjs`.

The setup steps are the ones of the framework: where the theme of the application goes to the setter of the skin, the
font of the icons, and where a component of the framework calls the function of the table: an effect of React with
`queueMicrotask()` for mui, `onMounted()` of Vue for a skin of Vue. `npm run test:mcp` and `npm run check:mcp` check the
generated code, in the server mode too.

## The sample

`samples/<library>/<framework>`: a Vite project per framework, as `samples/react-mui/react` and
`samples/react-mui/preact`, which `npm run build:samples` builds into `dist/samples/<library>/<framework>`. One project per build: the script gives
`--base` only to the last command of `npm run build`. A framework with a compatibility layer, as Preact for React,
gets aliases in its `vite.config.ts` and `paths` for the types in its `tsconfig.json`. Describe the folder in
`samples/README.md`.

## Checks

Once at the end, with the output trimmed:

```sh
npm run build && npm run typecheck && npm run lint && npm run lint:styles
npm test && npm run check:pack && npm run test:mcp && npm run check:mcp
npm run build:samples
```

Look at the samples in a browser, in the light and the dark scheme: the toolbar and its search with the focus in the
field, the sort, the paginator and its page sizes, the filter drawer next to the table at its height, the tags, the
switch. No e2e without the consent of the owner.

## Commits

As few commits as the change needs, each atomic, and each passing every check of the repository, so a bisect never
stops on a red commit:

1. `Table, Bro: Add the skin <library> ...`: the package, its tests and its README, with the shared files and texts
   above. The checks of the shared files, as `lint:styles` and `npm test`, pass only with all of them together.
2. `Table, Bro: Add the samples of the skin <library> ...`: `samples/<library>/**` and `samples/README.md`.
3. `Table, Bro MCP: Support the skin <library> ...`: the generator, the spec check and the docs of the MCP server, with
   the paragraph of the README of the skin about the AI coding agent and the skin in the table of the texts.

The subject starts with `Table, Bro:` (`Table, Bro MCP:` for the MCP server), the message is plain, for readers of an
open source history, and ends with the trailer `Co-Authored-By: Claude <model> (<effort>) <noreply@anthropic.com>`. A
fix of code that the branch adds goes into the commit that adds it, not into a commit of its own. A rewrite of the
branch keeps the committer date equal to the author date (`git rebase --committer-date-is-author-date`).

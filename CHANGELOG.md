# Changelog

## 1.2.2

A fix of the Angular packages of 1.2.1 on npm.

### Fixed

- `@table-bro/angular` 1.2.1 and `@table-bro/angular-material` 1.2.1 on npm hold the sources of the packages instead
  of their builds, so an application cannot import them. 1.2.2 publishes the builds; the code of the packages is the
  same as in 1.2.1.

## 1.2.1

Fixes of the page scroll, the refresh and the focus of the body.

### Fixed

- The page scroll moves by even steps in WebKit and on 120 Hz displays: the animations put their frames on the grid
  of the frame period of the display instead of the rounded frame times of the browser, and a run starts one frame
  period before its first frame instead of at the call.
- The dimming of a refresh no longer rewrites a `<style>` at every frame: the rule is written once, and the frames
  change only a custom property on the host. In the server mode the first frames of the scroll to a loaded page took
  9–18 ms in WebKit and take about 4 ms now.
- A `focus()` or a `scrollIntoView()` of a control in a row of another page no longer scrolls the body and leaves the
  rows off their page: the body container clips its rows with `overflow: clip`.

## 1.2.0

Accessibility, localization and server-side rendering.

### Accessibility and localization

- Screen readers: the links of the `bs` and `nv` toolbars say what they do, the ones that act on the table are
  buttons, and the live region is hidden again in the production build.
- Keyboard focus: it goes back to the Filters button when the filter drawer closes, focus rings are no longer cut
  off, and the hidden items of a cell are out of the tab order.
- `config.texts` by the component of the skin, as `{paginator: {nextPageLabel: 'Go to next page'}}`, also for the
  filter drawer of `bs` and `nv` and for the tags.

### Server-side rendering

- `<table-bro-ng>` prerenders the table during Angular server-side rendering, in the skins `mat`, `bs` and `nv`, so
  the page shows its layout before any script runs.
- `prerenderTableBro()` renders a table in its loading state into a server DOM without Angular.

### Fixed

- The progress bars and the menu select of `nv` in WebKit and Firefox, and the transition of the filter drawer in
  Safari.

## 1.1.0

The first open source release, and the first release on the public npm registry.

### Added

- The core and the skins are open source under the MIT license: the packages `@table-bro/*` on npm and the repository
  [github.com/table-bro/table-bro](https://github.com/table-bro/table-bro). The paid module Island Details,
  `@table-bro-extended/island-details`, stays separate: it installs from the registry of Table, Bro with the token of
  its purchase, not from npm.
- Rounded corners of Material 3: 12 px for the table and 16 px for the filter drawer.
- The filter drawer next to the table: `<table-bro-filter-drawer-container>` for the skins `bs` and `nv`,
  `<table-bro-filter-drawer-container-ng>` for `mat`.
- CSS variables `--bro-*` for the sizes and the timings of a table, as `--bro-row-height` and `--bro-corner-radius`,
  set in CSS without a rebuild.
- `config.texts` for the words of the table in the language of the application, and `config.styleNonce` for a strict
  Content Security Policy.
- `@table-bro/angular`: `<table-bro-ng>`, the Angular wrapper with signal inputs and outputs, for Angular 20 to 22.
- `@table-bro/mcp`, the MCP server for AI coding agents: the reference of the table, the check of a table spec and the
  code generator of a table for Angular and Vanilla JS. The MCP server and the Docs of table-bro.com take the same
  texts and code of the pages of Docs, from `@table-bro/mcp`.
- [`samples/`](samples): a working page for each skin, built from the packages as npm installs them, also at
  [table-bro.com/samples](https://table-bro.com/samples/angular-material/).
- `custom-elements.json` in `@table-bro/core` and the [API reference](docs/api/README.md).

### Fixed

- Bug fixes and improvements.

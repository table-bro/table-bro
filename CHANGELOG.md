# Changelog

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

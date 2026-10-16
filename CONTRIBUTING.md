# Contributing to Table, Bro

Thank you for helping. Bug reports, fixes and docs are welcome as issues and pull requests on GitHub. For a new feature
or a change of the public API, open an issue first: the API of 1.x is frozen, and a change of it waits for a reason and
a version.

## The repository

| Folder | Package |
| --- | --- |
| `packages/core` | `@table-bro/core`: the element `<table-bro>`, its controller, models and views, the CSS of the core |
| `packages/skins/native` | `@table-bro/native`, the skin `nv` |
| `packages/skins/bootstrap` | `@table-bro/bootstrap`, the skin `bs` |
| `packages/skins/shared` | The elements and styles that the vanilla skins share; each skin bundles them |
| `packages/skins/angular-material` | `@table-bro/angular-material`, the skin `mat` and its Angular components |
| `packages/angular` | `@table-bro/angular`, the wrapper `<table-bro-ng>` |
| `packages/mcp` | `@table-bro/mcp`, the MCP server |
| `scripts` | The build of the CSS, the checks of the architecture and of the public API, the git hook |
| `docs` | The [API reference](docs/api/README.md) and the interactive [architecture page](docs/architecture.html) |

[ARCHITECTURE.md](ARCHITECTURE.md) describes the parts of the code, the rules between them and how to add a feature.

## Setup

Node.js 22.12 or newer.

```sh
npm ci
npx playwright install chromium
npm run build
```

`npm ci` also points git to the hook in `scripts/git-hooks`: a commit with lint errors in its files stops there.
`npm run build` builds every package in order: the core, the vanilla skins, the Angular packages, the MCP server. The
skins and the Angular packages take the core by its name from the workspace, so build the core again after a change of
it.

## Checks

| Command | What it checks |
| --- | --- |
| `npm test` | `check:arch`, `check:api` and the unit tests in Chromium |
| `npm run check:arch` | The dependency rules of the code, see [ARCHITECTURE.md](ARCHITECTURE.md#the-rules) |
| `npm run check:api` | The public types of the built packages against `*.api.md` of each package |
| `npm run lint`, `npm run lint:styles` | ESLint and stylelint; `npm run format` and `npm run lint:styles:fix` fix what they can |
| `npm run test:mcp`, `npm run check:mcp` | The tests of the MCP server and the check of its generated code |
| `npm run test:coverage` | The unit tests with a coverage report in `coverage/` |

A pull request passes all of them. A change of the public API updates the reports with
`npm run check:api -- --update` and the reference with `npm run docs:api`, and says why in its description.

## Code

- TypeScript in `strict` mode. Comments in English, about what the code does and why.
- One import line per module, the blocks of imports and exports aligned, as in the code around.
- A JSDoc with `@param` describes every parameter of a function it documents.
- Each method and function of the controller names its phase with `@phase`.
- No runtime dependencies in the core and the vanilla skins.
- Values of the application go into the DOM by `textContent` and `setAttribute`, never as HTML, except a column
  with `html: true`.
- A fix comes with a unit test that fails without it.

## Commits

One change per commit, with a message in English that says what the change does:

```
Table, Bro: Keep the page of the table when its rows are replaced with the same total
```

The subject starts with the part it changes: `Table, Bro:` for the core, the skins and the Angular packages,
`Table, Bro MCP:` for the MCP server. The body, when the subject is not enough, says why.

## Branches and releases

`main` is the only long-lived branch. A pull request comes from a short branch off `main`, named by its kind:
`fix/…`, `feat/…` or `docs/…`. It is merged by rebase or squash, so `main` keeps a linear history without merge
commits; bring a branch up to date by rebasing it on `main`, not by merging `main` into it.

A release is a tag `vX.Y.Z` on `main` and a GitHub Release with the notes of its version from
[CHANGELOG.md](CHANGELOG.md). A branch `release/x.y.x` appears only when a fix has to reach an older minor version.

## License

By contributing you agree that your contribution is licensed under the [MIT license](LICENSE) of the repository.

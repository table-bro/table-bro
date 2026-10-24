# @table-bro/mcp

The MCP server of [Table, Bro](https://table-bro.com): pixel-perfect Material (M3) data tables for Angular, and more.
Add it to Claude Code, Cursor or Codex, tell the agent what table you need, and it installs the packages and generates
the table, its setup and its cells from one request, for Angular and Vanilla JS. The server gives the agent the
reference of the table, the check of a table spec and the code generator of a table, with the skins `mat` (Angular
Material), `bs` (Bootstrap 5) and `nv` (native HTML). The agent writes the files; the server only reads.

```sh
claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.1.0
```

The setup for the other agents is [below](#setup). Docs: [MCP server](https://table-bro.com/docs/ai/mcp-server),
[Getting started](https://table-bro.com/docs/getting-started).

| Tool | What it gives |
| --- | --- |
| `get_started` | How Table, Bro works, the order of the tools and a minimal table for your target and skin, once a session |
| `get_docs` | A topic of the reference or a page of Docs with its code, the topics of a query, or the list of the topics |
| `inspect_project` | The packages, the skins, the CSS, the elements and the tables of the project, and the problems of its setup with their fixes |
| `validate_spec` | Every error and warning of a table spec, with its path and its fix |
| `generate_code` | The files of a new table from a spec or a built-in spec, the setup of the project and what to finish by hand |
| `scaffold_component` | One custom cell, the row details or the filters of the Filter Drawer for an existing table, with how to connect it |

## Setup

The server describes one version of Table, Bro: run the version of `@table-bro/core` that the project has, as `1.1.0` below.
After an update of Table, Bro, change the version in the setup of the agent too; `inspect_project` compares the
versions and gives the line to change.

`npx` downloads the package and starts it: the project does not install `@table-bro/mcp`. Node.js 22.12 or newer.

**Claude Code**, `.mcp.json` in the root of the project:

```json
{"mcpServers": {"table-bro": {"command": "npx", "args": ["-y", "@table-bro/mcp@1.1.0"]}}}
```

or `claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@1.1.0`.

**Codex**, `~/.codex/config.toml`:

```toml
[mcp_servers.table-bro]
command = "npx"
args = ["-y", "@table-bro/mcp@1.1.0"]
```

Codex calls the tools of the server when `AGENTS.md` of the project says so:

```markdown
The tables of this project are Table, Bro. Its MCP server table-bro has the reference, the check of a table and the code generator: call its tool get_started before you write or change a table.
```

**Cursor**, `.cursor/mcp.json` in the project:

```json
{"mcpServers": {"table-bro": {"command": "npx", "args": ["-y", "@table-bro/mcp@1.1.0"]}}}
```

**VS Code**, `.vscode/mcp.json` in the project:

```json
{"servers": {"table-bro": {"type": "stdio", "command": "npx", "args": ["-y", "@table-bro/mcp@1.1.0"]}}}
```

**Claude Desktop**, `claude_desktop_config.json`:

```json
{"mcpServers": {"table-bro": {"command": "npx", "args": ["-y", "@table-bro/mcp@1.1.0"]}}}
```

## The folder of the project

`inspect_project` reads the project as text. It takes the folder in its argument `path`; without it, the first root of
the workspace that the client gives, else the folder where the client started the server. A client that starts the
server outside the project and gives no roots, as a desktop application may, needs `path`: the agent passes the root
of the project. The profile names the folder it describes.

## Paid modules

A paid module of Table, Bro adds its fields of the config, its topics and its setup to the server when the server is
started with its name, and the module is installed in the project:

```json
{"mcpServers": {"table-bro": {"command": "npx", "args": ["-y", "@table-bro/mcp@1.1.0", "--extension", "<the package of the module>"]}}}
```

The server runs the code of no other package.

## In code

The tools are pure functions, and the package exports them for Node.js and the browser: `validateSpec`,
`generateCode`, `getDocs`, the built-in specs, `builtinSpecs`, and the JSON Schema of a spec, `specSchema`.

## License

MIT

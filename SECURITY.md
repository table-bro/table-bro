# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.1.x | Yes |

## Reporting a vulnerability

Report a vulnerability privately, not in a public issue:

- on GitHub, by **Report a vulnerability** on the Security tab of the repository, or
- by email to bro@table-bro.com.

Give the package and its version, the steps or the code that show the problem, and what an attacker gains. You get an
answer within five working days. A confirmed vulnerability gets a fix in a patch release and a GitHub security
advisory that names you, unless you ask not to be named.

## Scope

The table renders the values of cells as text. A column with `html: true`, the element `bro-table-html-cell` and the
attributes that `attrs` of a column sets take the values of the application as they are: the table does not sanitize
them, as `v-html` of Vue and `dangerouslySetInnerHTML` of React do not. An XSS through HTML that the application passes
there unsanitized is a bug of the application. An XSS through values that the table should render as text is a
vulnerability of Table, Bro.

The MCP server `@table-bro/mcp` only reads: it writes no files and makes no network requests. A way to make it write,
reach the network or put unescaped input into generated code is a vulnerability.

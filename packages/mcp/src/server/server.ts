import {fileURLToPath, pathToFileURL} from 'node:url';

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z      from 'zod/v4';

import {allTopics, getDocs, getStarted, serverInstructions}                              from '../docs/docs.js';
import type {BroMcpExtension}                                                            from '../extension.js';
import {generateCode}                                                                    from '../generate/generate-code.js';
import {scaffoldComponent}                                                               from '../generate/scaffold.js';
import {setupText}                                                                       from '../generate/setup.js';
import {findExtensions, inspectProject}                                                  from '../project/inspect-project.js';
import {builtinSpecs}                                                                    from '../spec/builtin-specs.js';
import {type BroJsonSchema, cellFillingSchema, fillingsSchema, filterSchema, specSchema} from '../spec/schema.js';
import type {BroTableSpec}                                                               from '../spec/spec.js';
import {type BroSpecLimits, rowDetailsByDefault, validateSpec}                           from '../spec/validate-spec.js';
import {tableBroVersion}                                                                 from '../version.js';

const skin = z.enum(['mat', 'bs', 'nv']).describe('The skin, the UI library the table works on top of: mat (Angular Material), bs (Bootstrap 5) or nv (native HTML, no library)');
const target = z.enum(['angular', 'vanilla']).describe('The target: angular for an Angular project, through the wrapper <table-bro-ng>; vanilla for a page without a framework, the Custom Element <table-bro> itself');

/**
 * A value that the tool checks itself, shown to the agent with its JSON Schema: the check of the tool names every
 * error with its path and its fix, as did you mean, which a check of the arguments by the schema would not.
 */
function shown(schema: BroJsonSchema): z.ZodAny {
  // The dialect of the schema stays out: the list of the tools gives its own
  return z.any().meta(Object.fromEntries(Object.entries(schema).filter(([key]) => key !== '$schema')));
}

const issue = z.object({path: z.string(), message: z.string(), fix: z.string().optional()});
const report = {valid: z.boolean(), errors: z.array(issue), warnings: z.array(issue), omitted: z.object({errors: z.number().optional(), warnings: z.number().optional()}).optional()};

/** The sizes of a spec that the server takes: the answers of a larger one would fill the context of the agent. */
const limits: BroSpecLimits = {cols: 200, rows: 1000, cells: 100, filters: 100, valueLength: 2000};

const profile = {
  folder: z.string(),
  tableBro: z.object({version: z.string().nullable(), packages: z.record(z.string(), z.string()), extensions: z.array(z.string())}),
  framework: z.object({name: z.enum(['angular', 'none']), version: z.string().nullable()}),
  ui: z.object({material: z.string().nullable(), bootstrap: z.string().nullable()}),
  skins: z.object({registered: z.array(z.enum(['mat', 'bs', 'nv'])), where: z.array(z.string())}),
  styles: z.array(z.string()),
  customElements: z.array(z.object({tag: z.string(), file: z.string()})),
  tables: z.array(z.string()),
  problems: z.array(z.object({code: z.string(), message: z.string(), fix: z.string()})),
  omitted: z.record(z.string(), z.number()).optional()
};

/** Every tool only reads, and the same call gives the same answer: the agent writes the files. */
const readOnly = {readOnlyHint: true, idempotentHint: true, openWorldHint: false};

/**
 * The first folder of the workspace of the client, when the client gives its roots: a client may start the server
 * outside the project, as a desktop application does.
 */
async function clientRoot(server: McpServer): Promise<string | undefined> {
  if (!server.server.getClientCapabilities()?.roots) {
    return undefined;
  }

  try {
    const {roots} = await server.server.listRoots();
    const folder = roots.find(item => item.uri.startsWith('file:'));

    return folder ? fileURLToPath(folder.uri) : undefined;
  } catch {
    return undefined;
  }
}

/** The paid modules that the arguments of the server name: --extension <package>, once for each module. */
export function enabledExtensions(args: string[]): string[] {
  return args.flatMap((arg, index) => {
    if (arg === '--extension') {
      return args[index + 1] ? [args[index + 1]] : [];
    }

    return arg.startsWith('--extension=') ? [arg.slice('--extension='.length)] : [];
  });
}

/**
 * Loads the parts of the server of the installed paid modules that the server is started with, from the scope
 * @table-bro-extended only: the server runs no code of a package that nobody named. A module that fails to load, or has
 * no part of the server, is left out with a message on stderr, and the server works without it.
 * @param root - the folder of the project
 * @param enabled - the packages of the modules that the arguments of the server name
 */
export async function loadExtensions(root: string, enabled: string[]): Promise<BroMcpExtension[]> {
  const extensions: BroMcpExtension[] = [];
  const installed = findExtensions(root);

  for (const name of enabled) {
    const found = installed.find(extension => extension.name === name);

    if (!found) {
      console.error(`[@table-bro/mcp] ${name} is not loaded: no package of the scope @table-bro-extended with a part of the MCP server has this name in ${root}`);
      continue;
    }

    try {
      const extension = (await import(pathToFileURL(found.entry).href)).default;

      if (typeof extension?.package !== 'string') {
        throw new Error('its file has no part of the MCP server as its default export');
      }

      extensions.push(extension);
    } catch (error) {
      console.error(`[@table-bro/mcp] ${name} is not loaded: ${(<Error>error).message}`);
    }
  }

  return extensions;
}

/**
 * The MCP server of Table, Bro: six tools over the pure functions of the package. It reads the project and writes
 * nothing: the agent writes the files and shows the changes to the developer.
 */
export function createServer(root: string, extensions: BroMcpExtension[] = []): McpServer {
  const server = new McpServer({name: 'table-bro', version: tableBroVersion}, {instructions: serverInstructions});

  server.registerTool('get_started', {
    title: 'Get started with Table, Bro',
    description: 'Call this first, once per session. It explains how Table, Bro works, a Web Components table engine on top of the UI library of your project, and which tool to use when; '
      + 'shows a minimal table for your target and skin; lists the topics of get_docs. Do not call it again in the same session: use get_docs. Example: {"target": "angular", "skin": "mat"}',
    inputSchema: {target: target.optional(), skin: skin.optional()},
    annotations: readOnly
  }, ({target, skin}) => text(getStarted({target, skin}, extensions)));

  server.registerTool('get_docs', {
    title: 'The reference of Table, Bro',
    description: 'Returns one topic of the reference or one page of Docs with its code by its name, the two topics that match a query best, or all topics with their summaries. '
      + 'Use it for questions about the API and for changes of an existing table; get_started already gives the topics basics and workflow. '
      + 'Example: {"topic": "server-mode"} or {"query": "row height"}',
    inputSchema: {
      topic: z.enum(<[string, ...string[]]>allTopics(extensions).map(topic => topic.name)).optional(),
      query: z.string().optional().describe('The words to search the topics for, as row height; without topic')
    },
    annotations: readOnly
  }, ({topic, query}) => text(getDocs({topic, query}, extensions)));

  server.registerTool('inspect_project', {
    title: 'Inspect the project',
    description: 'Profiles the project: the packages of Table, Bro and their version, the framework, the registered skins, the CSS, the custom elements, the tables, '
      + 'and the problems of the setup with their fixes. Call it once before you add code to a project, and when a table does not render. '
      + 'Pass skins.registered as the skin and framework.name as the target of the other tools. Not for questions about the API. '
      + 'Each list keeps its first 20 items; omitted counts the rest. It reads the project as text and writes nothing. Example: {}',
    inputSchema: {path: z.string().optional().describe('The root of the project. Without it, the first root of the workspace that the client gives, else the folder where the server was started')},
    outputSchema: profile,
    annotations: readOnly
  }, async ({path}) => structured(inspectProject(path ?? await clientRoot(server) ?? root)));

  server.registerTool('validate_spec', {
    title: 'Check a table spec',
    description: 'Checks a table spec, a BroTableSpec (get_docs, topic spec), and reports every error and warning with its path, what is wrong and the fix. '
      + 'Use it while you draft a spec. generate_code runs the same check first and returns the same report for a spec with errors. '
      + 'Example: {"spec": {"specVersion": 1, "rowType": "Product", "fields": [{"name": "title", "type": "string"}], "cols": [{"title": "Product", "name": "title"}]}, "skin": "mat"}',
    inputSchema: {spec: shown(specSchema), skin: skin.optional().describe('The skin of the project: mat, bs or nv. Without it the spec is checked against all three')},
    outputSchema: report,
    annotations: readOnly
  }, ({spec, skin}) => {
    const result = validateSpec(spec, {skin, extensions, limits});

    // Every table has row details by default: a warning, as the request may ask for a table without them
    result.warnings.push(...rowDetailsByDefault(spec));

    return structured(result);
  });

  server.registerTool('generate_code', {
    title: 'Generate the code of a table',
    description: 'Generates the code of a new table from a spec or from a built-in spec: the files, the setup of the project, once per project, and what is left to finish by hand. '
      + 'The fillings are the templates of the cells, the rules of the custom filters and the bodies of the functions of the skin config (get_docs, topic fillings); '
      + 'without them the files keep TODOs. A spec with errors returns the report of validate_spec and no files. '
      + 'For one cell, the row details or the filters of an existing table use scaffold_component. '
      + 'Example: {"builtinSpec": "products", "target": "angular", "skin": "mat"}',
    inputSchema: {
      // The list of the tools goes into the context of the agent in every session: the schema of a spec stays in validate_spec
      spec: z.any().optional().describe('A BroTableSpec, as the JSON Schema of the spec of validate_spec describes it'),
      builtinSpec: z.enum(<[string, ...string[]]>builtinSpecs.map(builtin => builtin.name)).optional().describe(`The name of a built-in spec instead of a spec: ${builtinSpecs.map(builtin => `${builtin.name}, ${builtin.description}`).join('; ')}`),
      fillings: shown(fillingsSchema).optional(),
      target,
      skin
    },
    annotations: readOnly
  }, ({spec, builtinSpec, fillings, target, skin}) => {
    const builtin = builtinSpecs.find(item => item.name === builtinSpec);

    if (!spec && !builtin) {
      return {...text('Give a spec or the name of a built-in spec.'), isError: true};
    }

    const result = generateCode(<BroTableSpec>(spec ?? builtin!.spec), {target, skin, fillings: fillings ?? builtin?.fillings, extensions, limits});

    if (!result.report.valid) {
      return {...text(`The spec has errors:\n\n${JSON.stringify(result.report, null, 2)}`), isError: true};
    }

    result.report.warnings.push(...rowDetailsByDefault(spec ?? builtin!.spec));

    return text([
      ...result.files.map(file => `## ${file.path}\n\n${file.description ? `${file.description[0].toUpperCase()}${file.description.slice(1)}\n\n` : ''}\`\`\`${file.path.endsWith('.css') ? 'css' : 'ts'}\n${file.content}\`\`\``),
      `## Setup, once per project\n\n${setupText(result.setup)}`,
      ...(result.todo.length ? [`## To finish\n\n${result.todo.map(item => `- ${item}`).join('\n')}`] : []),
      ...(result.report.warnings.length ? [`## Warnings\n\n${result.report.warnings.map(item => `- ${item.path}: ${item.message}${item.fix ? `; ${item.fix}` : ''}`).join('\n')}`] : [])
    ].join('\n\n'));
  });

  server.registerTool('scaffold_component', {
    title: 'Scaffold a component of a table',
    description: 'Scaffolds one component for an existing table: a custom cell, the element of the row details, or the filters of the Filter Drawer, and tells how to connect it to the page: '
      + 'the registration of the element and its column, or the container of the drawer. '
      + 'For a new table use generate_code, which writes its cells too. '
      + 'Example: {"kind": "cell", "target": "angular", "skin": "mat", "rowType": "Order", "fields": [{"name": "status", "type": "string"}], "name": "status", "shows": "the status as a chip", "reads": ["status"]}',
    inputSchema: {
      kind: z.enum(['cell', 'details', 'filters']).describe('What to scaffold: cell, a custom cell of a column; details, the element of the row details; filters, the filters of the Filter Drawer'),
      target,
      skin,
      rowType: z.string().describe('The name of the type of a row in PascalCase, as Order'),
      fields: z.array(z.object({name: z.string(), type: z.enum(['string', 'number', 'boolean', 'string[]']), values: z.array(z.string()).optional()})).describe('The fields of the row: name, type (string, number, boolean or string[]) and, for a string field, its values'),
      name: z.string().optional().describe('For a cell or the details: its name in kebab-case, as status; the tag of the element is bro-cell-<row-type>-<name>'),
      shows: z.string().optional().describe('For a cell or the details: what it shows, in words, as the status as a chip'),
      reads: z.array(z.string()).optional().describe('For a cell or the details: the names of the fields of the row that it reads'),
      actions: z.array(z.string()).optional().describe('For a cell: the actions that it sends in its output action, as edit; the table gives them to the page as bro-action with the column and the row'),
      filters: shown({type: 'array', description: 'For filters: the filters of the Filter Drawer, in the form of filters of a spec; get_docs, topic filters', items: filterSchema}).optional(),
      filling: shown({...cellFillingSchema, description: 'For a cell or the details, the code that you write: {imports, template, styles, members} for an Angular project, {render, members} for Vanilla JS; get_docs, topic fillings'}).optional()
    },
    annotations: readOnly
  }, request => {
    const scaffold = scaffoldComponent(<Parameters<typeof scaffoldComponent>[0]>request);

    if (!scaffold.report.valid) {
      return {...text(`The request has errors:\n\n${JSON.stringify(scaffold.report, null, 2)}`), isError: true};
    }

    return text(`## ${scaffold.path}\n\n\`\`\`ts\n${scaffold.content}\`\`\`\n\n${scaffold.connect}`);
  });

  return server;
}

function text(value: string) {
  return {content: [{type: <const>'text', text: value}]};
}

/** A result of the form of the output schema of its tool, also as JSON text for a client without structured content. */
function structured<T extends object>(value: T) {
  return {...text(JSON.stringify(value, null, 2)), structuredContent: <Record<string, unknown>>value};
}

/** Code to print as it is inside a literal, as a function in a config. */
export class BroRawCode {
  constructor(readonly code: string) {
  }
}

export function raw(code: string): BroRawCode {
  return new BroRawCode(code);
}

/**
 * Prints a value as a TypeScript literal in the style of the code of Table, Bro: single quotes, an object with one field
 * on a line, objects of an array joined with "}, {", no trailing commas. Undefined fields are left out.
 */
export function literal(value: unknown, indent: string = ''): string {
  const inner = indent + '  ';

  if (value instanceof BroRawCode) {
    return reindent(value.code, indent);
  }

  if (typeof value === 'string') {
    return quote(value);
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return '[]';
    }

    if (value.every(item => item === null || typeof item !== 'object')) {
      return `[${value.map(item => literal(item)).join(', ')}]`;
    }

    if (value.every(item => isPlainObject(item))) {
      return `[\n${inner}${value.map(item => literal(item, inner)).join(', ')}\n${indent}]`;
    }

    return `[\n${value.map(item => inner + literal(item, inner)).join(',\n')}\n${indent}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, item]) => item !== undefined);

    if (!entries.length) {
      return '{}';
    }

    return `{\n${entries.map(([key, item]) => `${inner}${objectKey(key)}: ${literal(item, inner)}`).join(',\n')}\n${indent}}`;
  }

  return String(value);
}

/**
 * A key of an object literal in the style of the code of Table, Bro: a key in camelCase without quotes, any other in quotes.
 * @param key - the name of the key
 */
export function objectKey(key: string): string {
  return /^[a-z][a-zA-Z0-9]*$/.test(key) ? key : quote(key);
}

/** A string literal: the line terminators of JavaScript would end it, so they go in as escapes. */
export function quote(value: string): string {
  return `'${value.replace(/[\\'\n\r\u2028\u2029]/g, char => stringEscapes[char])}'`;
}

const stringEscapes: Record<string, string> = {'\\': '\\\\', '\'': '\\\'', '\n': '\\n', '\r': '\\r', '\u2028': '\\u2028', '\u2029': '\\u2029'};

/** A text of the spec for a comment of one line: a line break would end the comment, and the rest would be code. */
export function lineComment(value: string): string {
  return value.replace(/[\n\r\u2028\u2029]+/g, ' ');
}

/** A text of the spec for a block comment of one line: its end, the star and the slash, would make the rest code. */
export function blockComment(value: string): string {
  return lineComment(value).replace(/\*\//g, '*\\/');
}

/** A text of the spec for an HTML comment: two hyphens could end it, and the rest would be markup. */
export function htmlComment(value: string): string {
  return lineComment(value).replace(/-(?=-)/g, '- ');
}

/** A text for a template literal: the backticks and the placeholders of the text stay text. */
export function templateText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

/** Moves the lines after the first one by the indent: a block of code inside other code. */
export function reindent(code: string, indent: string): string {
  return code.split('\n').map((line, index) => (index && line) ? indent + line : line).join('\n');
}

/** Indents every non-empty line of a block. */
export function indentBlock(code: string, indent: string): string {
  return code.split('\n').map(line => line ? indent + line : line).join('\n');
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** A text for an Angular template: also its interpolation and its blocks stay text. */
export function escapeTemplate(value: string): string {
  return escapeHtml(value).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').replace(/@/g, '&#64;');
}

/**
 * Import lines grouped as in the code of Table, Bro: a block per group of the modules, the "from" of a block aligned,
 * the lines of a block sorted by module, one line per module. A name with the prefix "type " is a type: import type
 * {...} when the module gives only types, an inline type next to the values otherwise, as verbatimModuleSyntax takes
 * them. A module with the prefix "type " gives only types.
 * @param modules - the names to import by their modules
 */
export function imports(modules: Record<string, string[]>): string {
  const groups: [string, string][][] = [[], [], [], []];
  const merged = new Map<string, Map<string, boolean>>();

  Object.entries(modules).forEach(([key, names]) => {
    const module = key.replace(/^type /, '');
    const kinds = merged.get(module) ?? new Map<string, boolean>();

    names.forEach(entry => {
      const name = entry.replace(/^type /, '');
      const type = key.startsWith('type ') || entry.startsWith('type ');

      kinds.set(name, (kinds.get(name) ?? true) && type);
    });
    merged.set(module, kinds);
  });

  [...merged.entries()]
    .filter(([, kinds]) => kinds.size)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([module, kinds]) => {
      const types = [...kinds.values()].every(Boolean);
      const list = [...kinds.keys()].sort(byName).map(name => (kinds.get(name) && !types) ? `type ${name}` : name).join(', ');

      groups[importGroup(module)].push([`import ${types ? 'type ' : ''}{${list}}`, `from '${module}';`]);
    });

  return groups
    .filter(lines => lines.length)
    .map(lines => {
      const width = Math.max(...lines.map(([head]) => head.length));

      return lines.map(([head, tail]) => `${head.padEnd(width)} ${tail}`).join('\n');
    })
    .join('\n\n');
}

/**
 * The field imports of an Angular decorator as in the code of Table, Bro: one entry per line, in the groups of the
 * imports between blank lines, each group sorted by name.
 * @param modules - the classes of the field by their modules
 */
export function importsField(modules: Record<string, string[]>): string {
  const groups: string[][] = [[], [], [], []];

  Object.entries(modules).forEach(([module, names]) => groups[importGroup(module)].push(...names));

  return `  imports: [\n${groups.filter(names => names.length).map(names => [...new Set(names)].sort((a, b) => a.localeCompare(b, 'en')).map(name => `    ${name}`).join(',\n')).join(',\n\n')}\n  ]`;
}

/**
 * The group of a module among the imports, as the ESLint settings of Table, Bro order them: 0 Angular, 1 the UI
 * libraries, Angular Material and Table, Bro among them, 2 other libraries, 3 the application.
 * @param module - the module of an import
 */
function importGroup(module: string): number {
  if (module.startsWith('.')) {
    return 3;
  }

  if (/^@angular\/(?!material(\/|$)|cdk(\/|$))/.test(module)) {
    return 0;
  }

  return /^(@angular\/(material|cdk)(\/|$)|bootstrap$|@table-bro(-extended)?\/)/.test(module) ? 1 : 2;
}

/** The order of the names in an import: case-insensitive, as in the code of Table, Bro. */
function byName(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase()) || a.localeCompare(b);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof BroRawCode);
}

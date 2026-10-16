import type {BroMcpExtension}                                                                                                       from '../extension.js';
import {checkCssValue, cssVariables, excludedCssVariables}                                                                          from './css-variables.js';
import {type BroSkinConfigShape, skinCallbacks, skinCallbacksElsewhere, skinConfigElsewhere, skinConfigShape, skinElementContracts} from './skin-config.js';
import {type BroSpecCell, type BroSpecField, type BroSpecFilter, type BroSpecSkin, specIdentifier}                                  from './spec.js';

export interface BroSpecIssue {
  /** The path of the field in the spec, as cols[3].component.cell; empty for the spec itself. */
  path: string;
  /** What is wrong. */
  message: string;
  /** How it should be, when it is known. */
  fix?: string;
}

export interface BroSpecReport {
  valid: boolean;
  errors: BroSpecIssue[];
  warnings: BroSpecIssue[];
  /** The issues after the first 100 errors and the first 100 warnings, which the report leaves out. */
  omitted?: {errors?: number; warnings?: number};
}

/** The issues of each kind that a report gives. */
const maxReported = 100;

/** The longest name that gets a suggestion of the nearest name. */
const maxSuggestedName = 100;

/** The sizes that a host of the generator renders: a strict JSON Schema of a model checks no sizes. */
export interface BroSpecLimits {
  cols?: number;
  rows?: number;
  cells?: number;
  filters?: number;
  /** The length of a string value of a row. */
  valueLength?: number;
}

export interface BroValidateOptions {
  /** The skin of the project; without it the spec is checked for the three skins. */
  skin?: BroSpecSkin;
  /** A host that renders the table of the spec, as a preview, requires its rows. */
  rowsRequired?: boolean;
  limits?: BroSpecLimits;
  /** The paid modules of the project: their fields of the config are known. */
  extensions?: BroMcpExtension[];
}

export class BroSpecIssues {
  readonly errors: BroSpecIssue[] = [];
  readonly warnings: BroSpecIssue[] = [];

  error(path: string, message: string, fix?: string): void {
    this.errors.push(fix ? {path, message, fix} : {path, message});
  }

  warning(path: string, message: string, fix?: string): void {
    this.warnings.push(fix ? {path, message, fix} : {path, message});
  }
}

/** The fields of BroConfig that the spec gives in other places or leaves out, with the reason. */
const configElsewhere: Record<string, [string, string?]> = {
  skin: ['the skin is not a part of the spec', 'pass the skin to generate_code as its parameter'],
  components: ['the settings of a skin are not a part of config in the spec', 'put them into skinConfig.<skin>.components'],
  css: ['the classes of a skin are not a part of config in the spec', 'put them into skinConfig.<skin>.css'],
  filtersTransform: ['a function is not a part of the spec', 'describe the filters in filters: the generator writes filtersTransform'],
  shortColumnTitle: ['a function is not a part of the spec', 'give the short titles in shortTitle of the columns: the generator writes shortColumnTitle'],
  autoColumnWidth: ['not in the spec of the first version: without the auto widths the CSS of the application sizes every column'],
  styleNonce: ['the nonce is a value of the page', 'the page gives it to the config itself'],
  stateAnimationEffect: ['not in the spec of the first version'],
  rowDetailsProgressMode: ['not in the spec of the first version'],
  debug: ['not a part of the spec'],
  debugAnimation: ['not a part of the spec']
};

/** The fields of BroConfig of the paid modules, by their packages. */
const paidConfig: Record<string, string> = {
  rowDetailsIsland: '@table-bro-extended/island-details'
};

/** The fields of BroCol that the spec leaves out, with the reason. */
const colElsewhere: Record<string, [string, string?]> = {
  className: ['the spec gives no classes: the generator sets the class bro-col_text-right of the skin on a column of a number field itself, and another class needs CSS of the application', 'remove className: a column of a number field stands at the right without it; another class goes into cols of the generated page by hand, with its CSS in the application'],
  html: ['the markup of a cell comes from its component', 'describe the cell in cells and name it in component.cell'],
  colSpan: ['not in the spec of the first version'],
  sortDirection: ['the table does not read it']
};

const componentElsewhere: Record<string, [string, string?]> = {
  selector: ['the tags depend on the skin and the generation', 'name an own cell in component.cell or a ready element of the skins in component.element'],
  attrs: ['an own cell reads the row itself', 'list the fields in the cell of cells'],
  event: ['the generator names the event of the actions of a cell', 'list the actions in the cell of cells']
};

const kebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const actionName = /^[a-z][a-zA-Z0-9-]*$/;
const iconName = /^[a-z0-9_]+$/;

const fieldTypes = ['string', 'number', 'boolean', 'string[]'];
const reservedFilterNames = ['search', 'advancedFilters'];

/**
 * Every table has row details by default: validate_spec and generate_code warn about a table without them, as a request
 * may ask for such a table.
 */
export function rowDetailsByDefault(spec: unknown): BroSpecIssue[] {
  const config = (spec && typeof spec === 'object') ? (<{config?: Record<string, unknown>}>spec).config : undefined;

  return config?.['rowDetailsComponent']
    ? []
    : [{
        path: 'config.rowDetailsComponent',
        message: 'the table has no row details, which every table has by default',
        fix: 'add a cell of the kind details with what the row has no room for, name it in config.rowDetailsComponent and give a column the element details-button; leave them out only when the request asks for a table without them'
      }];
}

/**
 * Checks a table spec and tells for every problem where it is, what is wrong and how it should be. The site runs it
 * on every answer of the model, the MCP server before the generator.
 */
export function validateSpec(spec: unknown, options: BroValidateOptions = {}): BroSpecReport {
  const issues = new BroSpecIssues();

  if (!isObject(spec)) {
    issues.error('', 'the spec is not an object', 'pass a BroTableSpec object');

    return report(issues);
  }

  checkKeys(spec, ['specVersion', 'rowType', 'fields', 'cols', 'cells', 'filters', 'rows', 'config', 'toolbar', 'stateMessages', 'skinConfig', 'cssVars', 'api'], '', issues);

  if (spec['specVersion'] !== 1) {
    issues.error('specVersion', 'expected 1');
  }

  if (typeof spec['rowType'] !== 'string' || !/^[A-Z][A-Za-z0-9]*$/.test(spec['rowType'])) {
    issues.error('rowType', 'expected the name of the type of a row in PascalCase', 'as Order');
  }

  const fields = checkFields(spec['fields'], issues);
  const cells = checkCells(spec['cells'], fields, issues);
  const config = isObject(spec['config']) ? spec['config'] : {};

  checkCols(spec['cols'], fields, cells, config, issues);
  checkFilters(spec['filters'], fields, issues);
  checkConfig(spec['config'], cells, options, issues);
  checkUnusedCells(spec, cells, issues);
  checkToolbar(spec['toolbar'], spec, options, issues);
  checkStateMessages(spec['stateMessages'], issues);
  checkSkinConfig(spec['skinConfig'], options, issues);
  checkCssVars(spec['cssVars'], Array.isArray(spec['filters']) && spec['filters'].length > 0, issues);
  checkRows(spec['rows'], fields, options, issues);
  checkApi(spec['api'], fields, config, spec['filters'], issues);
  checkLimits(spec, options.limits, issues);

  return report(issues);
}

function checkFields(value: unknown, issues: BroSpecIssues): Map<string, BroSpecField> {
  const fields = new Map<string, BroSpecField>();

  if (!Array.isArray(value) || !value.length) {
    issues.error('fields', 'expected a non-empty array of the fields of a row', 'as [{"name": "number", "type": "string"}]');

    return fields;
  }

  value.forEach((field: unknown, index: number) => {
    const path = `fields[${index}]`;

    if (!isObject(field)) {
      issues.error(path, 'expected an object');

      return;
    }

    checkKeys(field, ['name', 'type', 'values', 'source'], path, issues);

    const name = field['name'];

    if (typeof name !== 'string' || !specIdentifier.test(name)) {
      issues.error(`${path}.name`, 'expected an identifier', 'as customerName');
    } else if (fields.has(name)) {
      issues.error(`${path}.name`, `the field ${name} is already declared`, 'every field has a name of its own');
    }

    if (!fieldTypes.includes(<string>field['type'])) {
      issues.error(`${path}.type`, `expected one of ${fieldTypes.join(', ')}`);
    }

    if (field['values'] !== undefined) {
      if (field['type'] !== 'string' && field['type'] !== 'string[]') {
        issues.error(`${path}.values`, 'values are for fields of the type string or string[]', 'remove values, or give the field the type string or string[]');
      } else if (!isStringArray(field['values']) || !field['values'].length || field['values'].some(item => !item)) {
        issues.error(`${path}.values`, 'expected a non-empty array of non-empty strings');
      } else if (new Set(field['values']).size !== field['values'].length) {
        issues.error(`${path}.values`, 'the values repeat', `keep one ${field['values'].find((item, index) => (<string[]>field['values']).indexOf(item) !== index)}`);
      }
    }

    if (field['source'] !== undefined && (typeof field['source'] !== 'string' || !sourcePath.test(field['source']))) {
      issues.error(`${path}.source`, 'expected the path of a value in an item of the answer of the API', 'as price or meta.createdAt');
    }

    if (typeof name === 'string' && !fields.has(name)) {
      fields.set(name, <BroSpecField><unknown>field);
    }
  });

  return fields;
}

/** A path in an answer of an API: names and indexes split by dots, as meta.createdAt or images.0. */
const sourcePath = /^[A-Za-z_$][\w$-]*(\.[\w$-]+)*$/;

/** An API gives the rows: its address, the path of the rows, and the source of every field. */
function checkApi(value: unknown, fields: Map<string, BroSpecField>, config: Record<string, unknown>, filters: unknown, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('api', 'expected an object', 'as {"url": "https://dummyjson.com/products", "rows": "products"}');

    return;
  }

  checkKeys(value, ['url', 'rows', 'paging', 'total', 'search', 'sort', 'filters'], 'api', issues);

  let url: URL | undefined;

  try {
    url = new URL(<string>value['url']);
  } catch {
    // The check below names the error
  }

  // The API of the project itself has the path of the site, as /api/orders: the page of the project asks it
  const projectPath = typeof value['url'] === 'string' && /^\/(?!\/)[^\s]*$/.test(value['url']);

  if (!projectPath && (!url || !['http:', 'https:'].includes(url.protocol))) {
    issues.error('api.url', 'expected the address of a GET endpoint: http or https, or the path of the API of the project, as /api/orders');
  }

  if (typeof value['rows'] !== 'string' || (value['rows'] && !sourcePath.test(value['rows']))) {
    issues.error('api.rows', 'expected the path of the array of the rows in the answer, or an empty string for an answer that is the array');
  }

  const parameter = (item: unknown) => typeof item === 'string' && /^[\w.$-]+$/.test(item);
  const paging = value['paging'];

  if (paging !== undefined && (!isObject(paging) || !parameter(paging['size']) || (paging['offset'] === undefined) === (paging['page'] === undefined)
    || ![paging['offset'], paging['page']].every(item => item === undefined || parameter(item)))) {
    issues.error('api.paging', 'expected the query parameters of a page: size, and offset or page', 'as {"size": "limit", "offset": "skip"}');
  }

  // The table shows its pages by the number of all rows
  if ((value['total'] !== undefined || paging !== undefined) && (typeof value['total'] !== 'string' || !sourcePath.test(value['total']))) {
    issues.error('api.total', 'expected the path of the number of all rows in the answer: an API that gives pages has it', 'as total');
  }

  checkApiQuery(value, filters, issues);

  // The page loads the answer and answers the queries of the table from its rows
  if (config['server'] !== true) {
    issues.error('config.server', 'an API gives the rows in the server mode', 'set config.server to true');
  }

  [...fields.values()].forEach((field, index) => {
    if (!field.source) {
      issues.error(`fields[${index}].source`, 'with an API every field needs the path of its value in an item of the answer', `the field ${field.name} takes the path of its value in an item, as ${field.name} or meta.${field.name}`);
    }
  });
}

/**
 * The parameters of the queries of an API that gives pages: it searches, sorts and filters itself, so every filter of
 * the table needs its query parameter. An API that gives all its rows at once takes none: the page answers from them.
 */
function checkApiQuery(api: Record<string, unknown>, filters: unknown, issues: BroSpecIssues): void {
  const parameter = (item: unknown) => typeof item === 'string' && /^[\w.$[\]-]+$/.test(item);
  const {search, sort, filters: parameters} = api;

  if (api['paging'] === undefined) {
    for (const name of ['search', 'sort', 'filters'].filter(key => api[key] !== undefined)) {
      issues.error(`api.${name}`, 'only an API that gives pages takes the parameters of the queries: the page answers from all the rows of another API', `remove api.${name}, or give the pages of the API in api.paging`);
    }

    return;
  }

  if (search !== undefined && !parameter(search)) {
    issues.error('api.search', 'expected the query parameter of the text search', 'as search');
  }

  if (sort !== undefined && (!isObject(sort) || !parameter(sort['field']) || (sort['order'] !== undefined && !parameter(sort['order'])))) {
    issues.error('api.sort', 'expected the query parameters of the sort: field, and order unless a minus before the field sorts down', 'as {"field": "ordering"}');
  }

  if (parameters !== undefined && (!isObject(parameters) || !Object.values(parameters).every(parameter))) {
    issues.error('api.filters', 'expected the query parameter of every key of the filters', 'as {"newsSite": "news_site"}');

    return;
  }

  const keys = (Array.isArray(filters) ? filters : []).filter(isObject)
    .flatMap(filter => (filter['control'] === 'range') ? [`${filter['name']}From`, `${filter['name']}To`] : [`${filter['name']}`]);

  for (const key of keys.filter(item => !(parameters && item in parameters))) {
    issues.error(`api.filters.${key}`, 'the API filters the rows itself: every filter needs its query parameter', 'or leave the filter out');
  }

  for (const key of Object.keys(parameters ?? {}).filter(item => !keys.includes(item))) {
    issues.error(`api.filters.${key}`, 'expected a key of the filters', keys.length ? `one of ${keys.join(', ')}` : 'the table has no filters');
  }
}

function checkCells(value: unknown, fields: Map<string, BroSpecField>, issues: BroSpecIssues): Map<string, BroSpecCell> {
  const cells = new Map<string, BroSpecCell>();

  if (value === undefined) {
    return cells;
  }

  if (!Array.isArray(value)) {
    issues.error('cells', 'expected an array of cells');

    return cells;
  }

  value.forEach((cell: unknown, index: number) => {
    const path = `cells[${index}]`;

    if (!isObject(cell)) {
      issues.error(path, 'expected an object');

      return;
    }

    checkKeys(cell, ['name', 'kind', 'shows', 'fields', 'actions'], path, issues);

    const name = cell['name'];

    if (typeof name !== 'string' || !kebabCase.test(name)) {
      issues.error(`${path}.name`, 'expected a name in kebab-case', 'as status or order-actions');
    } else if (cells.has(name)) {
      issues.error(`${path}.name`, `the cell ${name} is already declared`, 'every cell has a name of its own');
    } else {
      cells.set(name, <BroSpecCell><unknown>cell);
    }

    if (cell['kind'] !== undefined && cell['kind'] !== 'cell' && cell['kind'] !== 'details') {
      issues.error(`${path}.kind`, 'expected cell or details');
    }

    if (typeof cell['shows'] !== 'string' || !cell['shows'].trim()) {
      issues.error(`${path}.shows`, 'expected what the cell shows, in words');
    }

    if (!isStringArray(cell['fields'])) {
      issues.error(`${path}.fields`, 'expected an array of the fields of the row the cell reads');
    } else {
      cell['fields'].forEach((field: string, fieldIndex: number) => checkFieldName(field, `${path}.fields[${fieldIndex}]`, fields, issues));
    }

    if (cell['actions'] !== undefined) {
      checkActions(cell['actions'], `${path}.actions`, issues);
    }
  });

  return cells;
}

function checkCols(value: unknown, fields: Map<string, BroSpecField>, cells: Map<string, BroSpecCell>, config: Record<string, unknown>, issues: BroSpecIssues): void {
  if (!Array.isArray(value) || !value.length) {
    issues.error('cols', 'expected a non-empty array of columns');

    return;
  }

  // The plain columns by their title and field: two of one title and one field show the same thing twice
  const plain = new Map<string, number>();

  value.forEach((col: unknown, index: number) => {
    const path = `cols[${index}]`;

    if (!isObject(col)) {
      issues.error(path, 'expected an object');

      return;
    }

    checkKeys(col, ['title', 'name', 'shortTitle', 'tooltip', 'dataType', 'sortKey', 'component'], path, issues, colElsewhere);

    if (typeof col['title'] !== 'string') {
      issues.error(`${path}.title`, 'expected a string; an empty one for a column without a title');
    }

    for (const key of ['shortTitle', 'tooltip']) {
      if (col[key] !== undefined && (typeof col[key] !== 'string' || !col[key])) {
        issues.error(`${path}.${key}`, 'expected a non-empty string');
      }
    }

    const field = (typeof col['name'] === 'string') ? fields.get(col['name']) : undefined;

    if (col['name'] !== undefined) {
      checkFieldName(col['name'], `${path}.name`, fields, issues);
    }

    if (col['sortKey'] !== undefined) {
      checkFieldName(col['sortKey'], `${path}.sortKey`, fields, issues);
    }

    if (col['dataType'] !== undefined) {
      if (!['string', 'number', 'boolean'].includes(<string>col['dataType'])) {
        issues.error(`${path}.dataType`, 'expected string, number or boolean', 'a date or an amount of money is a string field with the text as the cell shows it, as "Sep 1, 2026" or "$15", and a number field for the sort in sortKey of the column');
      } else if (field && field.type !== col['dataType'] && field.type !== 'string[]') {
        issues.warning(`${path}.dataType`, `the field ${field.name} is of the type ${field.type}`, 'leave dataType out: the generator takes it from the field');
      }
    }

    if (col['component'] === undefined) {
      if (col['name'] === undefined) {
        issues.error(path, 'the column shows nothing', 'give the field in name or a cell in component');
      } else if (typeof col['title'] === 'string' && typeof col['name'] === 'string') {
        const key = JSON.stringify([col['title'], col['name']]);

        if (plain.has(key)) {
          issues.warning(path, `the column shows the field ${col['name']} under the title "${col['title']}" as cols[${plain.get(key)}] does`, 'remove one of them, or give it another title, or a component of its own if it is meant to show the field otherwise');
        } else {
          plain.set(key, index);
        }
      }

      return;
    }

    checkColComponent(col['component'], `${path}.component`, field, cells, config, issues);
  });
}

function checkColComponent(component: unknown, path: string, field: BroSpecField | undefined, cells: Map<string, BroSpecCell>, config: Record<string, unknown>, issues: BroSpecIssues): void {
  if (!isObject(component)) {
    issues.error(path, 'expected {"cell": "<name>"} or {"element": "tags" | "switch" | "details-button"}');

    return;
  }

  checkKeys(component, ['cell', 'element'], path, issues, componentElsewhere);

  if ((component['cell'] === undefined) === (component['element'] === undefined)) {
    issues.error(path, 'expected either cell or element');

    return;
  }

  if (component['cell'] !== undefined) {
    const cell = (typeof component['cell'] === 'string') ? cells.get(component['cell']) : undefined;

    if (!cell) {
      issues.error(`${path}.cell`, `no cell ${component['cell']} in cells`, suggestion(component['cell'], [...cells.keys()]));
    } else if (cell.kind === 'details') {
      issues.error(`${path}.cell`, `the cell ${cell.name} is of the kind details`, 'name it in config.rowDetailsComponent');
    }

    return;
  }

  const element = component['element'];

  if (element === 'tags' && field?.type !== 'string[]') {
    issues.error(`${path}.element`, 'the tags show a field of the type string[]', 'name such a field in the name of the column');
  } else if (element === 'switch' && field?.type !== 'boolean') {
    issues.error(`${path}.element`, 'the switch shows a field of the type boolean', 'name such a field in the name of the column');
  } else if (element === 'details-button') {
    if (config['rowDetailsComponent'] === undefined) {
      issues.error(`${path}.element`, 'the details button opens the row details', 'name the details cell in config.rowDetailsComponent');
    }
  } else if (element !== 'tags' && element !== 'switch') {
    issues.error(`${path}.element`, 'expected tags, switch or details-button', suggestion(element, ['tags', 'switch', 'details-button']));
  }
}

function checkFilters(value: unknown, fields: Map<string, BroSpecField>, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!Array.isArray(value)) {
    issues.error('filters', 'expected an array of filters');

    return;
  }

  // The keys of the filters in the object of the filters: a range takes two
  const keys = new Set<string>();
  const names = new Set<string>();

  value.forEach((filter: unknown, index: number) => {
    const path = `filters[${index}]`;

    if (!isObject(filter)) {
      issues.error(path, 'expected an object');

      return;
    }

    checkKeys(filter, ['name', 'label', 'control', 'field', 'match', 'rule'], path, issues);

    const {name, control, match} = <Partial<BroSpecFilter>>filter;

    if (typeof name !== 'string' || !specIdentifier.test(name)) {
      issues.error(`${path}.name`, 'expected an identifier', 'as customer');
    } else if (reservedFilterNames.includes(name)) {
      issues.error(`${path}.name`, `the table uses the filter ${name} itself`, 'choose another name');
    } else {
      // The name is the name of the control of the form, so two filters of different controls cannot share it
      if (names.has(name)) {
        issues.error(`${path}.name`, `the filter ${name} is already declared`, 'every filter has a name of its own');
      }

      names.add(name);

      for (const key of (control === 'range') ? [`${name}From`, `${name}To`] : [name]) {
        if (keys.has(key)) {
          issues.error(`${path}.name`, `the key ${key} of the filters is already taken`, 'give the filter another name: a range filter takes the keys <name>From and <name>To');
        }

        keys.add(key);
      }
    }

    if (typeof filter['label'] !== 'string' || !filter['label'].trim()) {
      issues.error(`${path}.label`, 'expected a non-empty string');
    }

    if (!['text', 'select', 'range', 'checkbox'].includes(<string>control)) {
      issues.error(`${path}.control`, 'expected text, select, range or checkbox', suggestion(control, ['text', 'select', 'range', 'checkbox']));

      return;
    }

    if (match !== undefined && !['contains', 'startsWith', 'eq', 'custom'].includes(match)) {
      issues.error(`${path}.match`, 'expected contains, startsWith, eq or custom');

      return;
    }

    if (match === 'custom') {
      if (typeof filter['rule'] !== 'string' || !filter['rule'].trim()) {
        issues.error(`${path}.rule`, 'a custom match needs its rule in words', 'as "the due date is before today and the status is not paid"');
      }

      if (filter['field'] !== undefined) {
        checkFieldName(filter['field'], `${path}.field`, fields, issues);
      }

      return;
    }

    if (filter['rule'] !== undefined) {
      issues.error(`${path}.rule`, 'a rule is for the match custom', 'remove rule, or set match to custom');
    }

    if (filter['field'] === undefined) {
      issues.error(`${path}.field`, 'expected the field of the row the filter compares');

      return;
    }

    const field = checkFieldName(filter['field'], `${path}.field`, fields, issues);

    if (field) {
      checkFilterControl(<BroSpecFilter><unknown>filter, field, path, issues);
    }
  });
}

/** The control and the match of a filter fit the type of its field. */
function checkFilterControl(filter: BroSpecFilter, field: BroSpecField, path: string, issues: BroSpecIssues): void {
  const {control, match} = filter;

  if (control === 'text') {
    if (field.type !== 'string') {
      issues.error(`${path}.control`, `a text filter compares a string field, ${field.name} is of the type ${field.type}`, filterFix(field));
    } else if (match !== undefined && match !== 'contains' && match !== 'startsWith') {
      issues.error(`${path}.match`, 'a text filter matches with contains or startsWith', 'use contains or startsWith');
    }
  } else if (control === 'select') {
    if (field.type !== 'string' && field.type !== 'string[]') {
      issues.error(`${path}.control`, `a select filter compares a string field, ${field.name} is of the type ${field.type}`, filterFix(field));
    } else if (!field.values) {
      issues.error(`${path}.control`, `a select filter offers the values of its field, ${field.name} has none`, `list them in values of the field ${field.name}`);
    } else if (match !== undefined && match !== 'eq') {
      issues.error(`${path}.match`, 'a select filter matches with eq', 'use eq');
    }
  } else if (control === 'range') {
    if (field.type !== 'number') {
      issues.error(`${path}.control`, `a range filter compares a number field, ${field.name} is of the type ${field.type}`, filterFix(field));
    } else if (match !== undefined) {
      issues.error(`${path}.match`, 'a range filter compares with gte and lte itself', 'leave match out');
    }
  } else if (field.type !== 'boolean') {
    issues.error(`${path}.control`, `a checkbox filter compares a boolean field, ${field.name} is of the type ${field.type}`, filterFix(field));
  } else if (match !== undefined && match !== 'eq') {
    issues.error(`${path}.match`, 'a checkbox filter matches with eq', 'use eq');
  }
}

function filterFix(field: BroSpecField): string {
  const controls: Record<string, string> = {
    string: field.values ? 'select or text' : 'text',
    'string[]': field.values ? 'select' : 'a custom match',
    number: 'range',
    boolean: 'checkbox'
  };

  return `use ${controls[field.type]} for ${field.name}`;
}

function checkConfig(value: unknown, cells: Map<string, BroSpecCell>, options: BroValidateOptions, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('config', 'expected an object');

    return;
  }

  const extensionChecks: Record<string, (value: unknown, path: string, issues: BroSpecIssues, config: Record<string, unknown>) => void> = Object.assign({}, ...(options.extensions ?? []).map(extension => extension.config ?? {}));
  const known = ['toolbarTitle', 'pageSize', 'server', 'rowCounter', 'shadowsEnabled', 'theme', 'rowDetailsComponent', 'rowDetailsServer', 'rowDetailsMotion'];

  for (const key of Object.keys(value)) {
    if (extensionChecks[key]) {
      extensionChecks[key](value[key], `config.${key}`, issues, value);
    } else if (paidConfig[key]) {
      issues.error(`config.${key}`, `${key} belongs to the paid module ${paidConfig[key]}, which this server does not load; without it the table shows the fail state`, `install ${paidConfig[key]} and start the server with --extension ${paidConfig[key]}, or use ordinary row details, rowDetailsComponent`);
    }
  }

  checkKeys(value, [...known, ...Object.keys(extensionChecks), ...Object.keys(paidConfig)], 'config', issues, configElsewhere);

  if (value['toolbarTitle'] !== undefined && typeof value['toolbarTitle'] !== 'string') {
    issues.error('config.toolbarTitle', 'expected a string');
  }

  if (value['pageSize'] !== undefined && (!Number.isInteger(value['pageSize']) || <number>value['pageSize'] < 1)) {
    issues.error('config.pageSize', 'expected the number of rows on a page, from 1');
  }

  for (const key of ['server', 'rowCounter', 'shadowsEnabled', 'rowDetailsServer']) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') {
      issues.error(`config.${key}`, 'expected true or false');
    }
  }

  if (value['theme'] !== undefined && !['light', 'dark', 'auto'].includes(<string>value['theme'])) {
    issues.error('config.theme', 'expected light, dark or auto');
  }

  if (value['rowDetailsMotion'] !== undefined && !['kinetic', 'eased'].includes(<string>value['rowDetailsMotion'])) {
    issues.error('config.rowDetailsMotion', 'expected kinetic or eased');
  }

  const details = value['rowDetailsComponent'];

  if (details !== undefined) {
    if (!isObject(details) || typeof details['cell'] !== 'string') {
      issues.error('config.rowDetailsComponent', 'expected {"cell": "<name of a cell of the kind details>"}');
    } else {
      checkKeys(details, ['cell'], 'config.rowDetailsComponent', issues);

      const cell = cells.get(details['cell']);

      if (!cell) {
        issues.error('config.rowDetailsComponent.cell', `no cell ${details['cell']} in cells`, suggestion(details['cell'], [...cells.keys()]));
      } else if (cell.kind !== 'details') {
        issues.error('config.rowDetailsComponent.cell', `the cell ${cell.name} is of the kind cell`, 'give it "kind": "details"');
      }
    }
  } else {
    for (const key of ['rowDetailsServer', 'rowDetailsMotion'].filter(item => value[item] !== undefined)) {
      issues.error(`config.${key}`, 'the row details are not declared', 'name the details cell in config.rowDetailsComponent');
    }
  }
}

/** A declared cell that no column and no config names is generated for nothing. */
function checkUnusedCells(spec: Record<string, unknown>, cells: Map<string, BroSpecCell>, issues: BroSpecIssues): void {
  if (!cells.size) {
    return;
  }

  const used = new Set<unknown>();

  if (Array.isArray(spec['cols'])) {
    spec['cols'].forEach((col: unknown) => isObject(col) && isObject(col['component']) && used.add(col['component']['cell']));
  }

  if (isObject(spec['config']) && isObject(spec['config']['rowDetailsComponent'])) {
    used.add(spec['config']['rowDetailsComponent']['cell']);
  }

  (<unknown[]>spec['cells']).forEach((cell: unknown, index: number) => {
    if (isObject(cell) && cells.get(<string>cell['name']) === <unknown>cell && !used.has(cell['name'])) {
      issues.warning(`cells[${index}]`, `no column and no config.rowDetailsComponent names the cell ${cell['name']}`, 'name it or remove it');
    }
  });
}

function checkToolbar(value: unknown, spec: Record<string, unknown>, options: BroValidateOptions, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('toolbar', 'expected an object');

    return;
  }

  checkKeys(value, ['buttons', 'menu'], 'toolbar', issues);

  const actions = new Set<string>();
  // The mat skin is checked when the project has it, and on the site, which has all skins
  const iconRequired = !options.skin || options.skin === 'mat';

  const checkButton = (button: unknown, path: string, icon: boolean) => {
    if (!isObject(button)) {
      issues.error(path, 'expected an object');

      return;
    }

    checkKeys(button, ['title', 'action', 'icon'], path, issues);

    if (typeof button['title'] !== 'string' || !button['title'].trim()) {
      issues.error(`${path}.title`, 'expected a non-empty string');
    } else if (button['title'].trim().toLowerCase() === 'filters' && Array.isArray(spec['filters']) && spec['filters'].length) {
      issues.warning(`${path}.title`, 'the generator adds the Filters button itself when the spec has filters', 'remove this button');
    }

    const action = button['action'];

    if (typeof action === 'string' && action.startsWith('bro-')) {
      issues.error(`${path}.action`, 'the actions that start with bro- belong to the table', 'as export');
    } else if (typeof action !== 'string' || !actionName.test(action)) {
      issues.error(`${path}.action`, 'expected an action name', 'as export');
    } else if (actions.has(action)) {
      issues.error(`${path}.action`, `the action ${action} is already taken in the toolbar`, 'give it an action of its own');
    } else {
      actions.add(action);
    }

    if (button['icon'] !== undefined && (typeof button['icon'] !== 'string' || !iconName.test(button['icon']))) {
      issues.error(`${path}.icon`, 'expected the name of a Material icon', 'as download');
    } else if (icon && button['icon'] === undefined) {
      issues.error(`${path}.icon`, 'a button of the toolbar of the mat skin is an icon with a tooltip', 'give the name of a Material icon, as download');
    }
  };

  if (value['buttons'] !== undefined) {
    if (!Array.isArray(value['buttons'])) {
      issues.error('toolbar.buttons', 'expected an array of buttons');
    } else {
      value['buttons'].forEach((button: unknown, index: number) => checkButton(button, `toolbar.buttons[${index}]`, iconRequired));
    }
  }

  const menu = value['menu'];

  if (menu !== undefined) {
    if (!isObject(menu)) {
      issues.error('toolbar.menu', 'expected {"title": "More", "items": [...]}');
    } else {
      checkKeys(menu, ['title', 'items'], 'toolbar.menu', issues);

      if (typeof menu['title'] !== 'string' || !menu['title'].trim()) {
        issues.error('toolbar.menu.title', 'expected a non-empty string');
      }

      if (!Array.isArray(menu['items']) || !menu['items'].length) {
        issues.error('toolbar.menu.items', 'expected a non-empty array of items');
      } else {
        menu['items'].forEach((item: unknown, index: number) => checkButton(item, `toolbar.menu.items[${index}]`, false));
      }
    }
  }

  // An action of a cell with the same name comes to the same handler of the page
  if (Array.isArray(spec['cells'])) {
    spec['cells'].forEach((cell: unknown, index: number) => {
      if (isObject(cell) && isStringArray(cell['actions'])) {
        cell['actions'].filter(action => actions.has(action)).forEach(action => {
          issues.warning(`cells[${index}].actions`, `the toolbar sends the action ${action} too`, 'give the actions different names');
        });
      }
    });
  }
}

function checkStateMessages(value: unknown, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('stateMessages', 'expected an object');

    return;
  }

  checkKeys(value, ['loading', 'no-data', 'not-found', 'fail'], 'stateMessages', issues);

  for (const [state, message] of Object.entries(value)) {
    if (typeof message !== 'string' || !message.trim()) {
      issues.error(`stateMessages${key(state)}`, 'expected a non-empty string');
    }
  }
}

function checkSkinConfig(value: unknown, options: BroValidateOptions, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('skinConfig', 'expected an object with the skins mat, bs or nv');

    return;
  }

  checkKeys(value, ['mat', 'bs', 'nv'], 'skinConfig', issues);

  for (const [skin, config] of Object.entries(value)) {
    const path = `skinConfig.${skin}`;

    if (!['mat', 'bs', 'nv'].includes(skin)) {
      continue;
    }

    if (options.skin && options.skin !== skin) {
      issues.warning(path, `the project has the skin ${options.skin}`, 'remove the settings of other skins');
    }

    if (!isObject(config)) {
      issues.error(path, 'expected an object with css, components or callbacks');

      continue;
    }

    checkKeys(config, ['css', 'components', 'callbacks'], path, issues);

    for (const part of <('css' | 'components')[]>['css', 'components']) {
      if (config[part] !== undefined) {
        checkShape(config[part], skinConfigShape[part], part, path, issues);
      }
    }

    // The elements of the mat skin are Angular components with their own templates: they read no classes of the config
    if (skin === 'mat' && isObject(config['components'])) {
      for (const [name, component] of Object.entries(config['components'])) {
        if (isObject(component) && component['css'] !== undefined) {
          issues.error(`${path}.components.${name}.css`, 'the elements of the mat skin are Angular components and read no classes of the config', 'remove css: the classes of the config are for the skins bs and nv');
        }
      }
    }

    if (config['callbacks'] !== undefined) {
      checkCallbacks(config['callbacks'], <BroSpecSkin>skin, `${path}.callbacks`, issues);
    }
  }
}

/**
 * A value of the skin config fits the types of Table, Bro.
 *
 * @param value - the value of the spec at the path
 * @param shape - the type that Table, Bro gives the value
 * @param configPath - the path in the config of the table, as components.paginator
 * @param base - the path of the skin in the spec, as skinConfig.bs
 * @param issues - the issues of the spec, which take a value that does not fit
 */
function checkShape(value: unknown, shape: BroSkinConfigShape, configPath: string, base: string, issues: BroSpecIssues): void {
  const path = `${base}.${configPath}`;

  if (shape === 'string' || shape === 'boolean') {
    if (typeof value !== shape) {
      issues.error(path, `expected a ${shape}`);
    }

    return;
  }

  if (shape === 'state') {
    if (!isStringArray(value) || value.length !== 2) {
      issues.error(path, 'expected the icon and the message of the state: ["<icon>", "<message>"]');
    }

    return;
  }

  if (!isObject(value)) {
    issues.error(path, 'expected an object');

    return;
  }

  for (const [name, item] of Object.entries(value)) {
    const itemPath = `${configPath}.${name}`;

    if (shape[name]) {
      checkShape(item, shape[name], itemPath, base, issues);

      // An own element in place of an element of the skin
      if (name === 'selector' && configPath.startsWith('components.') && configPath.split('.').length === 2) {
        const contract = skinElementContracts[configPath.split('.')[1]];

        issues.warning(`${base}.${itemPath}`, `the application defines the element ${item}${contract ? `, and it follows ${contract} of Table, Bro` : ''}`, 'the generator does not write it');
      }
    } else if (skinCallbacks.some(callback => callback.path === itemPath) || skinCallbacksElsewhere[itemPath]) {
      issues.error(`${base}.${itemPath}`, 'a function', `give it in callbacks of the skin: {"path": "${itemPath}", "does": "<what it does>"}`);
    } else if (skinConfigElsewhere[itemPath]) {
      issues.error(`${base}.${itemPath}`, skinConfigElsewhere[itemPath], 'remove it from skinConfig');
    } else {
      issues.error(`${base}.${itemPath}`, `Table, Bro has no ${itemPath}`, suggestion(name, Object.keys(shape)));
    }
  }
}

function checkCallbacks(value: unknown, skin: BroSpecSkin, path: string, issues: BroSpecIssues): void {
  if (!Array.isArray(value)) {
    issues.error(path, 'expected an array of {"path": "<path of the function>", "does": "<what it does>"}');

    return;
  }

  const paths = new Set<unknown>();

  value.forEach((callback: unknown, index: number) => {
    const callbackPath = `${path}[${index}]`;

    if (!isObject(callback)) {
      issues.error(callbackPath, 'expected an object');

      return;
    }

    checkKeys(callback, ['path', 'does'], callbackPath, issues);

    const name = callback['path'];
    const known = skinCallbacks.find(item => item.path === name);

    if (typeof name === 'string' && skinCallbacksElsewhere[name]) {
      issues.error(`${callbackPath}.path`, skinCallbacksElsewhere[name], 'remove it from the spec: the application sets it in the config of the skin it registers');
    } else if (!known) {
      issues.error(`${callbackPath}.path`, `Table, Bro has no function ${name}`, suggestion(name, skinCallbacks.map(item => item.path)));
    } else if (!known.skins.includes(skin)) {
      issues.error(`${callbackPath}.path`, `the ${skin} skin does not call ${name}: its elements are Angular components with their own templates`, `remove it: only ${known.skins.join(' and ')} call it`);
    } else if (paths.has(name)) {
      issues.error(`${callbackPath}.path`, `the function ${name} is already given`, 'keep one');
    } else {
      paths.add(name);
    }

    if (typeof callback['does'] !== 'string' || !callback['does'].trim()) {
      issues.error(`${callbackPath}.does`, 'expected what the function does, in words');
    }
  });
}

function checkCssVars(value: unknown, hasFilters: boolean, issues: BroSpecIssues): void {
  if (value === undefined) {
    return;
  }

  if (!isObject(value)) {
    issues.error('cssVars', 'expected an object, as {"--bro-row-height": "64px"}');

    return;
  }

  for (const [name, cssValue] of Object.entries(value)) {
    const path = `cssVars${key(name)}`;
    const variable = cssVariables.find(item => item.name === name);

    if (excludedCssVariables[name]) {
      issues.error(path, `the spec may not set ${name}: ${excludedCssVariables[name]}`, 'remove it');
    } else if (!variable) {
      issues.error(path, name.startsWith('--bro-') ? `Table, Bro has no variable ${name}; other sizes, fonts and colors need changes of SCSS, which the first version does not make` : 'the spec sets only the --bro-* variables of Table, Bro', suggestion(name, cssVariables.map(item => item.name)));
    } else if (typeof cssValue !== 'string') {
      issues.error(path, 'expected a string');
    } else {
      const problem = checkCssValue(variable, cssValue);

      if (problem) {
        issues.error(path, problem);
      } else if (variable.target === 'drawer' && !hasFilters) {
        issues.warning(path, 'the spec has no filters, so no filter drawer reads it', 'remove it');
      }
    }
  }
}

function checkRows(value: unknown, fields: Map<string, BroSpecField>, options: BroValidateOptions, issues: BroSpecIssues): void {
  if (value === undefined) {
    if (options.rowsRequired) {
      issues.error('rows', 'expected the rows of the spec');
    }

    return;
  }

  if (!Array.isArray(value) || (options.rowsRequired && !value.length)) {
    issues.error('rows', 'expected a non-empty array of rows');

    return;
  }

  value.forEach((row: unknown, index: number) => {
    const path = `rows[${index}]`;

    if (!isObject(row)) {
      issues.error(path, 'expected an object');

      return;
    }

    for (const [name, cell] of Object.entries(row)) {
      const field = fields.get(name);

      if (!field) {
        issues.error(`${path}${key(name)}`, `no field ${name} in fields`, suggestion(name, [...fields.keys()]));
      } else if (cell !== null) {
        checkRowValue(cell, field, `${path}${key(name)}`, options, issues);
      }
    }
  });
}

function checkRowValue(value: unknown, field: BroSpecField, path: string, options: BroValidateOptions, issues: BroSpecIssues): void {
  const strings: string[] = [];

  if (field.type === 'string[]') {
    if (!isStringArray(value)) {
      issues.error(path, 'expected an array of strings');

      return;
    }

    strings.push(...value);
  } else if (field.type === 'number' ? (typeof value !== 'number' || !Number.isFinite(value)) : typeof value !== field.type) {
    issues.error(path, `expected a ${field.type}`);

    return;
  } else if (field.type === 'string') {
    strings.push(<string>value);
  }

  for (const item of strings) {
    if (field.values && !field.values.includes(item)) {
      issues.error(path, `${JSON.stringify(item)} is not among the values of the field ${field.name}`, suggestion(item, field.values));
    }

    if (options.limits?.valueLength && item.length > options.limits.valueLength) {
      issues.error(path, `the value is longer than ${options.limits.valueLength} characters`, `shorten it to ${options.limits.valueLength} characters`);
    }
  }
}

function checkLimits(spec: Record<string, unknown>, limits: BroSpecLimits | undefined, issues: BroSpecIssues): void {
  for (const part of <(keyof BroSpecLimits)[]>['cols', 'rows', 'cells', 'filters']) {
    const limit = limits?.[part];
    const value = spec[part];

    if (limit && Array.isArray(value) && value.length > limit) {
      issues.error(part, `more than ${limit} ${part}`, `keep at most ${limit}`);
    }
  }
}

/** A field named by a column, a cell or a filter is a field of the row. */
function checkFieldName(name: unknown, path: string, fields: Map<string, BroSpecField>, issues: BroSpecIssues): BroSpecField | undefined {
  const field = (typeof name === 'string') ? fields.get(name) : undefined;

  if (!field) {
    issues.error(path, `no field ${name} in fields`, suggestion(name, [...fields.keys()]));
  }

  return field;
}

function checkActions(value: unknown, path: string, issues: BroSpecIssues): void {
  if (!isStringArray(value)) {
    issues.error(path, 'expected an array of action names');

    return;
  }

  value.forEach((action: string, index: number) => {
    // An own cell may open the row details with the action of the details button
    if (action.startsWith('bro-') && action !== 'bro-details-toggle') {
      issues.error(`${path}[${index}]`, 'the actions that start with bro- belong to the table', 'name it without bro-, as edit or delete');
    } else if (!actionName.test(action)) {
      issues.error(`${path}[${index}]`, 'expected an action name', 'as edit or delete');
    } else if (value.indexOf(action) !== index) {
      issues.error(`${path}[${index}]`, `the action ${action} repeats`, 'keep one');
    }
  });
}

/** Reports the unknown keys of an object, with the nearest known name or the reason why the spec leaves them out. */
function checkKeys(object: Record<string, unknown>, known: string[], path: string, issues: BroSpecIssues, elsewhere: Record<string, [string, string?]> = {}): void {
  for (const name of Object.keys(object)) {
    if (known.includes(name)) {
      continue;
    }

    const itemPath = path ? `${path}${key(name)}` : name;

    if (elsewhere[name]) {
      issues.error(itemPath, elsewhere[name][0], elsewhere[name][1]);
    } else {
      issues.error(itemPath, `unknown field ${name}`, suggestion(name, known));
    }
  }
}

/**
 * The nearest name as a fix: a typo of a model or a developer by the edit distance, or the full word of a short name,
 * as columns of cols.
 */
function suggestion(name: unknown, candidates: string[]): string | undefined {
  if (typeof name !== 'string' || !candidates.length) {
    return candidates.length ? `expected one of ${candidates.join(', ')}` : undefined;
  }

  // A name longer than any name of a spec gets no nearest name: the distance of two long texts takes a long time
  if (name.length > maxSuggestedName) {
    return (candidates.length <= 12) ? `expected one of ${candidates.join(', ')}` : undefined;
  }

  const typed = name.toLowerCase();
  let best: string | undefined;
  let bestDistance = Infinity;

  for (const candidate of candidates) {
    const word = candidate.toLowerCase();
    const limit = Math.max(2, Math.floor(word.length / 3));
    // The distance is at least the difference of the lengths, and a short name of a word is that far from it
    const difference = Math.abs(typed.length - word.length);
    const distance = (difference <= limit) ? editDistance(typed, word) : difference;
    const near = distance <= limit || shortens(word, typed);

    if (near && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  if (best !== undefined) {
    return `did you mean ${best}?`;
  }

  return (candidates.length <= 12) ? `expected one of ${candidates.join(', ')}` : undefined;
}

/** A short name of a word: its first three letters, then the rest of its letters in their order, as cols of columns. */
function shortens(short: string, word: string): boolean {
  if (short.length >= word.length || !word.startsWith(short.slice(0, 3))) {
    return false;
  }

  let index = 0;

  for (const letter of word) {
    if (letter === short[index]) {
      index++;
    }
  }

  return index === short.length;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({length: b.length + 1}, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }

    previous = current;
  }

  return previous[b.length];
}

/** A key in a path: .name for an identifier, ['no-data'] for others. */
function key(name: string): string {
  return specIdentifier.test(name) ? `.${name}` : `['${name}']`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/** The report of the issues: the first ones of each kind, so a spec of thousands of errors gives a short answer. */
function report(issues: BroSpecIssues): BroSpecReport {
  const result: BroSpecReport = {valid: !issues.errors.length, errors: issues.errors.slice(0, maxReported), warnings: issues.warnings.slice(0, maxReported)};
  const errors = issues.errors.length - result.errors.length;
  const warnings = issues.warnings.length - result.warnings.length;

  if (errors || warnings) {
    result.omitted = {...(errors ? {errors} : {}), ...(warnings ? {warnings} : {})};
  }

  return result;
}

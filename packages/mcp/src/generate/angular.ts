import type {BroMcpExtension}                                    from '../extension.js';
import {cssVariables}                                            from '../spec/css-variables.js';
import type {BroSpecSkin, BroTableSpec}                          from '../spec/spec.js';
import {type BroCellCode, byColumns, cellCode}                   from './cells.js';
import {imports, importsField, indentBlock, literal, quote, raw} from './code.js';
import {configCode}                                              from './config.js';
import type {BroSpecFillings}                                    from './fillings.js';
import {BroFiltersCode}                                          from './filters.js';
import {BroNames}                                                from './names.js';
import {cssVarsRule, rowTypeCode}                                from './rows.js';
import {type BroServerSource, serviceCode}                       from './service.js';

export interface BroGeneratedFile {
  /** The path from the folder where the table goes, as order-table/order.ts. */
  path: string;
  content: string;
  /** What the file holds, in a line: the code view and the agent show it before the file. */
  description?: string;
}

export interface BroTableFiles {
  files: BroGeneratedFile[];
  todo: string[];
}

/**
 * The table for an Angular project: the type of the row, the page component with <table-bro-ng> and its cols, rows and
 * config, the cells, the filters. The files go in the order a reader needs them.
 */
export function angularTable(spec: BroTableSpec, skin: BroSpecSkin, fillings: BroSpecFillings, tagSuffix: string = '', extensions: BroMcpExtension[] = [], simulateServer: boolean = false): BroTableFiles {
  const names = BroNames.of(spec, tagSuffix);
  const folder = names.folder;
  const config = spec.config ?? {};
  const server = Boolean(config.server);
  const filters = new BroFiltersCode(spec, fillings);
  const hasFilters = filters.filters.length > 0;
  const specRows = Boolean(spec.rows?.length) && !server;
  // The page and the server row details load from the simulated server, or from the API of the spec
  const simulated = server && (simulateServer || Boolean(spec.api));
  const source: BroServerSource | undefined = !server ? undefined : spec.api ? (spec.api.paging ? 'api-pages' : 'api') : simulated ? 'simulated' : 'project';
  const cells = (spec.cells ?? []).map(cell => cellCode(spec, cell, 'angular', fillings.cells?.[cell.name]?.[skin], tagSuffix, simulated));

  const files: BroGeneratedFile[] = [];
  const todo: string[] = [];

  for (const cell of byColumns(spec, cells)) {
    files.push({path: `${folder}/${cell.file}.ts`, content: cell.content, description: cellDescription(cell)});

    if (!cell.filled) {
      todo.push(`${folder}/${cell.file}.ts: write the template of the ${cell.cell.kind === 'details' ? 'row details' : 'cell'}: ${cell.cell.shows}`);
    }
  }

  const conf = configCode(spec, skin, fillings, '    ', tagSuffix, extensions);
  const cssVars = Object.entries(spec.cssVars ?? {});

  // The filters matter little to a reader: their component comes after the cells
  if (hasFilters) {
    files.push({path: `${folder}/${names.filtersFile}.ts`, content: filters.angularComponent(skin), description: 'the filters of the drawer: their form, which gives the table its filter.'});
  }

  // The changes of the styles close the code: the CSS variables that the table overrides
  if (cssVars.length) {
    const tableVars = cssVars.filter(([name]) => cssVariables.find(item => item.name === name)?.target !== 'drawer');
    // The container of the drawer reads its own variables
    const drawerVars = hasFilters ? cssVars.filter(([name]) => cssVariables.find(item => item.name === name)?.target !== 'table') : [];
    const rules = [
      ...(tableVars.length ? [cssVarsRule(names.tableId, tableVars)] : []),
      ...(drawerVars.length ? [cssVarsRule(names.drawerId, drawerVars)] : [])
    ];

    files.push({
      path: `${folder}/${names.kebab}-table.css`,
      content: `/* The CSS variables of the table: global styles, as the table and its drawer read them on their own elements */\n${rules.join('\n\n')}\n`,
      description: 'the changes of the styles: the CSS variables of the table that override the ones of its skin.'
    });
    todo.push(`Add ${folder}/${names.kebab}-table.css to "styles" of angular.json, or import it into the global styles of the application`);
  }

  if (!specRows && !server) {
    todo.push(`${folder}/${names.pageFile}.ts: load the rows and set them with this.rows.set(rows)`);
  }

  if (source === 'simulated') {
    todo.push(`${folder}/${names.serviceFile}.ts: replace the simulated server of loadPage with a request to your API, and map its parameters and its answer`);
  } else if (source === 'project') {
    todo.push(`${folder}/${names.serviceFile}.ts: the address of your API in loadPage, and the map of the query of the table to its parameters and of its answer to the rows with their total`);
  }

  // The model, the page with the cols, the rows and the config, and the service of a server table come first
  files.unshift(
    {path: `${folder}/${names.kebab}.ts`, content: rowTypeCode(spec), description: modelDescription(hasFilters)},
    {
      path: `${folder}/${names.pageFile}.ts`,
      content: pageCode(spec, skin, cells, filters, conf, specRows, tagSuffix, source),
      description: `the page of the table. Here are its columns, \`cols\`, its rows, \`rows\`, and its config, \`conf\`${server ? ', with the loading of its pages' : ''}.`
    },
    ...(source
      ? [{
          path: `${folder}/${names.serviceFile}.ts`,
          content: serviceCode(spec, source, hasFilters ? filters : undefined),
          description: 'the service of the table: it sends the request of a query of the table to the API, and turns its answer into the rows of a page.'
        }]
      : [])
  );

  return {files, todo};
}

function pageCode(spec: BroTableSpec, skin: BroSpecSkin, cells: BroCellCode[], filters: BroFiltersCode, conf: ReturnType<typeof configCode>, specRows: boolean, tagSuffix: string, source?: BroServerSource): string {
  const names = BroNames.of(spec, tagSuffix);
  const config = spec.config ?? {};
  const server = Boolean(config.server);
  const hasFilters = filters.filters.length > 0;
  const material = (skin === 'mat');
  const angularCells = cells.filter(cell => cell.angular);
  const actions = [
    ...(spec.cells ?? []).filter(cell => cell.kind !== 'details').flatMap(cell => cell.actions ?? []),
    ...(spec.toolbar?.buttons ?? []).map(button => button.action),
    ...(spec.toolbar?.menu?.items ?? []).map(item => item.action)
  ];

  const detailsButton = spec.cols.some(col => col.component && 'element' in col.component && col.component.element === 'details-button');

  // The service of a server table sends its requests and maps them: the page delivers the rows to the table
  const row = spec.rowType;

  const angularModules: Record<string, string[]> = {
    '@angular/core': ['ChangeDetectionStrategy', 'Component', 'signal', ...((angularCells.length || server) ? ['inject'] : []), ...(angularCells.length ? ['Injector'] : []), ...((hasFilters && !material) ? ['CUSTOM_ELEMENTS_SCHEMA'] : [])],
    '@angular/elements': angularCells.length ? ['createCustomElement'] : []
  };
  const tableBroModules: Record<string, string[]> = {
    ...conf.imports,
    '@table-bro/core': [...conf.imports['@table-bro/core'], 'type BroCol', ...(actions.length ? ['type BroActionDetail'] : []), ...(server ? ['type BroEmptyState', 'type BroQuery'] : []), ...((hasFilters && !material) ? ['defineTableBroFilterDrawerContainer'] : []), ...(detailsButton ? ['events'] : [])],
    '@table-bro/angular': [...(server ? ['type BroServerContainer', 'type BroServerPage'] : ['type BroContainer']), ...((hasFilters && material) ? [] : ['TableBroNg'])],
    '@table-bro/angular-material': [...(conf.imports['@table-bro/angular-material'] ?? []), ...((hasFilters && material) ? ['TableBroFilterDrawerContainerNg'] : [])]
  };
  const localModules: Record<string, string[]> = {
    [`./${names.kebab}`]: [`type ${spec.rowType}`, ...(hasFilters ? [`type ${names.filtersType}`] : [])],
    ...(source ? {[`./${names.serviceFile}`]: [names.serviceClass]} : {}),
    ...Object.fromEntries(cells.map(cell => [`./${cell.file}`, [cell.className]])),
    ...(hasFilters ? {[`./${names.filtersFile}`]: [names.filtersClass]} : {})
  };

  const componentImports: Record<string, string[]> = {
    ...((hasFilters && material) ? {'@table-bro/angular-material': ['TableBroFilterDrawerContainerNg']} : {'@table-bro/angular': ['TableBroNg']}),
    ...(hasFilters ? {[`./${names.filtersFile}`]: [names.filtersClass]} : {})
  };

  const shadows = (config.shadowsEnabled !== false);
  const inputs = [
    '[cols]="cols()" [rows]="rows()" [conf]="conf()"',
    ...(server ? ['[total]="total()" [rowsToAppend]="rowsToAppend()" [failed]="failed()" [emptyState]="emptyState()"'] : []),
    ...(hasFilters ? ['[filter]="filter()"'] : []),
    ...(server ? ['(query)="onQueryTable($event)"'] : []),
    ...(actions.length ? ['(action)="onTableAction($event)"'] : [])
  ];
  const element = (tag: string, attributes: string) => {
    const head = `<${tag} ${attributes}`;
    const pad = ' '.repeat(tag.length + 2);

    return `${head}\n${inputs.map(line => pad + line).join('\n')}>`;
  };

  const tableNg = element('table-bro-ng', `${(shadows && !(hasFilters && material)) ? 'class="bro-table-shadow-container" ' : ''}tableId="${names.tableId}"`);

  let template: string;

  if (hasFilters && material) {
    template = `${element('table-bro-filter-drawer-container-ng', `id="${names.drawerId}" tableId="${names.tableId}"`)}\n  <${names.filtersSelector} (changeFilter)="filter.set($event)"></${names.filtersSelector}>\n</table-bro-filter-drawer-container-ng>`;
  } else if (hasFilters) {
    template = `<table-bro-filter-drawer-container id="${names.drawerId}" skin="${skin}">\n${indentBlock(`${tableNg}</table-bro-ng>`, '  ')}\n\n  <${names.filtersSelector} slot="filters" (changeFilter)="filter.set($event)"></${names.filtersSelector}>\n</table-bro-filter-drawer-container>`;
  } else {
    template = `${tableNg}</table-bro-ng>`;
  }

  const members: string[] = [
    `  cols = signal<BroCol<${spec.rowType}>[]>(${literal(colsValue(spec, skin, cells), '  ')});`,
    '',
    `  rows = signal<${spec.rowType}[] | undefined>(${specRows ? literal(spec.rows, '  ') : 'undefined'});`,
    '',
    `  conf = signal<BroConfig<${spec.rowType}>>(${conf.code.replace(/^ {4}/gm, '  ').replace(/\n {2}\}$/, '\n  }')});`
  ];

  if (server) {
    members.push('', '  total = signal<number>(0);', `  rowsToAppend = signal<${spec.rowType}[] | undefined>(undefined);`, '  failed = signal<boolean>(false);', '  /** The state of an empty answer: no rows found for a query with a search or filters, else no data. */', '  emptyState = signal<BroEmptyState | undefined>(undefined);');
  }

  if (source) {
    members.push(
      '',
      `  private service = inject(${names.serviceClass});`,
      '  /** The filters and the sort of the rows the table has: another query starts from the first page. */',
      '  private loadedQuery: string = \'\';',
      '  /** The last query: an answer to an older one comes late and is left out. */',
      `  private lastQuery?: BroQuery<${row}>;`
    );
  }

  if (hasFilters) {
    members.push('', '  /** The filters of the drawer: the table takes them through its input filter. */', `  filter = signal<${names.filtersType} | undefined>(undefined);`);
  }

  if (angularCells.length) {
    members.push('', '  private injector = inject(Injector);');
  }

  const constructor: string[] = [];

  if (cells.length) {
    constructor.push('    this.defineCustomElements();');
  }

  if (hasFilters && !material) {
    constructor.push('    defineTableBroFilterDrawerContainer();');
  }

  if (!specRows && !server) {
    constructor.push('', '    // TODO: load the rows and set them with this.rows.set(rows)');
  }

  // The table asks for the next pages and for the first page of other filters; the page asks for its first page
  if (server) {
    constructor.push('', `    this.onQueryTable({page: 1, pageSize: ${config.pageSize ?? 5}});`);
  }

  // The page starts its table in initTable of BroContainer
  members.push(
    '',
    '  constructor() {',
    '    this.initTable();',
    '  }',
    '',
    '  initTable() {',
    ...(constructor.length ? constructor.filter((line, index) => line || index) : ['    // The table starts with the rows of the spec: nothing more to start']),
    '  }'
  );

  if (source) {
    members.push(
      '',
      `  onQueryTable(query: BroQuery<${row}>) {`,
      '    const queryKey: string = JSON.stringify([query.filter, query.sort]);',
      '',
      '    this.lastQuery = query;',
      '',
      `    this.service.loadPage(query).then(({rows, total}: BroServerPage<${row}>) => {`,
      '      if (query !== this.lastQuery) {',
      '        return;',
      '      }',
      '',
      '      // One batch for one delivery: the rows go with the total of the same answer',
      '      this.failed.set(false);',
      '      this.total.set(total);',
      '      this.emptyState.set(Object.values(query.filter ?? {}).some(value => value !== undefined && value !== null && value !== \'\') ? \'not-found\' : undefined);',
      '',
      '      // Other filters or another sort give the first page anew; the next pages of the same query add to it',
      '      if (queryKey !== this.loadedQuery) {',
      '        this.loadedQuery = queryKey;',
      '        this.rows.set(rows);',
      '      } else {',
      '        this.rowsToAppend.set(rows);',
      '      }',
      '    }, () => {',
      '      // A failed load shows the failure state of the table',
      '      if (query === this.lastQuery) {',
      '        this.failed.set(true);',
      '      }',
      '    });',
      '  }'
    );
  }

  if (actions.length) {
    members.push(
      '',
      `  onTableAction(event: BroActionDetail<${spec.rowType}>) {`,
      '    switch (event.action) {',
      ...[...new Set(actions)].flatMap(action => [`      case ${quote(action)}:`, `        // TODO: ${rowAction(spec, action) ? 'the row is event.data?.row' : 'the action of the toolbar'}`, '        break;']),
      '    }',
      '  }'
    );
  }

  if (cells.length) {
    members.push(
      '',
      '  /** The cells are Custom Elements: the table creates them by their tags, so they are defined before it. */',
      '  private defineCustomElements() {',
      `    if (customElements.get(${quote(cells[0].tag)})) {`,
      '      return;',
      '    }',
      '',
      ...cells.map(cell => cell.angular ? `    customElements.define(${quote(cell.tag)}, createCustomElement(${cell.className}, {injector: this.injector}));` : `    customElements.define(${quote(cell.tag)}, ${cell.className});`),
      '  }'
    );
  }

  return [
    imports({...angularModules, ...tableBroModules, ...localModules}),
    '',
    ...conf.preamble.flatMap(declaration => [declaration, '']),
    '@Component({',
    `  selector: '${names.pageSelector}',`,
    `  template: \`\n${indentBlock(template, '    ')}\`,`,
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    ...((hasFilters && !material) ? ['  // <table-bro-filter-drawer-container> is an element of table-bro', '  schemas: [CUSTOM_ELEMENTS_SCHEMA],'] : []),
    importsField(componentImports),
    '})',
    `export class ${names.pageClass} implements ${source ? `BroServerContainer<${row}>` : `BroContainer<${row}>`} {`,
    ...members,
    '}',
    ''
  ].join('\n');
}

/** The columns of the API: an own cell by its tag, a ready element by the tag of the skin. */
export function colsValue(spec: BroTableSpec, skin: BroSpecSkin, cells: BroCellCode[]): unknown[] {
  const fields = new Map(spec.fields.map(field => [field.name, field]));

  return spec.cols.map(col => {
    const field = col.name ? fields.get(col.name) : undefined;
    const dataType = col.dataType ?? ((field?.type === 'number' || field?.type === 'boolean') ? field.type : undefined);
    let component: unknown;

    if (col.component && 'cell' in col.component) {
      const name = col.component.cell;
      const cell = cells.find(item => item.cell.name === name)!;

      component = {selector: cell.tag, event: cell.cell.actions?.length ? 'action' : undefined};
    } else if (col.component) {
      component = elementComponent(col.component.element, skin, col.name);
    }

    // Numbers stand at the right edge of their column, as in the tables of Material
    const className = (dataType === 'number') ? 'bro-col_text-right' : undefined;

    return {title: col.title, tooltip: col.tooltip, name: col.name, className, dataType, sortKey: col.sortKey, component};
  });
}

/** A ready element of the skins: its tag depends on the skin. */
function elementComponent(element: string, skin: BroSpecSkin, name: string | undefined): unknown {
  switch (element) {
    case 'tags':
      return {selector: `bro-${skin}-tags`};
    case 'switch':
      // The switch of the bs and nv skins takes its value from the attribute checked
      return {selector: (skin === 'mat') ? 'bro-mat-slide-toggle' : 'bro-switch', attrs: {checked: raw(`(_col, row) => row.${name}`)}};
    default:
      // The table opens the row details on the action bro-details-toggle of the button
      return {selector: 'bro-details-button', attrs: {title: 'Details', name: raw('events.detailsToggleEvent')}, event: 'action'};
  }
}

function rowAction(spec: BroTableSpec, action: string): boolean {
  return (spec.cells ?? []).some(cell => cell.actions?.includes(action));
}

/** The line about the model: the type of a row, and of the filters of the drawer. */
export function modelDescription(hasFilters: boolean): string {
  return `the model: the type of a row${hasFilters ? ' and of the filters of the drawer' : ''}.`;
}

/** The line about a cell: what it shows, or the row details. */
export function cellDescription(cell: BroCellCode): string {
  return (cell.cell.kind === 'details') ? `the row details: ${cell.cell.shows}.` : `a cell: ${cell.cell.shows}.`;
}

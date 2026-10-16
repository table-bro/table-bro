import type {BroTableSpec}                  from '../spec/spec.js';
import {imports, literal, objectKey, quote} from './code.js';
import type {BroFiltersCode}                from './filters.js';
import {BroNames}                           from './names.js';

/**
 * Where a server table takes its rows: the API of the project, the simulated server of the site, or the API of the spec
 * that gives its rows page by page or all at once.
 */
export type BroServerSource = 'project' | 'simulated' | 'api-pages' | 'api';

/**
 * The service of a server table, as BroService of @table-bro/angular: loadPage sends the request of a query of the table
 * and gives the rows of its page with the number of all rows; mapServerQuery turns the query into the request of the API,
 * and mapServerResponse the answer of the API into the rows. The page only delivers the rows to the table. The simulated
 * server of the site is a REST API with names of its own, so its service maps as the service of a real API does.
 */
export function serviceCode(spec: BroTableSpec, source: BroServerSource, filtersCode?: BroFiltersCode): string {
  // The spec as the service sees its API: the simulated server has the names and the parameters of a REST API
  const view = (source === 'simulated') ? simulatedSpec(spec, filtersCode) : spec;
  const names = BroNames.of(spec);
  const row = spec.rowType;
  const api = view.api;
  const pages = (source === 'api-pages' || source === 'simulated');
  const filters = Boolean(filtersCode) && pages && Boolean(api?.filters);
  // The simulated server and an API without pages filter the rows as filtersTransform of the local mode does
  const localFilters = Boolean(filtersCode) && (source === 'simulated' || source === 'api');
  const renamed = renamedSources(view);
  const http = (source !== 'simulated');

  // The parts of each source: only the one of the source runs, as only an API has the paths of its answer
  const types: string[] = {
    project: () => [
      '/** A request of your API: its query parameters. */',
      `export type ${names.apiQueryType} = Record<string, string | number | boolean>;`,
      '',
      '/** An answer of your API: the rows of a page and the number of all rows. Replace it with the answer of your API. */',
      `export interface ${names.apiPageType} {`,
      `  rows: ${row}[];`,
      '  total: number;',
      '}'
    ],
    simulated: () => apiTypes(view, names, 'A request of the simulated server: the query parameters of a page, its search, its sort and its filters. Your API has its own.'),
    'api-pages': () => apiTypes(view, names, 'A request of the API: the query parameters of a page, its search, its sort and its filters.'),
    api: () => apiTypes(view, names, 'A request of the API: it gives all its rows at once and takes no parameters.')
  }[source]();

  const loadPage: string[] = (source === 'simulated')
    ? [
        '  /** A page of the query: the request of the simulated server, and its answer as the rows of the table. */',
        `  loadPage(query: BroQuery<${row}>): Promise<BroServerPage<${row}>> {`,
        `    return simulatedServer(this.mapServerQuery(query)).then((response: ${names.apiPageType}) => this.mapServerResponse(response));`,
        '  }'
      ]
    : (source === 'api')
        ? [
            '  /** A page of the query from all the rows of the API, filtered by the search and the filters and sorted. */',
            `  loadPage(query: BroQuery<${row}>): Promise<BroServerPage<${row}>> {`,
            `    return this.loadRows().then((rows: ${row}[]) => queryPage(rows, query));`,
            '  }',
            '',
            '  /** All the rows of the API: its answer comes once, and the service turns it into rows. */',
            `  private loadRows(): Promise<${row}[]> {`,
            `    return this.apiRows ??= ${request(names, quote(spec.api!.url), '')}`,
            `      .then((response: ${names.apiPageType}) => this.mapServerResponse(response).rows);`,
            '  }'
          ]
        : [
            `  /** A page of the query: the request of ${(source === 'project') ? 'your API' : 'the API'}, and its answer as the rows of the table. */`,
            `  loadPage(query: BroQuery<${row}>): Promise<BroServerPage<${row}>> {`,
            ...((source === 'project') ? ['    // TODO: the address of your API'] : []),
            `    return ${request(names, quote((source === 'project') ? `/api/${names.kebab}s` : spec.api!.url))}`,
            `      .then((response: ${names.apiPageType}) => this.mapServerResponse(response));`,
            '  }'
          ];

  const mapQuery: string[] = {
    project: () => [
      `  mapServerQuery(query: BroQuery<${row}>): ${names.apiQueryType} {`,
      '    // TODO: the parameters of your API for the sort (query.sort), the search and the filters (query.filter)',
      '    return {page: query.page, pageSize: query.pageSize};',
      '  }'
    ],
    simulated: () => pagesQuery(view, names, filters, renamed.length > 0),
    'api-pages': () => pagesQuery(view, names, filters, renamed.length > 0),
    api: () => [
      '  /** The API takes no parameters: the service answers the queries of the table from all its rows. */',
      `  mapServerQuery(): ${names.apiQueryType} {`,
      '    return {};',
      '  }'
    ]
  }[source]();

  const mapResponse: string[] = (source === 'project')
    ? [
        `  mapServerResponse(response: ${names.apiPageType}): BroServerPage<${row}> {`,
        '    return {rows: response.rows, total: response.total};',
        '  }'
      ]
    : [
        `  mapServerResponse(response: ${names.apiPageType}): BroServerPage<${row}> {`,
        `    const rows: ${row}[] = ${access('response', api!.rows)}.map((item: ${names.apiItemType}) => ({`,
        view.fields.map(field => `      ${objectKey(field.name)}: ${access('item', field.source ?? field.name)}`).join(',\n'),
        '    }));',
        '',
        `    return {rows, total: ${pages ? access('response', api!.total!) : 'rows.length'}};`,
        '  }'
      ];

  const members: string[] = [
    ...(http ? ['  private http = inject(HttpClient);'] : []),
    ...((source === 'api') ? ['  /** All the rows of the API, loaded once: the service answers the queries of the table from them. */', `  private apiRows?: Promise<${row}[]>;`] : []),
    ...(http ? [''] : []),
    ...loadPage,
    '',
    ...mapQuery,
    '',
    ...mapResponse
  ];

  // The simulated server and an API without pages answer the queries from all the rows, after the service
  const local: string[] = [
    ...(localFilters ? ['', `/** The filters of the drawer on ${(source === 'api') ? 'the rows of the API' : 'the records of the simulated server'}. */`, `const filterRows = ${filtersCode!.transformCode()};`] : []),
    ...((source === 'api') ? ['', queryPageCode(spec, localFilters ? `filterRows(rows, (query.filter ?? {}) as ${names.filtersType})` : 'rows')] : []),
    ...((source === 'simulated') ? ['', ...simulatedServerCode(spec, view, names, localFilters)] : [])
  ];

  return [
    imports({
      '@angular/common/http': http ? ['HttpClient'] : [],
      '@angular/core': ['Injectable', ...(http ? ['inject'] : [])],
      rxjs: http ? ['firstValueFrom'] : [],
      '@table-bro/core': ['type BroQuery', ...(localFilters ? ['matchesFilterCondition'] : [])],
      '@table-bro/angular': ['type BroServerPage', 'type BroService'],
      [`./${names.kebab}`]: [`type ${row}`, ...((filters || localFilters) ? [`type ${names.filtersType}`] : [])]
    }),
    '',
    ...types,
    '',
    ...((pages && renamed.length)
      ? [
          '/** The names of the API for the fields of a row: the API sorts by them. */',
          `const apiFields: Partial<Record<keyof ${row}, string>> = ${literal(Object.fromEntries(renamed), '')};`,
          ''
        ]
      : []),
    '/**',
    ` * The service of the table: it sends the request of a query of the table to ${(source === 'simulated') ? 'the simulated server' : (source === 'project') ? 'your API' : 'the API'}, and turns its answer`,
    ' * into the rows of a page with the number of all rows. The page delivers them to the table.',
    ' */',
    '@Injectable({providedIn: \'root\'})',
    `export class ${names.serviceClass} implements BroService<${row}, ${names.apiQueryType}, ${names.apiPageType}> {`,
    ...members,
    '}',
    ...local,
    ''
  ].join('\n');
}

/**
 * The request of a query to an API by HttpClient: its parameters come from mapServerQuery.
 * @param names - the names of the table
 * @param url - the address of the API, as a string literal
 * @param query - the argument of mapServerQuery: none for an API without parameters
 */
function request(names: BroNames, url: string, query: string = 'query'): string {
  return `firstValueFrom(this.http.get<${names.apiPageType}>(${url}, {params: this.mapServerQuery(${query})}))`;
}

/**
 * The spec as the simulated server of the site gives it: a REST API with the parameters page, per_page, q and sort,
 * the filters in snake case, and the answer {data, meta: {total_count}} with the fields in its own names.
 */
function simulatedSpec(spec: BroTableSpec, filters?: BroFiltersCode): BroTableSpec {
  return {
    ...spec,
    fields: spec.fields.map(field => ({...field, source: simulatedName(field.name, field.type === 'boolean')})),
    api: {
      url: '',
      rows: 'data',
      total: 'meta.total_count',
      paging: {size: 'per_page', page: 'page'},
      search: 'q',
      sort: {field: 'sort'},
      filters: Object.fromEntries((filters?.keys() ?? []).map(({key, type}) => [key, simulatedName(key, type === 'boolean')]))
    }
  };
}

/** A name of the simulated API: snake case, and a yes or no field starts with is_ when it has no such start. */
function simulatedName(name: string, flag: boolean): string {
  const snake = name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  return (flag && !/^(is|has|can)_/.test(snake)) ? `is_${snake}` : snake;
}

/**
 * The simulated server of the site: its records are the rows of the spec. It reads its query parameters as a server
 * does, and answers in half a second with a page of its records in the names of its API.
 */
function simulatedServerCode(spec: BroTableSpec, view: BroTableSpec, names: BroNames, filters: boolean): string[] {
  const row = spec.rowType;
  const api = view.api!;
  const filterValues = Object.entries(api.filters ?? {}).map(([key, parameter]) => `    ${objectKey(key)}: request[${quote(parameter)}]`);

  return [
    '/** The records of the simulated server: the rows of the spec. */',
    `const serverRows: ${row}[] = ${literal(spec.rows ?? [], '')};`,
    '',
    '/**',
    ' * The simulated server: it reads its query parameters as a server does, and answers in half a second with a page of',
    ' * its records in the names of its API. Your API takes its place.',
    ' */',
    `function simulatedServer(request: ${names.apiQueryType}): Promise<${names.apiPageType}> {`,
    `  const page: number = Number(request[${quote(api.paging!.page!)}]);`,
    `  const perPage: number = Number(request[${quote(api.paging!.size)}]);`,
    `  const search: string = String(request[${quote(api.search!)}] ?? '').toLowerCase();`,
    `  const sort: string = String(request[${quote(api.sort!.field)}] ?? '');`,
    `  const key = sort.replace(/^-/, '') as keyof ${names.apiItemType};`,
    '  const direction: number = sort.startsWith(\'-\') ? -1 : 1;',
    ...(filters ? ['  const filters = {', filterValues.join(',\n'), `  } as ${names.filtersType};`] : []),
    `  const items: ${names.apiItemType}[] = ${filters ? 'filterRows(serverRows, filters)' : 'serverRows'}`,
    `    .map((row: ${row}) => ({`,
    view.fields.map(field => `      ${objectKey(field.source ?? field.name)}: row.${field.name}`).join(',\n'),
    '    }))',
    '    .filter(item => !search || Object.values(item).some(value => String(value).toLowerCase().includes(search)))',
    '    .sort((a, b) => sort ? String(a[key]).localeCompare(String(b[key]), undefined, {numeric: true}) * direction : 0);',
    '  const start: number = (page - 1) * perPage;',
    '',
    `  return new Promise(resolve => setTimeout(() => resolve({${api.rows}: items.slice(start, start + perPage), meta: {'total_count': items.length}}), 500));`,
    '}'
  ];
}

/** The page of a query from all the rows of a server: filtered by the search and the filters, sorted, and cut to the page. */
function queryPageCode(spec: BroTableSpec, filtered: string): string {
  const row = spec.rowType;

  return [
    '/** The page of a query from all the rows: filtered by the search and the filters, sorted, and cut to the page. */',
    `function queryPage(rows: ${row}[], query: BroQuery<${row}>): BroServerPage<${row}> {`,
    '  const search: string = (query.filter?.search ?? \'\').toLowerCase();',
    `  const [key] = (query.sort?.order ?? []) as (keyof ${row})[];`,
    '  const direction: number = (key && query.sort?.keys[key]?.direction === \'desc\') ? -1 : 1;',
    `  const found: ${row}[] = ${filtered}`,
    '    .filter(row => !search || Object.values(row).some(value => String(value).toLowerCase().includes(search)))',
    '    .sort((a, b) => key ? String(a[key]).localeCompare(String(b[key]), undefined, {numeric: true}) * direction : 0);',
    '  const start: number = (query.page - 1) * query.pageSize;',
    '',
    '  return {rows: found.slice(start, start + query.pageSize), total: found.length};',
    '}'
  ].join('\n');
}

/** The types of the request, of an item and of the answer of the API of the spec, as far as the table reads them. */
function apiTypes(spec: BroTableSpec, names: BroNames, request: string): string[] {
  const api = spec.api!;
  const item: BroTypeTree = new Map();
  const page: BroTypeTree = new Map();

  spec.fields.forEach(field => addPath(item, field.source ?? field.name, field.type));

  if (api.rows) {
    addPath(page, api.rows, `${names.apiItemType}[]`);
  }

  if (api.total && api.paging) {
    addPath(page, api.total, 'number');
  }

  return [
    `/** ${request} */`,
    `export type ${names.apiQueryType} = Record<string, string | number | boolean>;`,
    '',
    '/** An item of the answer of the API: the values that the table shows. */',
    `export interface ${names.apiItemType} ${typeText(item, '')}`,
    '',
    ...(api.rows
      ? [
          `/** An answer of the API: ${api.paging ? 'a page of its items with the number of all items' : 'all its items'}. */`,
          `export interface ${names.apiPageType} ${typeText(page, '')}`
        ]
      : [
          '/** An answer of the API: all its items. */',
          `export type ${names.apiPageType} = ${names.apiItemType}[];`
        ])
  ];
}

/** The query parameters of a page of the API: its size and place, its search, its sort and its filters. */
function pagesQuery(spec: BroTableSpec, names: BroNames, filters: boolean, renamed: boolean): string[] {
  const api = spec.api!;
  const paging = api.paging!;
  const field = renamed ? 'apiFields[key] ?? key' : 'key';
  const params = [
    `      ${objectKey(paging.size)}: query.pageSize`,
    paging.offset ? `      ${objectKey(paging.offset)}: (query.page - 1) * query.pageSize` : `      ${objectKey(paging.page!)}: query.page`,
    ...(api.search ? [`      ${objectKey(api.search)}: query.filter?.search`] : []),
    ...(!api.sort
      ? []
      : api.sort.order
        ? [
            `      ${objectKey(api.sort.field)}: key && (${field})`,
            `      ${objectKey(api.sort.order)}: key && (query.sort?.keys[key]?.direction ?? 'asc')`
          ]
        : [
            `      ${objectKey(api.sort.field)}: key && \`\${(query.sort?.keys[key]?.direction === 'desc') ? '-' : ''}\${${field}}\``
          ]),
    ...Object.entries(api.filters ?? {}).map(([key, parameter]) => `      ${objectKey(parameter)}: filters.${key}`)
  ];

  return [
    '  /** The page, the search, the sort and the filters as the query parameters of the API; an empty value filters nothing. */',
    `  mapServerQuery(query: BroQuery<${spec.rowType}>): ${names.apiQueryType} {`,
    ...(api.sort ? [`    const [key] = (query.sort?.order ?? []) as (keyof ${spec.rowType})[];`] : []),
    ...(filters ? [`    const filters = (query.filter ?? {}) as ${names.filtersType};`] : []),
    '    const params: Record<string, string | number | boolean | null | undefined> = {',
    params.join(',\n'),
    '    };',
    '',
    `    return Object.fromEntries(Object.entries(params).filter(([, value]) => (value ?? '') !== '' && value !== false)) as ${names.apiQueryType};`,
    '  }'
  ];
}

/** The fields of a row whose values come from other names of the API: the API sorts by its own names. */
export function renamedSources(spec: BroTableSpec): [string, string][] {
  return spec.api?.sort ? spec.fields.filter(field => field.source && field.source !== field.name).map(field => [field.name, field.source!]) : [];
}

/** A type as a tree of its fields: a leaf is the TypeScript type of a value. */
type BroTypeTree = Map<string, BroTypeTree | string>;

function addPath(tree: BroTypeTree, path: string, type: string): void {
  const [key, ...rest] = path.split('.');

  if (!rest.length) {
    tree.set(key, type);

    return;
  }

  const child = tree.get(key);
  const node: BroTypeTree = (child instanceof Map) ? child : new Map();

  tree.set(key, node);
  addPath(node, rest.join('.'), type);
}

function typeText(tree: BroTypeTree, indent: string): string {
  const inner = indent + '  ';
  const fields = [...tree].map(([key, value]) => `${inner}${property(key)}: ${(value instanceof Map) ? typeText(value, inner) : value};`);

  return `{\n${fields.join('\n')}\n${indent}}`;
}

/** A value at a path, as item.user.name or item['news-site']. */
function access(object: string, path: string): string {
  return path ? `${object}${path.split('.').map(key => /^[A-Za-z_$][\w$]*$/.test(key) ? `.${key}` : `[${quote(key)}]`).join('')}` : object;
}

function property(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : quote(key);
}

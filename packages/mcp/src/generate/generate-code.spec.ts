import ts                     from 'typescript';
import {describe, expect, it} from 'vitest';

import {builtinSpecs}                          from '../spec/builtin-specs.js';
import type {BroTableSpec}                     from '../spec/spec.js';
import {literal, raw}                          from './code.js';
import {type BroSpecFillings, templateClasses} from './fillings.js';
import {generateCode}                          from './generate-code.js';

const orders = builtinSpecs.find(builtin => builtin.name === 'orders')!;

function file(files: {path: string; content: string}[], path: string): string {
  const found = files.find(item => item.path === path);

  expect(found, path).toBeDefined();

  return found!.content;
}

describe('generateCode', () => {
  it('keeps the texts of a spec in their strings and comments', () => {
    const text = 'a */ b\n c\r d --> e \u2028 f \' g';
    const spec = <BroTableSpec>structuredClone(orders.spec);

    spec.fields.find(field => field.values)!.values!.push(text);
    spec.cells!.forEach(cell => cell.shows = text);
    spec.filters!.forEach(filter => filter.label = text);
    spec.filters!.find(filter => filter.rule)!.rule = text;
    spec.cols[0].title = text;

    for (const [target, skin] of <const>[['angular', 'mat'], ['vanilla', 'bs']]) {
      spec.skinConfig = {[skin]: {callbacks: [{path: 'components.sortHeader.beforeRender', does: text}]}};

      const {files, report} = generateCode(spec, {target, skin});

      expect(report.errors).toEqual([]);

      for (const {path, content} of files.filter(item => item.path.endsWith('.ts'))) {
        const {diagnostics} = ts.transpileModule(content, {reportDiagnostics: true, compilerOptions: {target: ts.ScriptTarget.ESNext}});

        expect(diagnostics?.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')), path).toEqual([]);

        // An HTML comment of a template ends where it began: the text of the spec stays inside
        if (content.includes('<!--')) {
          expect(content.split('<!--').length, path).toBe(content.split('-->').length);
        }
      }
    }
  });

  it('writes nothing for a spec with errors', () => {
    const spec = <BroTableSpec>{...orders.spec, cols: [{title: 'Order', name: 'nummer'}]};
    const result = generateCode(spec, {target: 'angular', skin: 'mat'});

    expect(result.report.valid).toBe(false);
    expect(result.files).toEqual([]);
  });

  it('names an import that it cannot place, instead of failing', () => {
    const cell = orders.spec.cells![0].name;
    const fillings = {cells: {[cell]: {mat: {template: '<span>{{ row.number }}</span>', imports: ["import {X} from 'x'", {name: 'Own', from: './own.component'}]}}}};
    const result = generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings});

    expect(result.files).toEqual([]);
    expect(result.report.errors).toEqual([expect.objectContaining({path: `fillings.cells.${cell}.mat.imports[0]`})]);
    expect(generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: {cells: {[cell]: {mat: {imports: ['DatePipe', {name: 'Own', from: './own.component'}]}}}}}).report.valid).toBe(true);
  });

  it('names the parts of fillings of another form, instead of failing', () => {
    const cell = orders.spec.cells![0].name;
    const errors = (fillings: unknown) => generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: <BroSpecFillings>fillings}).report.errors.map(error => error.path);

    expect(errors('fillings')).toEqual(['fillings']);
    expect(errors({cells: 5, filterRules: {big: 5}, callbacks: {mat: 5}})).toEqual(['fillings.cells', 'fillings.filterRules.big', 'fillings.callbacks.mat']);
    expect(errors({cells: {[cell]: {mat: {template: 5, imports: 'x'}}}})).toEqual([`fillings.cells.${cell}.mat.template`, `fillings.cells.${cell}.mat.imports`]);
    expect(errors({cells: {[cell]: {mat: {template: null}}}, filterRules: null})).toEqual([]);
  });

  it('keeps the mat skin for Angular', () => {
    expect(generateCode(orders.spec, {target: 'vanilla', skin: 'mat'}).report.errors).toEqual([
      {path: '', message: 'the mat skin is for Angular', fix: 'use the target angular, or the skin bs or nv'}
    ]);
  });

  it('writes the files of an Angular table by the recipe', () => {
    const {files, todo} = generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: orders.fillings});

    expect(files.map(item => item.path)).toEqual([
      'order-table/order.ts',
      'order-table/order-table.ts',
      'order-table/order-customer-cell.ts',
      'order-table/order-status-cell.ts',
      'order-table/order-actions-cell.ts',
      'order-table/order-details-cell.ts',
      'order-table/order-filters.ts',
      'order-table/order-table.css'
    ]);
    expect(files.find(item => item.path.endsWith('order-table.ts'))?.description).toBe('the page of the table. Here are its columns, `cols`, its rows, `rows`, and its config, `conf`.');

    const page = file(files, 'order-table/order-table.ts');

    expect(page).toContain('<table-bro-filter-drawer-container-ng id="order-table-filters" tableId="order-table"');
    expect(page).toContain("customElements.define('bro-cell-order-actions', createCustomElement(OrderActionsCell, {injector: this.injector}));");
    expect(page).toContain("rowDetailsComponent: 'bro-cell-order-details'");
    expect(page).toContain("shortColumnTitle: (col: BroCol<Order>) => shortTitles[col.title] ?? col.title?.split(' ')[0]");
    // The message of a state goes into the texts, and the icon stays the one of the skin, also an animation of Lottie
    expect(page).toContain("        'no-data': 'No orders yet',");
    expect(page).not.toContain('components.state.states');
    expect(page.indexOf('  cols = signal<BroCol<Order>[]>(')).toBeLessThan(page.indexOf('  rows = signal<Order[] | undefined>([\n    {\n'));
    expect(page.indexOf('  rows = signal<Order[] | undefined>(')).toBeLessThan(page.indexOf('  conf = signal<BroConfig<Order>>('));

    const actions = file(files, 'order-table/order-actions-cell.ts');

    expect(actions).toContain('export class OrderActionsCell implements BroCellElement<Order> {');
    expect(actions).toContain('@Output() action: EventEmitter<string> = new EventEmitter<string>();');
    expect(actions).toContain('imports: [\n    MatIcon,\n    MatIconButton,\n    MatTooltip\n  ]');

    expect(file(files, 'order-table/order-table.css')).toContain('#order-table {\n  --bro-row-height: 56px;\n}');
    expect(todo).toEqual([
      'Add order-table/order-table.css to "styles" of angular.json, or import it into the global styles of the application'
    ]);
  });

  it('writes filtersTransform from the filters, with the rule of a model', () => {
    const page = file(generateCode(orders.spec, {target: 'angular', skin: 'bs', fillings: orders.fillings}).files, 'order-table/order-table.ts');

    expect(page).toContain([
      '        return matchesFilterCondition(row.customer, {contains: filters.customer})',
      '          && matchesFilterCondition(row.status, {eq: filters.status})',
      '          && matchesFilterCondition(row.total, {gte: filters.totalFrom, lte: filters.totalTo})',
      '          && matchesFilterCondition(row.urgent, {eq: filters.urgent})',
      '          && (filters.big === undefined || matchesBig(row));'
    ].join('\n'));
    expect(page).toContain('return row.total > 1000;');
    expect(page).toContain('<table-bro-filter-drawer-container id="order-table-filters" skin="bs">');
  });

  it('names the filters app-<row-type>-filters and their own classes app-*, a component of the application as the page', () => {
    const angular = generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: orders.fillings}).files;
    const form = file(generateCode(orders.spec, {target: 'vanilla', skin: 'nv', fillings: orders.fillings}).files, 'order-table/order-filters.ts');

    expect(file(angular, 'order-table/order-filters.ts')).toContain("  selector: 'app-order-filters',");
    expect(file(angular, 'order-table/order-table.ts')).toContain('<app-order-filters (changeFilter)=');
    expect(form).toContain("  form.className = 'app-order-filters';");
    expect(form).toContain('.app-order-filters .app-native-field {');
    expect(form).not.toContain('bro-order-filters');
    expect(form).toContain('export function renderOrderFilters(onChange: (filters: OrderFilterValues) => void): HTMLFormElement {');
    expect(file(angular, 'order-table/order-filters.ts')).toContain('export class OrderFilters {');
    expect(form).toContain("form.querySelector('.app-filters-clear')");
    expect(file(angular, 'order-table/order-filters.ts')).toContain('<mat-form-field class="app-filter"');
  });

  it('gives the buttons of the toolbar of the mat skin their icons', () => {
    const mat = file(generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: orders.fillings}).files, 'order-table/order-table.ts');
    const bs = file(generateCode(orders.spec, {target: 'angular', skin: 'bs', fillings: orders.fillings}).files, 'order-table/order-table.ts');

    expect(mat).toContain("buttonTitle: 'Export',\n            iconHTML: 'download',");
    expect(bs).toContain("buttonTitle: 'Export',\n            eventType: 'export'");
  });

  it('sets the CSS variables on the elements in Vanilla JS', () => {
    const spec = <BroTableSpec>{...orders.spec, cssVars: {'--bro-row-height': '56px', '--bro-filter-drawer-width': '320px'}};
    const module = file(generateCode(spec, {target: 'vanilla', skin: 'nv', fillings: orders.fillings}).files, 'order-table/order-table.ts');

    expect(module).toContain("  table.style.setProperty('--bro-row-height', '56px');\n\n  table.configure({cols, rows, conf});");
    expect(module).toContain("  drawer.style.setProperty('--bro-filter-drawer-width', '320px');");
  });

  it('sets the CSS variables of the drawer on the container of the mat skin in Angular', () => {
    const spec = <BroTableSpec>{...orders.spec, cssVars: {'--bro-row-height': '56px', '--bro-filter-drawer-width': '400px'}};
    const css = file(generateCode(spec, {target: 'angular', skin: 'mat', fillings: orders.fillings}).files, 'order-table/order-table.css');

    expect(css).toContain('#order-table-filters {\n  --bro-filter-drawer-width: 400px;\n}');
  });

  it('leaves TODOs in place of the fillings', () => {
    const {files, todo} = generateCode(orders.spec, {target: 'vanilla', skin: 'bs'});

    expect(file(files, 'order-table/order-status-cell.ts')).toContain('// TODO: the status as a badge of the library of the skin, paid stands out; the fields of the row: status');
    expect(todo).toContain('order-table/order-status-cell.ts: write the render() of the cell: the status as a badge of the library of the skin, paid stands out');
  });

  it('writes the loading of the server mode: a container of the page and a service of the API', () => {
    const users = builtinSpecs.find(builtin => builtin.name === 'users-server')!;
    const {files, setup, todo} = generateCode(users.spec, {target: 'angular', skin: 'mat'});
    const page = file(files, 'user-table/user-table.ts');
    const service = file(files, 'user-table/user.service.ts');

    expect(files.map(item => item.path).slice(0, 3)).toEqual(['user-table/user.ts', 'user-table/user-table.ts', 'user-table/user.service.ts']);
    expect(page).toContain('(query)="onQueryTable($event)"');
    expect(page).toContain('export class UserTable implements BroServerContainer<User> {');
    expect(page).toContain('  initTable() {\n    this.onQueryTable({page: 1, pageSize: 20});\n  }');
    // The page only delivers the rows: the service sends the request and maps the query and the answer
    expect(page).toContain('    this.service.loadPage(query).then(({rows, total}: BroServerPage<User>) => {');
    expect(page).not.toContain('HttpClient');
    expect(service).toContain('export class UserService implements BroService<User, UserApiQuery, UserApiPage> {');
    expect(service).toContain('  private http = inject(HttpClient);');
    expect(service).toContain("    // TODO: the address of your API\n    return firstValueFrom(this.http.get<UserApiPage>('/api/users', {params: this.mapServerQuery(query)}))\n      .then((response: UserApiPage) => this.mapServerResponse(response));");
    expect(service).toContain('    return {rows: response.rows, total: response.total};');
    expect(setup.map(step => step.title)).toContain('Provide HttpClient');
    expect(todo).toContain('user-table/user.service.ts: the address of your API in loadPage, and the map of the query of the table to its parameters and of its answer to the rows with their total');
  });

  it('writes the loading of the server mode in Vanilla JS: the first page, the delivery of each query and the request', () => {
    const users = builtinSpecs.find(builtin => builtin.name === 'users-server')!;
    const {files, todo} = generateCode(users.spec, {target: 'vanilla', skin: 'nv'});
    const module = file(files, 'user-table/user-table.ts');

    // The table asks only for the pages after the first one: the page asks for the first page itself
    expect(module).toContain('  container.append(host);\n\n  onQueryTable({page: 1, pageSize: 20});\n\n  return table;');
    // The listener takes the row type, as the Angular page takes BroActionDetail<User>, and the names of the custom
    // actions, none here: the case of the query narrows its data to BroQuery<User> without a cast
    expect(module).toContain("  table.addEventListener<User, never>('bro-action', event => {\n    switch (event.detail.action) {");
    expect(module).toContain('      case events.filtersServerLoadedEvent:\n        onQueryTable(event.detail.data);\n        break;');
    // Other filters or another sort replace the rows, the next pages of the same query add to them, an older answer is left out
    expect(module).toContain('      if (query !== lastQuery) {\n        return;\n      }');
    // An empty answer to a query with a search or filters is the state of no rows found
    expect(module).toContain("      if (queryKey !== loadedQuery) {\n        loadedQuery = queryKey;\n        table.replaceRows(rows, {total, emptyState: Object.values(query.filter ?? {}).some(value => value !== undefined && value !== null && value !== '') ? 'not-found' : undefined});\n      } else {\n        table.appendRows(rows, {total});\n      }");
    expect(module).toContain("        table.setState('fail');");
    expect(module).toContain('function loadPage(query: BroQuery<User>): Promise<UserApiPage> {');
    expect(module).toContain('  return fetch(`/api/users?${params}`).then((response: Response) => {');
    expect(todo).toContain('user-table/user-table.ts: the address of your API in loadPage, and the map of the query of the table to its parameters and of its answer to the rows with their total');
  });

  it('writes the simulated server of the site in the server mode', () => {
    const spec = <BroTableSpec>{...orders.spec, config: {...orders.spec.config, server: true}};
    const {files, todo} = generateCode(spec, {target: 'angular', skin: 'mat', fillings: orders.fillings, simulateServer: true});
    const page = file(files, 'order-table/order-table.ts');
    const service = file(files, 'order-table/order.service.ts');

    expect(page).toContain('    this.service.loadPage(query).then(({rows, total}: BroServerPage<Order>) => {');
    // A failed load is the failure state of the table, not a loading that never ends
    expect(page).toContain('        this.failed.set(true);');
    expect(page).not.toContain('simulatedServer');
    expect(page).not.toContain('HttpClient');
    // The simulated server is a REST API with names of its own: the service maps it as the API of a project does
    expect(service).toContain("      'per_page': query.pageSize,\n      page: query.page,\n      q: query.filter?.search,");
    expect(service).toContain("      'is_urgent': filters.urgent,");
    expect(service).toContain('      urgent: item.is_urgent');
    expect(service).toContain('    return {rows, total: response.meta.total_count};');
    // The server filters its records as filtersTransform of the local mode, and answers in the names of its API
    expect(service).toContain('const filterRows = (rows: Order[], filters: OrderFilterValues) => {');
    expect(service).toContain('const serverRows: Order[] = [');
    expect(service).toContain("    urgent: request['is_urgent'],");
    expect(service).toContain('  const items: OrderApiItem[] = filterRows(serverRows, filters)');
    expect(service).toContain('  return new Promise(resolve => setTimeout(() => resolve({data: items.slice(start, start + perPage), meta: {\'total_count\': items.length}}), 500));');
    expect(service).not.toContain('HttpClient');
    expect(todo).toContain('order-table/order.service.ts: replace the simulated server of loadPage with a request to your API, and map its parameters and its answer');
  });

  it('writes the loading of an API: its answer once, and the queries of the table from its rows', () => {
    const spec = <BroTableSpec>{
      ...orders.spec,
      config: {...orders.spec.config, server: true},
      fields: orders.spec.fields.map(field => ({...field, source: (field.name === 'customer') ? 'user.name' : field.name})),
      api: {url: 'https://dummyjson.com/carts', rows: 'carts'}
    };
    const {files, setup, todo} = generateCode(spec, {target: 'angular', skin: 'mat', fillings: orders.fillings});
    const page = file(files, 'order-table/order-table.ts');
    const service = file(files, 'order-table/order.service.ts');

    expect(service).toContain("    return this.apiRows ??= firstValueFrom(this.http.get<OrderApiPage>('https://dummyjson.com/carts', {params: this.mapServerQuery()}))");
    expect(service).toContain('    return this.loadRows().then((rows: Order[]) => queryPage(rows, query));');
    expect(service).toContain('  const found: Order[] = filterRows(rows, (query.filter ?? {}) as OrderFilterValues)');
    expect(service).toContain('export interface OrderApiPage {\n  carts: OrderApiItem[];\n}');
    expect(service).toContain('      customer: item.user.name,');
    expect(page).not.toContain('HttpClient');
    expect(page).not.toContain('queryPage');
    expect(setup.map(step => step.title)).toContain('Provide HttpClient');
    expect(todo.some(item => item.includes('onQueryTable') || item.includes('loadPage'))).toBe(false);
  });

  it('loads the pages of an API that gives pages: the page, the search, the sort and the filters as its parameters', () => {
    const spec = <BroTableSpec>{
      ...orders.spec,
      config: {...orders.spec.config, server: true},
      fields: orders.spec.fields.map(field => ({...field, source: (field.name === 'number') ? 'order_number' : field.name})),
      api: {url: 'https://example.com/orders', rows: 'results', paging: {size: 'limit', offset: 'offset'}, total: 'count', search: 'search', sort: {field: 'ordering'}, filters: {customer: 'customer', status: 'status', totalFrom: 'total_min', totalTo: 'total_max', urgent: 'urgent', big: 'big'}}
    };
    const service = file(generateCode(spec, {target: 'angular', skin: 'mat', fillings: orders.fillings}).files, 'order-table/order.service.ts');

    expect(service).toContain([
      '      limit: query.pageSize,',
      '      offset: (query.page - 1) * query.pageSize,',
      '      search: query.filter?.search,',
      "      ordering: key && `${(query.sort?.keys[key]?.direction === 'desc') ? '-' : ''}${apiFields[key] ?? key}`,",
      '      customer: filters.customer,',
      '      status: filters.status,',
      "      'total_min': filters.totalFrom,",
      "      'total_max': filters.totalTo,",
      '      urgent: filters.urgent,',
      '      big: filters.big'
    ].join('\n'));
    expect(service).toContain('    return {rows, total: response.count};');
    expect(service).toContain("const apiFields: Partial<Record<keyof Order, string>> = {\n  number: 'order_number'\n};");
    expect(service).not.toContain('filterRows');
  });

  it('registers the skin with the optional elements that the table uses, by its spec', () => {
    const setup = (spec: BroTableSpec, target: 'angular' | 'vanilla', skin: 'mat' | 'bs' | 'nv') => generateCode(spec, {target, skin}).setup.map(step => step.code ?? '').join('\n');
    const plain = <BroTableSpec>{...structuredClone(orders.spec), cols: orders.spec.cols.filter(col => !col.component), toolbar: undefined};

    // The orders have tags, a switch and a menu of the toolbar, which is an element of its own only in the skin mat
    expect(setup(orders.spec, 'angular', 'mat')).toContain('provideTableBroMatSkin(withTags(), withSwitch(), withToolbarMenu())');
    expect(setup(orders.spec, 'angular', 'mat')).toContain("import {provideTableBroMatSkin, withSwitch, withTags, withToolbarMenu} from '@table-bro/angular-material';");
    expect(setup(orders.spec, 'vanilla', 'bs')).toContain("import {useBootstrap, withSwitch, withTags} from '@table-bro/bootstrap';");
    expect(setup(orders.spec, 'vanilla', 'bs')).toContain('useBootstrap({Dropdown, Tooltip});\nwithTags();\nwithSwitch();');
    expect(setup(orders.spec, 'angular', 'nv')).toContain("import {withSwitch, withTags} from '@table-bro/native';\n\nwithTags();\nwithSwitch();");

    expect(setup(plain, 'angular', 'mat')).toContain('provideTableBroMatSkin()');
    expect(setup(plain, 'vanilla', 'nv')).toContain("import '@table-bro/native';");
  });

  it('writes a function of the skin config with its body', () => {
    const spec = <BroTableSpec>{
      ...orders.spec,
      skinConfig: {bs: {callbacks: [{path: 'components.sortHeader.afterRender', does: 'show the title as a native tooltip'}]}}
    };
    const fillings = {...orders.fillings, callbacks: {bs: {'components.sortHeader.afterRender': 'element.setAttribute(\'title\', value);'}}};
    const page = file(generateCode(spec, {target: 'angular', skin: 'bs', fillings}).files, 'order-table/order-table.ts');

    expect(page).toContain([
      '      sortHeader: {',
      '        afterRender: (element: Element, value: string): void | (() => void) => {',
      "          element.setAttribute('title', value);",
      '        }',
      '      }'
    ].join('\n'));
  });
});

describe('a paid module', () => {
  it('gives its fields to the config and its setup to the project', () => {
    const install = {title: 'Install Island Details', code: 'npm install @table-bro-extended/island-details', language: <const>'bash'};
    const extension = {package: '@table-bro-extended/island-details', config: {rowDetailsIsland: () => undefined}, setup: [install]};
    const spec = <BroTableSpec>{...orders.spec, config: {...orders.spec.config, rowDetailsIsland: true}};
    const result = generateCode(spec, {target: 'angular', skin: 'mat', fillings: orders.fillings, extensions: [extension]});

    expect(file(result.files, 'order-table/order-table.ts')).toContain("rowDetailsComponent: 'bro-cell-order-details',\n    rowDetailsIsland: true,");
    // The step names its module: the site shows the setup of a paid module apart
    expect(result.setup[result.setup.length - 1]).toEqual({...install, module: '@table-bro-extended/island-details'});
    expect(generateCode(orders.spec, {target: 'angular', skin: 'mat', fillings: orders.fillings, extensions: [extension]}).setup.map(step => step.title)).not.toContain(install.title);
  });
});

describe('templateClasses', () => {
  it('finds the classes of a template by their selectors and pipes', () => {
    expect(templateClasses('<button mat-icon-button matTooltip="Edit"><mat-icon>edit</mat-icon></button> {{ row.total | currency }}')).toEqual(['CurrencyPipe', 'MatIconButton', 'MatIcon', 'MatTooltip']);
    expect(templateClasses('<mat-button-toggle-group></mat-button-toggle-group><mat-chip-set><mat-chip>new</mat-chip></mat-chip-set>')).toEqual(['MatChip', 'MatChipSet']);
  });

  it('gives the Angular cells of the bs skin their markup and no classes of Angular Material', () => {
    const status = file(generateCode(orders.spec, {target: 'angular', skin: 'bs', fillings: orders.fillings}).files, 'order-table/order-status-cell.ts');

    expect(status).toContain('export class OrderStatusCell implements BroCellElement<Order> {');
    expect(status).toContain('<span class="badge"');
    expect(status).not.toContain('imports:');
  });
});

describe('literal', () => {
  it('prints values in the style of the code of Table, Bro', () => {
    expect(literal({title: "Customer's", 'no-data': ['a', 1, true], items: [{a: 1}, {b: undefined}], fn: raw('() => 1')})).toBe([
      '{',
      "  title: 'Customer\\'s',",
      "  'no-data': ['a', 1, true],",
      '  items: [',
      '    {',
      '      a: 1',
      '    }, {}',
      '  ],',
      '  fn: () => 1',
      '}'
    ].join('\n'));
  });
});

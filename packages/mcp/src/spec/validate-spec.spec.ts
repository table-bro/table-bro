import {describe, expect, it} from 'vitest';

import {rowsSchema, specSchema}                                                   from './schema.js';
import type {BroTableSpec}                                                        from './spec.js';
import {type BroSpecIssue, type BroSpecIssues, rowDetailsByDefault, validateSpec} from './validate-spec.js';

/** The example spec: a table of orders. */
function orders(): BroTableSpec {
  return {
    specVersion: 1,
    rowType: 'Order',
    fields: [
      {name: 'number', type: 'string'},
      {name: 'customer', type: 'string'},
      {name: 'total', type: 'number'},
      {name: 'status', type: 'string', values: ['paid', 'pending', 'refunded']},
      {name: 'tags', type: 'string[]'}
    ],
    cols: [
      {title: 'Order', name: 'number'},
      {title: 'Customer', name: 'customer'},
      {title: 'Total amount', shortTitle: 'Total', name: 'total', dataType: 'number'},
      {title: 'Status', name: 'status', component: {cell: 'status'}},
      {title: 'Tags', name: 'tags', component: {element: 'tags'}},
      {title: '', component: {cell: 'actions'}}
    ],
    cells: [
      {name: 'status', shows: 'the order status as a colored chip', fields: ['status'], actions: []},
      {name: 'actions', shows: 'Edit and Delete icon buttons', fields: ['number'], actions: ['edit', 'delete']}
    ],
    filters: [
      {name: 'customer', label: 'Customer', control: 'text', field: 'customer', match: 'contains'},
      {name: 'status', label: 'Status', control: 'select', field: 'status', match: 'eq'},
      {name: 'total', label: 'Total', control: 'range', field: 'total'}
    ],
    rows: [
      {number: 'A-1042', customer: 'Ada Lovelace', total: 1200, status: 'paid', tags: ['new', 'priority']}
    ],
    config: {toolbarTitle: 'Orders', pageSize: 10, server: false},
    toolbar: {buttons: [{title: 'Export', action: 'export', icon: 'download'}]},
    stateMessages: {'no-data': 'No orders yet'},
    cssVars: {'--bro-row-height': '64px'}
  };
}

function issueAt(issues: BroSpecIssue[], path: string): BroSpecIssue | undefined {
  return issues.find(issue => issue.path === path);
}

describe('validateSpec', () => {
  it('checks long names and many errors in a short time, with a short report', () => {
    const spec = orders();
    const long = 'x'.repeat(20000);

    spec.fields.push({name: 'y'.repeat(20000), type: 'string'});
    spec.cols = Array.from({length: 1000}, (_, index) => ({title: `Column ${index}`, name: (index % 2) ? long : `field${index}`}));

    const start = performance.now();
    const result = validateSpec(spec);

    expect(performance.now() - start).toBeLessThan(500);
    expect(result.errors.length).toBe(100);
    expect(result.omitted?.errors).toBe(900);
    expect(result.valid).toBe(false);
  });

  it('warns of two plain columns of one title and one field', () => {
    const spec = <BroTableSpec>{...orders(), cols: [...orders().cols, {title: 'Order', name: 'number'}]};
    const report = validateSpec(spec);
    const last = spec.cols.length - 1;

    expect(report.valid).toBe(true);
    expect(issueAt(report.warnings, `cols[${last}]`)?.message).toContain('as cols[0] does');

    // The same field in a column of another title, or of a component, is meant
    const meant = <BroTableSpec>{...orders(), cols: [...orders().cols, {title: 'Order again', name: 'number'}, {title: 'Order', name: 'number', component: {element: 'tags'}}]};

    expect(validateSpec(meant).warnings.some(item => item.message.includes('as cols[0] does'))).toBe(false);
  });

  it('names a filter once, whatever its control', () => {
    const base = orders();
    const field = base.fields.find(item => item.type === 'number')!.name;
    const spec = <BroTableSpec>{...base, filters: [
      {name: 'amount', label: 'Amount', control: 'text', field},
      {name: 'amount', label: 'Amount', control: 'range', field}
    ]};

    expect(issueAt(validateSpec(spec).errors, 'filters[1].name')?.message).toBe('the filter amount is already declared');
  });

  it('accepts the example of the plan', () => {
    const report = validateSpec(orders());

    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.valid).toBe(true);
  });

  it('checks an API: its address, the path of its rows and the source of every field', () => {
    const spec = <BroTableSpec>{...orders(), api: {url: 'ftp://example.com', rows: 'data..items'}};

    spec.fields[0].source = 'meta.number';
    spec.fields[1].source = '1x';

    const issues = validateSpec(spec).errors;

    expect(issueAt(issues, 'api.url')?.message).toBe('expected the address of a GET endpoint: http or https, or the path of the API of the project, as /api/orders');
    expect(issueAt(issues, 'api.rows')?.message).toBe('expected the path of the array of the rows in the answer, or an empty string for an answer that is the array');
    expect(issueAt(issues, 'fields[1].source')?.message).toBe('expected the path of a value in an item of the answer of the API');
    expect(issueAt(issues, 'fields[2].source')?.message).toBe('with an API every field needs the path of its value in an item of the answer');
  });

  it('takes the path of the API of the project as its address', () => {
    const spec = <BroTableSpec>{...orders(), api: {url: '/api/orders', rows: ''}};

    expect(issueAt(validateSpec(spec).errors, 'api.url')).toBeUndefined();
    expect(issueAt(validateSpec({...spec, api: {url: '//example.com/api', rows: ''}}).errors, 'api.url')).toBeDefined();
  });

  it('checks the pages of an API: the parameters of a page and the number of all rows', () => {
    const spec = <BroTableSpec>{...orders(), config: {...orders().config, server: true}, api: {url: 'https://dummyjson.com/carts', rows: 'carts', paging: {size: 'limit', offset: 'skip', page: 'page'}}};

    spec.fields.forEach(field => field.source = field.name);

    const issues = validateSpec(spec).errors;

    expect(issueAt(issues, 'api.paging')?.message).toBe('expected the query parameters of a page: size, and offset or page');
    expect(issueAt(issues, 'api.total')?.message).toBe('expected the path of the number of all rows in the answer: an API that gives pages has it');

    expect(issueAt(issues, 'api.filters.totalFrom')?.message).toBe('the API filters the rows itself: every filter needs its query parameter');

    spec.api = {url: 'https://dummyjson.com/carts', rows: 'carts', paging: {size: 'limit', offset: 'skip'}, total: 'total', filters: {customer: 'customer', status: 'status', totalFrom: 'total_min', totalTo: 'total_max'}};

    expect(validateSpec(spec).errors).toEqual([]);
  });

  it('knows every field of the JSON Schema', () => {
    const spec = <BroTableSpec & Record<string, unknown>>orders();

    spec.cells!.push({name: 'details', kind: 'details', shows: 'the items of the order', fields: ['number']});
    spec.cols.push({title: '', component: {element: 'details-button'}});
    spec.cols[0] = {title: 'Order', name: 'number', shortTitle: 'No', tooltip: 'The number', dataType: 'string', sortKey: 'number'};
    spec.filters!.push({name: 'late', label: 'Late', control: 'checkbox', match: 'custom', rule: 'the order is older than a week'});
    spec.config = {toolbarTitle: 'Orders', pageSize: 10, server: true, rowCounter: true, shadowsEnabled: true, theme: 'auto', rowDetailsComponent: {cell: 'details'}, rowDetailsServer: false};
    spec.toolbar = {buttons: [{title: 'Export', action: 'export', icon: 'download'}], menu: {title: 'More', items: [{title: 'Archive', action: 'archive'}]}};
    spec.stateMessages = {loading: 'Loading orders', 'no-data': 'No orders yet', 'not-found': 'No orders match', fail: 'The orders did not load'};
    spec.skinConfig = {bs: {css: {table: {className: 'table table-hover'}}, components: {state: {fontIcon: false}}, callbacks: [{path: 'components.sortHeader.afterRender', does: 'show the tooltip of the column'}]}};
    spec.api = {url: 'https://dummyjson.com/carts', rows: 'carts', paging: {size: 'limit', offset: 'skip'}, total: 'total', search: 'q', sort: {field: 'sortBy', order: 'order'}, filters: {customer: 'customer', status: 'status', totalFrom: 'total_min', totalTo: 'total_max', late: 'late'}};
    spec.fields.forEach(field => field.source = field.name);

    const report = validateSpec(spec, {skin: 'bs'});

    expect(report.errors).toEqual([]);
    expect(Object.keys(spec).sort()).toEqual(Object.keys(<object>specSchema['properties']).sort());
  });

  it('suggests the nearest name of an unknown field', () => {
    const spec = orders();

    (<unknown[]>spec.cols)[0] = {titel: 'Order', name: 'number'};

    const issue = issueAt(validateSpec(spec).errors, 'cols[0].titel');

    expect(issue?.message).toBe('unknown field titel');
    expect(issue?.fix).toBe('did you mean title?');
  });

  it('suggests the short name of a field given by its full word', () => {
    const spec = <Partial<BroTableSpec> & Record<string, unknown>>orders();

    spec.columns = spec.cols;
    spec.cssVariables = {'--bro-row-height': '64px'};
    delete spec.cols;

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'columns')?.fix).toBe('did you mean cols?');
    expect(issueAt(errors, 'cssVariables')?.fix).toBe('did you mean cssVars?');
  });

  it('tells how to fix a repeat', () => {
    const spec = orders();

    spec.fields[3].values = ['paid', 'pending', 'paid'];
    spec.cells![1].actions = ['edit', 'edit'];

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'fields[3].values')?.fix).toBe('keep one paid');
    expect(issueAt(errors, 'cells[1].actions[1]')?.fix).toBe('keep one');
  });

  it('tells why the spec leaves out a field of the API', () => {
    const spec = <BroTableSpec & {config: Record<string, unknown>; cols: Record<string, unknown>[]}>orders();

    spec.config.skin = 'mat';
    spec.config.filtersTransform = 'rows => rows';
    spec.cols[0].className = 'bro-col_number';

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'config.skin')?.fix).toContain('pass the skin to generate_code');
    expect(issueAt(errors, 'config.filtersTransform')?.fix).toContain('describe the filters in filters');
    expect(issueAt(errors, 'cols[0].className')?.message).toContain('CSS of the application');
  });

  it('checks the names of the fields, the cells and the elements', () => {
    const spec = orders();

    spec.cols[1].name = 'costumer';
    spec.cols[3].component = {cell: 'state'};
    spec.cols[4].name = 'status';
    spec.cells![1].fields = ['nummer'];

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'cols[1].name')?.fix).toBe('did you mean customer?');
    expect(issueAt(errors, 'cols[3].component.cell')?.message).toBe('no cell state in cells');
    expect(issueAt(errors, 'cols[4].component.element')?.message).toBe('the tags show a field of the type string[]');
    expect(issueAt(errors, 'cells[1].fields[0]')?.fix).toBe('did you mean number?');
  });

  it('warns about a cell that no column names', () => {
    const spec = orders();

    spec.cols.pop();

    expect(validateSpec(spec).warnings).toEqual([expect.objectContaining({path: 'cells[1]'})]);
  });

  it('checks that a filter fits its field', () => {
    const spec = orders();

    spec.filters = [
      {name: 'customer', label: 'Customer', control: 'select', field: 'customer'},
      {name: 'number', label: 'Number', control: 'range', field: 'number'},
      {name: 'search', label: 'Search', control: 'text', field: 'customer'},
      {name: 'total', label: 'Total', control: 'range', field: 'total'},
      {name: 'totalFrom', label: 'Total from', control: 'text', field: 'customer'},
      {name: 'late', label: 'Late', control: 'checkbox', match: 'custom'}
    ];

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'filters[0].control')?.fix).toBe('list them in values of the field customer');
    expect(issueAt(errors, 'filters[1].control')?.fix).toBe('use text for number');
    expect(issueAt(errors, 'filters[2].name')?.message).toBe('the table uses the filter search itself');
    expect(issueAt(errors, 'filters[4].name')?.message).toBe('the key totalFrom of the filters is already taken');
    expect(issueAt(errors, 'filters[5].rule')?.message).toBe('a custom match needs its rule in words');
  });

  it('answers a field of a paid module with one line, and takes it with the module', () => {
    const spec = <BroTableSpec & {config: Record<string, unknown>}>orders();

    spec.config.rowDetailsIsland = true;

    expect(validateSpec(spec).errors).toEqual([{
      path: 'config.rowDetailsIsland',
      message: 'rowDetailsIsland belongs to the paid module @table-bro-extended/island-details, which this server does not load; without it the table shows the fail state',
      fix: 'install @table-bro-extended/island-details and start the server with --extension @table-bro-extended/island-details, or use ordinary row details, rowDetailsComponent'
    }]);

    const extension = {
      package: '@table-bro-extended/island-details',
      config: {
        rowDetailsIsland: (value: unknown, path: string, issues: BroSpecIssues) => {
          if (typeof value !== 'boolean') {
            issues.error(path, 'expected true or false');
          }
        }
      }
    };

    expect(validateSpec(spec, {extensions: [extension]}).errors).toEqual([]);
  });

  it('checks the CSS variables and their values', () => {
    const spec = orders();

    spec.cssVars = {
      '--bro-row-height': '64',
      '--bro-duration-scale': '0',
      '--bro-row-padding': '8px',
      '--mat-sys-primary': 'red',
      '--bro-refresh-overlay-opacity': '1.5',
      '--bro-details-duration': '300ms'
    };

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, "cssVars['--bro-row-height']")?.message).toBe('expected a length in px, rem or em, as 64px');
    expect(issueAt(errors, "cssVars['--bro-duration-scale']")?.message).toContain('prefers-reduced-motion');
    expect(issueAt(errors, "cssVars['--bro-row-padding']")?.message).toContain('need changes of SCSS');
    expect(issueAt(errors, "cssVars['--mat-sys-primary']")?.message).toBe('the spec sets only the --bro-* variables of Table, Bro');
    expect(issueAt(errors, "cssVars['--bro-refresh-overlay-opacity']")?.message).toBe('expected a value up to 1');
    expect(issueAt(errors, "cssVars['--bro-details-duration']")).toBeUndefined();
  });

  it('takes the variables of the Filter Drawer in every skin', () => {
    const spec = orders();

    spec.cssVars = {'--bro-filter-drawer-width': '400px', '--bro-shadow-size': '24px'};

    for (const skin of ['mat', 'bs', 'nv', undefined] as const) {
      expect(validateSpec(spec, {skin})).toEqual({valid: true, errors: [], warnings: []});
    }
  });

  it('requires the icons of the toolbar buttons for the mat skin', () => {
    const spec = orders();

    spec.toolbar = {buttons: [{title: 'Export', action: 'export'}, {title: 'Toggle', action: 'bro-filters-toggle', icon: 'filter_list'}]};

    expect(issueAt(validateSpec(spec).errors, 'toolbar.buttons[0].icon')).toBeDefined();
    expect(issueAt(validateSpec(spec, {skin: 'bs'}).errors, 'toolbar.buttons[0].icon')).toBeUndefined();
    expect(issueAt(validateSpec(spec).errors, 'toolbar.buttons[1].action')?.message).toBe('the actions that start with bro- belong to the table');
  });

  it('checks the settings and the functions of a skin', () => {
    const spec = orders();

    spec.skinConfig = {
      mat: {callbacks: [{path: 'components.sortHeader.afterRender', does: 'add a tooltip'}]},
      nv: {
        components: {paginator: {selector: 'app-pager'}, sortHeader: {afterRender: 'add a tooltip'}, toolbarMain: {buttons: []}},
        callbacks: [{path: 'components.filterDrawer.beforeRender', does: 'change the close button'}]
      }
    };

    const {errors, warnings} = validateSpec(spec);

    expect(issueAt(errors, 'skinConfig.mat.callbacks[0].path')?.message).toContain('the mat skin does not call');
    expect(issueAt(errors, 'skinConfig.nv.components.sortHeader.afterRender')?.message).toBe('a function');
    expect(issueAt(errors, 'skinConfig.nv.components.toolbarMain.buttons')?.message).toContain('toolbar of the spec');
    expect(issueAt(errors, 'skinConfig.nv.callbacks[0].path')?.message).toContain('outside of the table');
    expect(issueAt(warnings, 'skinConfig.nv.components.paginator.selector')?.message).toContain('BroPaginatorElement');
  });

  it('rejects the classes of the elements of the mat skin', () => {
    const spec = orders();

    spec.skinConfig = {mat: {components: {paginator: {css: {ul: {className: 'pages'}}}}}};

    expect(issueAt(validateSpec(spec).errors, 'skinConfig.mat.components.paginator.css')?.message).toBe('the elements of the mat skin are Angular components and read no classes of the config');
  });

  it('checks the rows by the fields', () => {
    const spec = orders();

    spec.rows = [
      {number: 'A-1', customer: 'Ada', total: '12', status: 'payed', tags: ['new'], color: 'red'}
    ];

    const {errors} = validateSpec(spec);

    expect(issueAt(errors, 'rows[0].total')?.message).toBe('expected a number');
    expect(issueAt(errors, 'rows[0].status')?.fix).toBe('did you mean paid?');
    expect(issueAt(errors, 'rows[0].color')?.message).toBe('no field color in fields');

    delete spec.rows;

    expect(issueAt(validateSpec(spec, {rowsRequired: true}).errors, 'rows')).toBeDefined();
  });

  it('checks the limits of the site', () => {
    const spec = orders();

    spec.rows = [spec.rows![0], {...spec.rows![0], customer: 'x'.repeat(201)}];

    const {errors} = validateSpec(spec, {limits: {cols: 5, rows: 1, valueLength: 200}});

    expect(errors.map(issue => issue.path)).toEqual(['rows[1].customer', 'cols', 'rows']);
  });

  it('rejects a spec that is not an object', () => {
    expect(validateSpec('table').errors).toEqual([{path: '', message: 'the spec is not an object', fix: 'pass a BroTableSpec object'}]);
  });
});

describe('rowsSchema', () => {
  it('gives every value of a row the type of its field', () => {
    const schema = <{properties: {rows: {items: {required: string[]; additionalProperties: boolean; properties: Record<string, unknown>}}}}>rowsSchema(orders().fields);
    const row = schema.properties.rows.items;

    expect(row.required).toEqual(['number', 'customer', 'total', 'status', 'tags']);
    expect(row.additionalProperties).toBe(false);
    expect(row.properties.total).toEqual({type: 'number'});
    expect(row.properties.status).toEqual({type: 'string', enum: ['paid', 'pending', 'refunded']});
    expect(row.properties.tags).toEqual({type: 'array', items: {type: 'string'}});
  });
});

describe('rowDetailsByDefault', () => {
  it('asks for row details by default, as a warning', () => {
    const spec = orders();

    expect(rowDetailsByDefault({...spec, config: {...spec.config, rowDetailsComponent: {cell: 'details'}}})).toEqual([]);
    expect(rowDetailsByDefault({...spec, config: {toolbarTitle: 'Orders'}}).map(issue => issue.path)).toEqual(['config.rowDetailsComponent']);
    expect(rowDetailsByDefault(undefined).map(issue => issue.path)).toEqual(['config.rowDetailsComponent']);
  });
});

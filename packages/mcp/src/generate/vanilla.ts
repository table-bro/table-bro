import type {BroMcpExtension}                                                                    from '../extension.js';
import {cssVariables}                                                                            from '../spec/css-variables.js';
import type {BroSpecSkin, BroTableSpec}                                                          from '../spec/spec.js';
import {type BroGeneratedFile, type BroTableFiles, cellDescription, colsValue, modelDescription} from './angular.js';
import {byColumns, cellCode}                                                                     from './cells.js';
import {imports, literal, quote}                                                                 from './code.js';
import {configCode}                                                                              from './config.js';
import type {BroSpecFillings}                                                                    from './fillings.js';
import {BroFiltersCode}                                                                          from './filters.js';
import {BroNames}                                                                                from './names.js';
import {rowTypeCode}                                                                             from './rows.js';

/**
 * The table for a page without a framework, in the skins bs and nv: an ES module with a function that renders
 * <table-bro> into a container, with its cells, its filter drawer and its CSS variables. The module imports the config
 * of the skin from its package; the setup of the project registers the skin with the optional elements of the table.
 */
export function vanillaTable(spec: BroTableSpec, skin: BroSpecSkin, fillings: BroSpecFillings, tagSuffix: string = '', extensions: BroMcpExtension[] = []): BroTableFiles {
  const names = BroNames.of(spec, tagSuffix);
  const folder = names.folder;
  const config = spec.config ?? {};
  const server = Boolean(config.server);
  const filters = new BroFiltersCode(spec, fillings);
  const hasFilters = filters.filters.length > 0;
  const specRows = Boolean(spec.rows?.length) && !server;
  const cells = (spec.cells ?? []).map(cell => cellCode(spec, cell, 'vanilla', fillings.cells?.[cell.name]?.[skin], tagSuffix));
  const conf = configCode(spec, skin, fillings, '', tagSuffix, extensions);

  const files: BroGeneratedFile[] = [];
  const todo: string[] = [];

  for (const cell of byColumns(spec, cells)) {
    files.push({path: `${folder}/${cell.file}.ts`, content: cell.content, description: cellDescription(cell)});

    if (!cell.filled) {
      todo.push(`${folder}/${cell.file}.ts: write the render() of the ${cell.cell.kind === 'details' ? 'row details' : 'cell'}: ${cell.cell.shows}`);
    }
  }

  const actions = [
    ...(spec.cells ?? []).filter(cell => cell.kind !== 'details').flatMap(cell => cell.actions ?? []),
    ...(spec.toolbar?.buttons ?? []).map(button => button.action),
    ...(spec.toolbar?.menu?.items ?? []).map(item => item.action)
  ];
  const detailsButton = spec.cols.some(col => col.component && 'element' in col.component && col.component.element === 'details-button');

  const tableBro = [
    ...conf.imports['@table-bro/core'], 'type BroCol', 'type TableBroHTMLElement',
    ...(server ? ['type BroQuery'] : []),
    ...(hasFilters ? ['dispatchAction', 'defineTableBroFilterDrawerContainer'] : []),
    ...((hasFilters || detailsButton || server) ? ['events'] : [])
  ];

  const cssVars = Object.entries(spec.cssVars ?? {});
  const tableVars = cssVars.filter(([name]) => cssVariables.find(item => item.name === name)?.target !== 'drawer');
  const drawerVars = hasFilters ? cssVars.filter(([name]) => cssVariables.find(item => item.name === name)?.target !== 'table') : [];
  const shadows = (config.shadowsEnabled !== false);

  const body: string[] = [];

  if (cells.length) {
    body.push('  defineCustomElements();', '');
  }

  body.push(
    '  const table = document.createElement(\'table-bro\');',
    '',
    `  table.id = '${names.tableId}';`,
    // The table reads its variables once a render, so they are set before configure
    ...tableVars.map(([name, value]) => `  table.style.setProperty('${name}', '${value}');`),
    '',
    `  table.configure({cols${specRows ? ', rows' : ''}, conf});`
  );

  if (!specRows && !server) {
    body.push('', '  // TODO: load the rows and set them with table.replaceRows(rows)');
  }

  // The page delivers the rows of each query, as the page of Angular does: the first page of other filters or of
  // another sort replaces the rows, the next pages of the same query add to them
  if (server) {
    body.push(
      '',
      '  /** The filters and the sort of the rows the table has: another query starts from the first page. */',
      '  let loadedQuery: string = \'\';',
      '  /** The last query: an answer to an older one comes late and is left out. */',
      `  let lastQuery: BroQuery<${spec.rowType}> | undefined;`,
      '',
      `  const onQueryTable = (query: BroQuery<${spec.rowType}>): void => {`,
      '    const queryKey: string = JSON.stringify([query.filter, query.sort]);',
      '',
      '    lastQuery = query;',
      '',
      `    loadPage(query).then(({rows, total}: ${names.apiPageType}) => {`,
      '      if (query !== lastQuery) {',
      '        return;',
      '      }',
      '',
      '      // One batch for one delivery: the rows go with the total of the same answer; an empty answer to a query with',
      '      // a search or filters is the state of no rows found',
      '      if (queryKey !== loadedQuery) {',
      '        loadedQuery = queryKey;',
      '        table.replaceRows(rows, {total, emptyState: Object.values(query.filter ?? {}).some(value => value !== undefined && value !== null && value !== \'\') ? \'not-found\' : undefined});',
      '      } else {',
      '        table.appendRows(rows, {total});',
      '      }',
      '    }, () => {',
      '      // A failed load shows the failure state of the table',
      '      if (query === lastQuery) {',
      '        table.setState(\'fail\');',
      '      }',
      '    });',
      '  };'
    );
  }

  const cases: string[] = [];

  if (server) {
    cases.push(
      '      case events.filtersServerLoadedEvent:',
      '        onQueryTable(event.detail.data);',
      '        break;'
    );
  }

  const customActions = [...new Set(actions)];

  for (const action of customActions) {
    const row = (spec.cells ?? []).some(cell => cell.actions?.includes(action));

    cases.push(`      case ${quote(action)}:`, `        // TODO: ${row ? 'the row is event.detail.data?.row' : 'the action of the toolbar'}`, '        break;');
  }

  if (cases.length) {
    body.push(
      '',
      // The names of the custom actions let the switch narrow the data of the actions of the table
      `  table.addEventListener<${spec.rowType}, ${customActions.map(quote).join(' | ') || 'never'}>('bro-action', event => {`,
      '    switch (event.detail.action) {',
      ...cases,
      '    }',
      '  });'
    );
  }

  if (hasFilters) {
    body.push(
      '',
      '  // The filters live outside of the table, in the drawer next to it; the Filters button of the toolbar opens it',
      '  defineTableBroFilterDrawerContainer();',
      '',
      '  const drawer: HTMLElement = document.createElement(\'table-bro-filter-drawer-container\');',
      '',
      `  drawer.id = '${names.drawerId}';`,
      ...(shadows ? ['  drawer.className = \'bro-table-shadow-container\';'] : []),
      `  drawer.setAttribute('skin', '${skin}');`,
      ...drawerVars.map(([name, value]) => `  drawer.style.setProperty('${name}', '${value}');`),
      '',
      `  const filters = render${names.filtersClass}((value: ${names.filtersType}) => {`,
      '    dispatchAction(table, events.filtersFilterEvent, value);',
      '  });',
      '',
      '  drawer.append(table, filters);',
      '  container.append(drawer);'
    );
  } else if (shadows) {
    body.push(
      '',
      '  // The shadows of the table fall into the margins of this element: the visible table takes its full width',
      '  const host: HTMLElement = document.createElement(\'div\');',
      '',
      '  host.className = \'bro-table-shadow-container\';',
      '  host.append(table);',
      '  container.append(host);'
    );
  } else {
    body.push('', '  container.append(table);');
  }

  // The table asks for the next pages and for the first page of other filters; the page asks for its first page
  if (server) {
    body.push('', `  onQueryTable({page: 1, pageSize: ${config.pageSize ?? 5}});`);
  }

  body.push('', '  return table;');

  const localModules: Record<string, string[]> = {
    [`./${names.kebab}`]: [`type ${spec.rowType}`, ...(hasFilters ? [`type ${names.filtersType}`] : [])],
    ...Object.fromEntries(cells.map(cell => [`./${cell.file}`, [cell.className]])),
    ...(hasFilters ? {[`./${names.filtersFile}`]: [`render${names.filtersClass}`]} : {})
  };

  const module = [
    imports({...conf.imports, '@table-bro/core': tableBro, ...localModules}),
    '',
    ...conf.preamble.flatMap(declaration => [declaration, '']),
    `const cols: BroCol<${spec.rowType}>[] = ${literal(colsValue(spec, skin, cells))};`,
    '',
    ...(specRows ? [`const rows: ${spec.rowType}[] = ${literal(spec.rows)};`, ''] : []),
    `const conf: BroConfig<${spec.rowType}> = ${conf.code};`,
    '',
    `/** Renders the table of the type ${spec.rowType} into the container and returns it. */`,
    `export function render${spec.rowType}Table(container: HTMLElement): TableBroHTMLElement {`,
    ...body,
    '}',
    ...(server
      ? [
          '',
          '/** An answer of your API: the rows of a page and the number of all rows. Replace it with the answer of your API. */',
          `interface ${names.apiPageType} {`,
          `  rows: ${spec.rowType}[];`,
          '  total: number;',
          '}',
          '',
          '/** A page of the query: the request of your API, and its answer as the rows of the table with their total. */',
          `function loadPage(query: BroQuery<${spec.rowType}>): Promise<${names.apiPageType}> {`,
          '  // TODO: the address of your API, and its parameters for the sort (query.sort), the search and the filters (query.filter)',
          '  const params: URLSearchParams = new URLSearchParams({page: `${query.page}`, pageSize: `${query.pageSize}`});',
          '',
          `  return fetch(\`/api/${names.kebab}s?\${params}\`).then((response: Response) => {`,
          '    if (!response.ok) {',
          '      throw new Error(`${response.status} ${response.statusText}`);',
          '    }',
          '',
          '    return response.json();',
          '  });',
          '}'
        ]
      : []),
    ...(cells.length
      ? [
          '',
          '/** The cells are Custom Elements: the table creates them by their tags, so they are defined before it. */',
          'function defineCustomElements(): void {',
          `  if (customElements.get(${quote(cells[0].tag)})) {`,
          '    return;',
          '  }',
          '',
          ...cells.map(cell => `  customElements.define(${quote(cell.tag)}, ${cell.className});`),
          '}'
        ]
      : []),
    ''
  ].join('\n');

  files.unshift(
    {path: `${folder}/${names.kebab}.ts`, content: rowTypeCode(spec), description: modelDescription(hasFilters)},
    {path: `${folder}/${names.kebab}-table.ts`, content: module, description: `the table. Here are its columns, \`cols\`${specRows ? ', its rows, `rows`,' : ''} and its config, \`conf\`, and its rendering.`}
  );

  // The filters matter least to a reader: their form comes last
  if (hasFilters) {
    files.push({path: `${folder}/${names.filtersFile}.ts`, content: filters.vanillaForm(skin), description: 'the filters of the drawer: their form, which gives the table its filter.'});
  }

  if (server) {
    todo.push(`${folder}/${names.kebab}-table.ts: the address of your API in loadPage, and the map of the query of the table to its parameters and of its answer to the rows with their total`);
  }

  if (!specRows && !server) {
    todo.push(`${folder}/${names.kebab}-table.ts: load the rows and set them with table.replaceRows(rows)`);
  }

  return {files, todo};
}

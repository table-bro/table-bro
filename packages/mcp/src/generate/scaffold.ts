import type {BroSpecField, BroSpecFilter, BroSpecSkin, BroTableSpec} from '../spec/spec.js';
import {type BroSpecReport, validateSpec}                            from '../spec/validate-spec.js';
import {cellCode}                                                    from './cells.js';
import {literal, quote}                                              from './code.js';
import {type BroCellFilling, fillingErrors}                          from './fillings.js';
import {BroFiltersCode}                                              from './filters.js';
import {BroNames}                                                    from './names.js';
import type {BroTarget}                                              from './setup.js';

export interface BroScaffoldRequest {
  kind: 'cell' | 'details' | 'filters';
  target: BroTarget;
  skin: BroSpecSkin;
  rowType: string;
  /** The fields of the row: the names for a cell, the names and types for filters. */
  fields: BroSpecField[];
  /** A cell or details: its name in kebab-case. */
  name?: string;
  /** A cell or details: what it shows, in words. */
  shows?: string;
  /** A cell: the fields it reads. */
  reads?: string[];
  /** A cell: the actions it sends. */
  actions?: string[];
  filters?: BroSpecFilter[];
  filling?: BroCellFilling;
}

export interface BroScaffold {
  report: BroSpecReport;
  /** The file from the folder of the page. */
  path: string;
  content: string;
  /** How the page connects it: the registration and the column, or the container of the Filter Drawer. */
  connect: string;
}

/**
 * One component for an existing table: a cell, the row details or the filters of the Filter Drawer, by the recipe
 * of the generator. The request is checked as a small spec, so the messages are the messages of validate_spec.
 */
export function scaffoldComponent(request: BroScaffoldRequest): BroScaffold {
  const {kind, target, skin, rowType} = request;
  const cell = (kind !== 'filters') ? {name: request.name ?? kind, kind: kind === 'details' ? <const>'details' : <const>'cell', shows: request.shows ?? '', fields: request.reads ?? [], actions: request.actions} : undefined;
  const spec: BroTableSpec = {
    specVersion: 1,
    rowType,
    fields: request.fields,
    cols: (kind === 'cell') ? [{title: '', component: {cell: cell!.name}}] : [{title: '', name: request.fields[0]?.name}],
    cells: cell ? [cell] : undefined,
    filters: (kind === 'filters') ? request.filters : undefined,
    config: (kind === 'details') ? {rowDetailsComponent: {cell: cell!.name}} : undefined
  };

  const report = validateSpec(spec, {skin});

  if (target === 'vanilla' && skin === 'mat') {
    report.valid = false;
    report.errors.push({path: '', message: 'the mat skin is for Angular', fix: 'use the target angular, or the skin bs or nv'});
  }

  if (kind === 'filters' && !request.filters?.length) {
    report.valid = false;
    report.errors.push({path: 'filters', message: 'the filters of the drawer need at least one filter', fix: 'give the filters as the filters of a spec, get_docs topic filters'});
  }

  if (kind !== 'filters' && request.filling !== undefined) {
    const fillingIssues = fillingErrors(request.filling, 'filling');

    report.valid &&= !fillingIssues.length;
    report.errors.push(...fillingIssues);
  }

  if (!report.valid) {
    return {report, path: '', content: '', connect: ''};
  }

  if (kind === 'filters') {
    const filters = new BroFiltersCode(spec);

    return {
      report,
      path: `${BroNames.of(spec).filtersFile}.ts`,
      content: (target === 'angular') ? filters.angularComponent(skin) : filters.vanillaForm(skin),
      connect: [
        `The type of the filters, next to the type ${rowType}:\n\n\`\`\`ts\n${filters.typeCode()}\n\`\`\``,
        `filtersTransform of the local mode, in the config:\n\n\`\`\`ts\nfiltersTransform: ${filters.transformCode()}\n\`\`\``,
        'The container of the Filter Drawer around the table: see get_docs with the topic filters.'
      ].join('\n\n')
    };
  }

  const code = cellCode(spec, cell!, target, request.filling);
  const define = code.angular ? `customElements.define(${quote(code.tag)}, createCustomElement(${code.className}, {injector: this.injector}));` : `customElements.define(${quote(code.tag)}, ${code.className});`;
  const use = (kind === 'details') ? `In the config: rowDetailsComponent: ${quote(code.tag)}` : `The column:\n\n\`\`\`ts\n${literal({title: '', component: {selector: code.tag, event: cell!.actions?.length ? 'action' : undefined}})}\n\`\`\``;

  return {
    report,
    path: `${code.file}.ts`,
    content: code.content,
    connect: [`The registration, once before the table is created, with a customElements.get guard:\n\n\`\`\`ts\n${define}\n\`\`\``, use].join('\n\n')
  };
}

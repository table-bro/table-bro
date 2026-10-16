import type {BroTableSpec}     from '../spec/spec.js';
import {blockComment, imports} from './code.js';
import {BroFiltersCode}        from './filters.js';

/** The file of the type of the row and of the type of its filters. */
export function rowTypeCode(spec: BroTableSpec): string {
  const filters = new BroFiltersCode(spec);

  return [
    imports({'type @table-bro/core': filters.filters.length ? ['BroFilters', 'BroRow'] : ['BroRow']}),
    '',
    `export interface ${spec.rowType} extends BroRow {`,
    spec.fields.map(field => [
      ...(field.values ? [`  /** ${blockComment(field.values.join(', '))} */`] : []),
      `  ${field.name}: ${field.type};`
    ].join('\n')).join('\n'),
    '}',
    ...(filters.filters.length ? ['', filters.typeCode()] : []),
    ''
  ].join('\n');
}

/** The rule of the CSS variables on the element itself: a value from an ancestor does not reach it. */
export function cssVarsRule(id: string, vars: [string, string][]): string {
  return `#${id} {\n${vars.map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`;
}

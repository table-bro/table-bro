import type {BroMcpExtension}                                  from '../extension.js';
import {skinCallbacks}                                         from '../spec/skin-config.js';
import type {BroSpecSkin, BroSpecToolbarButton, BroTableSpec}  from '../spec/spec.js';
import {indentBlock, isPlainObject, lineComment, literal, raw} from './code.js';
import type {BroSpecFillings}                                  from './fillings.js';
import {BroFiltersCode}                                        from './filters.js';
import {BroNames}                                              from './names.js';

export interface BroConfigCode {
  /** The config as a literal. */
  code: string;
  /** Declarations before the config, as the short titles of shortColumnTitle. */
  preamble: string[];
  /** The names the config imports, by module; a type with the prefix "type ", as imports() takes it. */
  imports: Record<string, string[]>;
}

/**
 * The config of the table from the spec: the functions and the settings of the skin come from the data of the spec,
 * only the bodies of the callbacks and of the custom rules from a model.
 */
export function configCode(spec: BroTableSpec, skin: BroSpecSkin, fillings: BroSpecFillings, indent: string, tagSuffix: string = '', extensions: BroMcpExtension[] = []): BroConfigCode {
  const names = BroNames.of(spec, tagSuffix);
  const config = spec.config ?? {};
  const result: BroConfigCode = {code: '', preamble: [], imports: {'@table-bro/core': ['type BroConfig']}};
  const hasFilters = Boolean(spec.filters?.length);

  const value: Record<string, unknown> = {
    skin,
    toolbarTitle: config.toolbarTitle,
    pageSize: config.pageSize,
    server: config.server,
    rowCounter: config.rowCounter,
    shadowsEnabled: config.shadowsEnabled,
    theme: config.theme,
    rowDetailsComponent: config.rowDetailsComponent && names.tag(config.rowDetailsComponent.cell),
    rowDetailsServer: config.rowDetailsServer,
    rowDetailsMotion: config.rowDetailsMotion,
    // The fields of the paid modules are data: the generator writes them as they are
    ...Object.fromEntries(extensions.flatMap(extension => Object.keys(extension.config ?? {})).map(field => [field, (<Record<string, unknown>>config)[field]]))
  };

  const shortTitles = spec.cols.filter(col => col.shortTitle).map(col => [col.title, col.shortTitle]);

  if (shortTitles.length) {
    result.preamble.push(`/** The short titles of the columns: by them the table knows how narrow a column may be. */\nconst shortTitles: Record<string, string> = ${literal(Object.fromEntries(shortTitles))};`);
    result.imports['@table-bro/core'].push('type BroCol');
    value['shortColumnTitle'] = raw(`(col: BroCol<${spec.rowType}>) => shortTitles[col.title] ?? col.title?.split(' ')[0]`);
  }

  // The server applies the filters in the server mode
  if (hasFilters && !config.server) {
    result.imports['@table-bro/core'].push('matchesFilterCondition');
    value['filtersTransform'] = raw(new BroFiltersCode(spec, fillings).transformCode());
  }

  const components = merge({}, spec.skinConfig?.[skin]?.components ?? {});

  // The toolbar of a skin has only its search: a table with filters gets the Filters button, which opens the drawer
  if (hasFilters) {
    result.imports['@table-bro/core'].push('events');
  }

  merge(components, {toolbarMain: {buttons: toolbarButtons(spec, skin, hasFilters)}});

  // The messages of the states go into the texts: the icons stay the ones of the skin, a font icon, an emoji or an
  // animation of Lottie, which the page may give the skin
  const states = Object.entries(spec.stateMessages ?? {});

  if (states.length) {
    value['texts'] = {states: Object.fromEntries(states)};
  }

  for (const callback of spec.skinConfig?.[skin]?.callbacks ?? []) {
    const known = skinCallbacks.find(item => item.path === callback.path)!;
    const body = fillings.callbacks?.[skin]?.[callback.path]?.trim() || `// TODO: ${lineComment(callback.does)}`;
    const [, parameters, returns] = /^(\(.*?\)) => (.*)$/.exec(known.signature)!;
    const path = callback.path.split('.').slice(1);

    merge(components, <Record<string, unknown>>path.reduceRight<unknown>((item, key) => ({[key]: item}), raw(`${parameters}: ${returns} => {\n${indentBlock(body, '  ')}\n}`)));
  }

  value['components'] = components;
  value['css'] = spec.skinConfig?.[skin]?.css;

  result.code = literal(value, indent);

  return result;
}

function toolbarButtons(spec: BroTableSpec, skin: BroSpecSkin, hasFilters: boolean): unknown[] {
  const material = (skin === 'mat');
  const button = ({title, action, icon}: BroSpecToolbarButton) => material ? {buttonTitle: title, iconHTML: icon, eventType: action, buttonTooltip: title} : {buttonTitle: title, eventType: action};
  const buttons: unknown[] = [];

  if (hasFilters) {
    const eventType = raw('events.filtersToggleEvent');

    buttons.push(material ? {buttonTitle: 'Filters', iconHTML: 'filter_list', eventType, buttonTooltip: 'Filters'} : {buttonTitle: 'Filters', eventType});
  }

  buttons.push(...(spec.toolbar?.buttons ?? []).map(button));

  const menu = spec.toolbar?.menu;

  if (menu) {
    buttons.push({
      buttonTitle: menu.title,
      mode: 'navbar-dropdown',
      buttonTooltip: material ? menu.title : undefined,
      options: menu.items.map(({title, action, icon}) => ({value: action, iconHTML: material ? icon : undefined, title}))
    });
  }

  return buttons;
}

/** Merges plain objects as the table merges the config of the application over the config of the skin. */
function merge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  for (const [key, item] of Object.entries(source)) {
    const current = target[key];

    if (isPlainObject(item) && isPlainObject(current)) {
      merge(current, item);
    } else {
      target[key] = isPlainObject(item) ? merge({}, item) : item;
    }
  }

  return target;
}

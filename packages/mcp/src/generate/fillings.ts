import type {BroSpecSkin}  from '../spec/spec.js';
import type {BroSpecIssue} from '../spec/validate-spec.js';
import {isPlainObject}     from './code.js';

/**
 * The parts of the code that a model writes, by the contracts of the spec: the generator puts them into its scaffolds,
 * which are always the same and right.
 */
export interface BroSpecFillings {
  /** The cells and the row details by their names, for each skin. */
  cells?: Record<string, Partial<Record<BroSpecSkin, BroCellFilling>>>;
  /** The conditions of the filters with the match custom, by their names: the body of (row, value) => boolean. */
  filterRules?: Record<string, string>;
  /** The bodies of the functions of the skin config, by the skin and the path, as components.sortHeader.afterRender. */
  callbacks?: Partial<Record<BroSpecSkin, Record<string, string>>>;
}

/**
 * The errors of the form of fillings, each with its path: a part of another type would fail the generator. The parts
 * themselves are code, which the generator does not check; null is no part.
 */
export function fillingsErrors(fillings: unknown): BroSpecIssue[] {
  const errors: BroSpecIssue[] = [];

  if (!objectAt(fillings, 'fillings', errors)) {
    return errors;
  }

  if (objectAt(fillings['cells'], 'fillings.cells', errors)) {
    for (const [cell, skins] of Object.entries(fillings['cells'])) {
      if (objectAt(skins, `fillings.cells.${cell}`, errors)) {
        for (const [skin, filling] of Object.entries(skins)) {
          errors.push(...fillingErrors(filling, `fillings.cells.${cell}.${skin}`));
        }
      }
    }
  }

  if (objectAt(fillings['filterRules'], 'fillings.filterRules', errors)) {
    for (const [filter, body] of Object.entries(fillings['filterRules'])) {
      stringAt(body, `fillings.filterRules.${filter}`, errors);
    }
  }

  if (objectAt(fillings['callbacks'], 'fillings.callbacks', errors)) {
    for (const [skin, bodies] of Object.entries(fillings['callbacks'])) {
      if (objectAt(bodies, `fillings.callbacks.${skin}`, errors)) {
        for (const [path, body] of Object.entries(bodies)) {
          stringAt(body, `fillings.callbacks.${skin}.${path}`, errors);
        }
      }
    }
  }

  return errors;
}

/** The errors of the form of the filling of one cell or of the row details. */
export function fillingErrors(filling: unknown, path: string): BroSpecIssue[] {
  const errors: BroSpecIssue[] = [];

  if (objectAt(filling, path, errors)) {
    for (const part of ['template', 'styles', 'render', 'members']) {
      stringAt(filling[part], `${path}.${part}`, errors);
    }

    if (filling['imports'] !== undefined && filling['imports'] !== null && !Array.isArray(filling['imports'])) {
      errors.push({path: `${path}.imports`, message: 'expected an array', fix: 'see get_docs with the topic fillings'});
    }
  }

  return errors;
}

/** Whether a part is an object; a part of another type is an error, an absent one is none. */
function objectAt(value: unknown, path: string, errors: BroSpecIssue[]): value is Record<string, unknown> {
  if (value === undefined || value === null) {
    return false;
  }

  if (!isPlainObject(value)) {
    errors.push({path, message: 'expected an object', fix: 'see get_docs with the topic fillings'});

    return false;
  }

  return true;
}

function stringAt(value: unknown, path: string, errors: BroSpecIssue[]): void {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    errors.push({path, message: 'expected the code as a string', fix: 'see get_docs with the topic fillings'});
  }
}

export interface BroCellFilling {
  /**
   * Angular: the components of the project the template uses, as {name, from}. The classes of Angular Material and
   * the pipes of Angular come from the template itself (templateClasses), so a model writes no imports.
   */
  imports?: (string | {name: string; from: string})[];
  /** Angular: the template of the component, in every skin. */
  template?: string;
  /** Angular: the styles of the component. */
  styles?: string;
  /** Vanilla JS: the body of render(), which builds the DOM of the cell. */
  render?: string;
  /** Members of the class: computed values, handlers. */
  members?: string;
}

/**
 * The classes a generated component of the mat skin imports by name. The classes, not their NgModules: on the site a
 * component compiled in the browser finds nothing through an NgModule of a library.
 */
export const angularClasses: Record<string, string> = {
  'CurrencyPipe': '@angular/common',
  'DatePipe': '@angular/common',
  'DecimalPipe': '@angular/common',
  'LowerCasePipe': '@angular/common',
  'PercentPipe': '@angular/common',
  'SlicePipe': '@angular/common',
  'TitleCasePipe': '@angular/common',
  'UpperCasePipe': '@angular/common',
  'MatBadge': '@angular/material/badge',
  'MatButton': '@angular/material/button',
  'MatFabButton': '@angular/material/button',
  'MatIconButton': '@angular/material/button',
  'MatMiniFabButton': '@angular/material/button',
  'MatCheckbox': '@angular/material/checkbox',
  'MatChip': '@angular/material/chips',
  'MatChipSet': '@angular/material/chips',
  'MatDivider': '@angular/material/divider',
  'MatIcon': '@angular/material/icon',
  'MatMenu': '@angular/material/menu',
  'MatMenuItem': '@angular/material/menu',
  'MatMenuTrigger': '@angular/material/menu',
  'MatProgressBar': '@angular/material/progress-bar',
  'MatProgressSpinner': '@angular/material/progress-spinner',
  'MatSlideToggle': '@angular/material/slide-toggle',
  'MatTooltip': '@angular/material/tooltip'
};

/** The classes of a template by their selectors and pipes, in the order of angularClasses. */
const templateSelectors: [RegExp, string][] = [
  [/\|\s*currency(?![\w-])/, 'CurrencyPipe'],
  [/\|\s*date(?![\w-])/, 'DatePipe'],
  [/\|\s*number(?![\w-])/, 'DecimalPipe'],
  [/\|\s*lowercase(?![\w-])/, 'LowerCasePipe'],
  [/\|\s*percent(?![\w-])/, 'PercentPipe'],
  [/\|\s*slice(?![\w-])/, 'SlicePipe'],
  [/\|\s*titlecase(?![\w-])/, 'TitleCasePipe'],
  [/\|\s*uppercase(?![\w-])/, 'UpperCasePipe'],
  [/\bmatBadge(?![\w-])/, 'MatBadge'],
  [/\b(mat-button|mat-flat-button|mat-stroked-button|mat-raised-button|matButton)(?![\w-])/, 'MatButton'],
  [/\b(mat-fab|matFab)(?![\w-])/, 'MatFabButton'],
  [/\b(mat-icon-button|matIconButton)(?![\w-])/, 'MatIconButton'],
  [/\b(mat-mini-fab|matMiniFab)(?![\w-])/, 'MatMiniFabButton'],
  [/<mat-checkbox(?![\w-])/, 'MatCheckbox'],
  [/<mat-chip(?![\w-])/, 'MatChip'],
  [/<mat-chip-set(?![\w-])/, 'MatChipSet'],
  [/<mat-divider(?![\w-])/, 'MatDivider'],
  [/<mat-icon(?![\w-])/, 'MatIcon'],
  [/<mat-menu(?![\w-])/, 'MatMenu'],
  [/\bmat-menu-item(?![\w-])/, 'MatMenuItem'],
  [/\bmatMenuTriggerFor(?![\w-])/, 'MatMenuTrigger'],
  [/<mat-progress-bar(?![\w-])/, 'MatProgressBar'],
  [/<(mat-progress-spinner|mat-spinner)(?![\w-])/, 'MatProgressSpinner'],
  [/<mat-slide-toggle(?![\w-])/, 'MatSlideToggle'],
  [/\bmatTooltip(?![\w-])/, 'MatTooltip']
];

/**
 * The classes of angularClasses that a template uses, found by their selectors and pipes: the imports of a generated
 * component come from its template, so a model writes no imports and no NgModule gets into them.
 */
export function templateClasses(template: string): string[] {
  return templateSelectors.filter(([selector]) => selector.test(template)).map(([, name]) => name);
}

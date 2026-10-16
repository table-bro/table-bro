import type {BroSpecField, BroSpecFilter, BroSpecSkin, BroTableSpec}                                          from '../spec/spec.js';
import {escapeHtml, escapeTemplate, imports, importsField, indentBlock, lineComment, objectKey, templateText} from './code.js';
import type {BroSpecFillings}                                                                                 from './fillings.js';
import {BroNames}                                                                                             from './names.js';

/** A key of the object of the filters: a range gives two. */
interface BroFilterKey {
  key: string;
  type: 'string' | 'number' | 'boolean';
  label: string;
}

/**
 * The filters of a spec as code: the type of the object of the filters, the component of the Filter Drawer, and
 * filtersTransform of the local mode.
 */
export class BroFiltersCode {
  private readonly names: BroNames;
  private readonly fields: Map<string, BroSpecField>;

  constructor(private spec: BroTableSpec, private fillings: BroSpecFillings = {}) {
    this.names = BroNames.of(spec);
    this.fields = new Map(spec.fields.map(field => [field.name, field]));
  }

  get filters(): BroSpecFilter[] {
    return this.spec.filters ?? [];
  }

  /** The type of the object of the filters, after the type of the row. */
  typeCode(): string {
    return [
      `export type ${this.names.filtersType} = BroFilters<${this.spec.rowType}, {`,
      ...this.keys().map(({key, type}) => `  ${key}?: ${type};`),
      '}>;'
    ].join('\n');
  }

  /** filtersTransform of the local mode: every filter limits the rows, a cleared one is undefined and limits nothing. */
  transformCode(): string {
    const {rowType} = this.spec;
    const rules: string[] = [];
    const conditions: string[] = [];

    for (const filter of this.filters) {
      const value = `filters.${filter.name}`;
      const row = filter.field ? `row.${filter.field}` : '';

      if (filter.match === 'custom') {
        const name = `matches${filter.name[0].toUpperCase()}${filter.name.slice(1)}`;
        const filled = this.fillings.filterRules?.[filter.name]?.trim();
        const body = filled || `// TODO: ${lineComment(filter.rule!)}\nreturn true;`;
        // A written rule without the value of its filter, as a checkbox, takes only the row
        const withValue = !filled || /\bvalue\b/.test(filled);

        rules.push(`// ${lineComment(filter.label)}: ${lineComment(filter.rule!)}`, `const ${name} = (row: ${rowType}${withValue ? `, value: ${this.valueType(filter)}` : ''}): boolean => {`, indentBlock(body, '  '), '};', '');
        conditions.push(`(${value} === undefined || ${name}(row${withValue ? `, ${value}` : ''}))`);
      } else if (filter.control === 'range') {
        conditions.push(`matchesFilterCondition(${row}, {gte: filters.${filter.name}From, lte: filters.${filter.name}To})`);
      } else if (this.fields.get(filter.field!)?.type === 'string[]') {
        conditions.push(`(${value} === undefined || ${row}.includes(${value}))`);
      } else {
        conditions.push(`matchesFilterCondition(${row}, {${filter.match ?? (filter.control === 'text' ? 'contains' : 'eq')}: ${value}})`);
      }
    }

    const filterRows = `return rows.filter((row: ${rowType}) => {\n  return ${conditions.join('\n    && ')};\n});`;

    if (!rules.length) {
      return `(rows: ${rowType}[], filters: ${this.names.filtersType}) => rows.filter((row: ${rowType}) => {\n  return ${conditions.join('\n    && ')};\n})`;
    }

    return `(rows: ${rowType}[], filters: ${this.names.filtersType}) => {\n${indentBlock([...rules, filterRows].join('\n'), '  ')}\n}`;
  }

  /** The Angular component of the filters: the content of the Filter Drawer, with the fields of the skin. */
  angularComponent(skin: BroSpecSkin): string {
    const material = (skin === 'mat');
    const angularModules: Record<string, string[]> = {
      '@angular/core': ['ChangeDetectionStrategy', 'Component', 'EventEmitter', 'Output'],
      '@angular/core/rxjs-interop': ['takeUntilDestroyed'],
      '@angular/forms': ['FormControl', 'FormGroup', 'ReactiveFormsModule']
    };

    if (material) {
      const controls = new Set(this.filters.map(filter => filter.control));

      Object.assign(angularModules, {
        '@angular/material/button': ['MatButton'],
        '@angular/material/icon': ['MatIcon'],
        '@angular/material/checkbox': controls.has('checkbox') ? ['MatCheckbox'] : [],
        '@angular/material/form-field': (controls.has('text') || controls.has('select') || controls.has('range')) ? ['MatFormField', 'MatLabel'] : [],
        '@angular/material/input': (controls.has('text') || controls.has('range')) ? ['MatInput'] : [],
        '@angular/material/select': controls.has('select') ? ['MatOption', 'MatSelect'] : []
      });
    }

    const classes = Object.fromEntries(Object.entries(angularModules)
      .filter(([module]) => module === '@angular/forms' || module.startsWith('@angular/material/'))
      .map(([module, names]) => [module, (module === '@angular/forms') ? ['ReactiveFormsModule'] : names]));

    const markup = this.filters.map(filter => this.angularField(filter, skin)).join('\n\n');
    const clear = {
      mat: '<button matButton type="button" (click)="form.reset()">\n    <mat-icon>filter_list_off</mat-icon>\n    Clear\n  </button>',
      bs: '<button type="button" class="nav-link px-0" (click)="form.reset()">Clear</button>',
      nv: '<a href="" class="bro-nav-link" (click)="$event.preventDefault(); form.reset()">Clear</a>'
    }[skin];

    const template = `<form [formGroup]="form">\n${indentBlock(markup, '  ')}\n\n  ${clear}\n</form>`;

    return [
      imports({
        ...angularModules,
        rxjs: ['debounceTime'],
        [`./${this.names.kebab}`]: [`type ${this.names.filtersType}`]
      }),
      '',
      '/**',
      ' * The filters of the Filter Drawer next to the table: the page gives them to the table with its input filter.',
      ' * The output is a decorator (@Output), as in the cells of this table.',
      ' */',
      '@Component({',
      `  selector: '${this.names.filtersSelector}',`,
      `  template: \`\n${indentBlock(templateText(template), '      ')}\`,`,
      `  styles: \`\n${indentBlock(styles[skin], '      ')}\`,`,
      '  changeDetection: ChangeDetectionStrategy.OnPush,',
      importsField(classes),
      '})',
      `export class ${this.names.filtersClass} {`,
      `  @Output() changeFilter: EventEmitter<${this.names.filtersType}> = new EventEmitter<${this.names.filtersType}>();`,
      '',
      '  form = new FormGroup({',
      this.keys().map(({key, type}) => `    ${objectKey(key)}: new FormControl<${type} | null>(null)`).join(',\n'),
      '  });',
      '',
      '  constructor() {',
      '    // The table accumulates the changes of its filters, so a cleared field goes as an empty value',
      '    this.form.valueChanges.pipe(debounceTime(400), takeUntilDestroyed()).subscribe(value => {',
      '      this.changeFilter.emit({',
      this.keys().map(({key, type}) => `        ${objectKey(key)}: value.${key} ${type === 'number' ? '??' : '||'} undefined`).join(',\n'),
      '      });',
      '    });',
      '  }',
      '}',
      ''
    ].join('\n');
  }

  /** The form of the filters in Vanilla JS: the content of the Filter Drawer with slot="filters". */
  vanillaForm(skin: BroSpecSkin): string {
    // The native fields have no classes of a library: the form brings their rules
    const style = (skin === 'nv') ? `<style>\n${indentBlock(styles.nv.replace(/\.app-native-field/g, `.${this.names.filtersSelector} .app-native-field`), '  ')}\n</style>\n\n` : '';
    const markup = style + this.filters.map(filter => this.vanillaField(filter, skin)).join('\n\n');
    const clear = (skin === 'bs') ? '<button type="button" class="nav-link px-0 app-filters-clear">Clear</button>' : '<a href="" class="bro-nav-link app-filters-clear">Clear</a>';
    const read = this.keys().map(({key, type}) => {
      if (type === 'number') {
        return `    ${objectKey(key)}: data.get('${key}') ? Number(data.get('${key}')) : undefined`;
      }

      return (type === 'boolean') ? `    ${objectKey(key)}: data.has('${key}') || undefined` : `    ${objectKey(key)}: (data.get('${key}') as string) || undefined`;
    });

    return [
      imports({[`type ./${this.names.kebab}`]: [this.names.filtersType]}),
      '',
      '/**',
      ' * The form of the filters in the Filter Drawer next to the table, with slot="filters". It reports the filters',
      ' * on every change; a cleared field goes as an empty value, as the table accumulates the changes of its filters.',
      ' */',
      `export function render${this.names.filtersClass}(onChange: (filters: ${this.names.filtersType}) => void): HTMLFormElement {`,
      '  const form: HTMLFormElement = document.createElement(\'form\');',
      '',
      `  form.className = '${this.names.filtersSelector}';`,
      '  form.setAttribute(\'slot\', \'filters\');',
      '  form.setAttribute(\'autocomplete\', \'off\');',
      `  form.innerHTML = \`\n${indentBlock(templateText(`${markup}\n\n${clear}`), '    ')}\`;`,
      '',
      '  const report = () => {',
      '    const data = new FormData(form);',
      '',
      '    onChange({',
      read.map(line => '  ' + line).join(',\n'),
      '    });',
      '  };',
      '',
      '  form.addEventListener(\'input\', report);',
      '  form.querySelector(\'.app-filters-clear\')!.addEventListener(\'click\', (event: Event) => {',
      '    event.preventDefault();',
      '',
      '    form.reset();',
      '    report();',
      '  });',
      '',
      '  return form;',
      '}',
      ''
    ].join('\n');
  }

  keys(): BroFilterKey[] {
    return this.filters.flatMap(filter => {
      if (filter.control === 'range') {
        return [
          {key: `${filter.name}From`, type: 'number', label: `${filter.label} from`},
          {key: `${filter.name}To`, type: 'number', label: `${filter.label} to`}
        ];
      }

      return [{key: filter.name, type: this.valueType(filter), label: filter.label}];
    });
  }

  private valueType(filter: BroSpecFilter): 'string' | 'number' | 'boolean' {
    return (filter.control === 'checkbox') ? 'boolean' : (filter.control === 'range') ? 'number' : 'string';
  }

  private options(filter: BroSpecFilter): string[] {
    return this.fields.get(filter.field ?? '')?.values ?? [];
  }

  private angularField(filter: BroSpecFilter, skin: BroSpecSkin): string {
    const label = escapeTemplate(filter.label);
    const keys = this.keys().filter(({key}) => key === filter.name || key === `${filter.name}From` || key === `${filter.name}To`);

    if (skin === 'mat') {
      switch (filter.control) {
        case 'text':
          return matField(label, `<input matInput type="search" formControlName="${filter.name}">`);
        case 'select':
          return matField(label, [
            `<mat-select formControlName="${filter.name}">`,
            '  <mat-option [value]="null">Any</mat-option>',
            ...this.options(filter).map(option => `  <mat-option value="${escapeTemplate(option)}">${escapeTemplate(option)}</mat-option>`),
            '</mat-select>'
          ].join('\n'));
        case 'range':
          return `<div class="app-filter-range">\n${indentBlock(keys.map(({key, label}) => matField(escapeTemplate(label), `<input matInput type="number" formControlName="${key}">`)).join('\n'), '  ')}\n</div>`;
        default:
          return `<mat-checkbox class="app-filter" formControlName="${filter.name}">${label}</mat-checkbox>`;
      }
    }

    return this.htmlField(filter, skin, true);
  }

  private vanillaField(filter: BroSpecFilter, skin: BroSpecSkin): string {
    return this.htmlField(filter, skin, false);
  }

  /** A field of the bs or the nv skin: Angular binds it with formControlName, Vanilla JS reads it by its name. */
  private htmlField(filter: BroSpecFilter, skin: BroSpecSkin, angular: boolean): string {
    const escape = angular ? escapeTemplate : escapeHtml;
    const bootstrap = (skin === 'bs');
    const bind = (key: string) => angular ? `formControlName="${key}"` : `name="${key}"`;
    const input = (key: string, type: string) => `<input type="${type}"${bootstrap ? ' class="form-control mt-1"' : ''} ${bind(key)}>`;
    const field = (label: string, control: string) => {
      return bootstrap ? `<label class="form-label w-100 mb-2">\n  ${label}\n  ${control}\n</label>` : `<label class="app-native-field">\n  ${label}\n  ${control}\n</label>`;
    };

    switch (filter.control) {
      case 'text':
        return field(escape(filter.label), input(filter.name, 'search'));
      case 'select': {
        const empty = angular ? '<option [ngValue]="null">Any</option>' : '<option value="">Any</option>';
        const options = this.options(filter).map(option => `<option value="${escape(option)}">${escape(option)}</option>`);

        return field(escape(filter.label), [`<select${bootstrap ? ' class="form-select mt-1"' : ''} ${bind(filter.name)}>`, `  ${empty}`, ...options.map(option => `  ${option}`), '</select>'].join('\n  '));
      }

      case 'range':
        return this.keys()
          .filter(({key}) => key === `${filter.name}From` || key === `${filter.name}To`)
          .map(({key, label}) => field(escape(label), input(key, 'number')))
          .join('\n');
      default:
        return bootstrap ? `<div class="form-check mb-2">\n  <label class="form-check-label">\n    <input type="checkbox" class="form-check-input" ${bind(filter.name)}>\n    ${escape(filter.label)}\n  </label>\n</div>` : `<label class="app-native-field">\n  <input type="checkbox" ${bind(filter.name)}>\n  ${escape(filter.label)}\n</label>`;
    }
  }
}

/** A field of Angular Material as the filters of table-bro.com: without the place of the hint, the styles space the fields. */
function matField(label: string, control: string): string {
  return `<mat-form-field class="app-filter" subscriptSizing="dynamic">\n  <mat-label>${label}</mat-label>\n${indentBlock(control, '  ')}\n</mat-form-field>`;
}

const styles: Record<BroSpecSkin, string> = {
  // The fields have no fill and stand 16 px apart, as the filters of table-bro.com
  mat: ':host {\n  --mat-form-field-filled-container-color: transparent;\n}\n\n.app-filter {\n  display: block;\n  width: 100%;\n  margin-bottom: 16px;\n}\n\n.app-filter-range {\n  display: flex;\n  gap: 8px;\n}',
  bs: ':host {\n  display: block;\n}',
  nv: '.app-native-field {\n  display: block;\n  margin-bottom: 12px;\n}\n\n.app-native-field input:not([type="checkbox"]),\n.app-native-field select {\n  display: block;\n  box-sizing: border-box;\n  width: 100%;\n  margin-top: 4px;\n}'
};

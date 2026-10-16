import type {BroSpecCell, BroTableSpec}                                             from '../spec/spec.js';
import {htmlComment, imports, importsField, indentBlock, lineComment, templateText} from './code.js';
import {angularClasses, type BroCellFilling, templateClasses}                       from './fillings.js';
import {BroNames}                                                                   from './names.js';
import type {BroTarget}                                                             from './setup.js';

export interface BroCellCode {
  cell: BroSpecCell;
  /** The file from the folder of the page, without the extension. */
  file: string;
  className: string;
  tag: string;
  /** An Angular component, registered with createCustomElement, or a Custom Element in Vanilla JS. */
  angular: boolean;
  content: string;
  /** The cell has its filling; without it the scaffold has a TODO in place of the template. */
  filled: boolean;
}

/** The cells in the order a reader meets them: by their first columns, then the row details. */
export function byColumns(spec: BroTableSpec, cells: BroCellCode[]): BroCellCode[] {
  const column = (code: BroCellCode) => {
    const index = spec.cols.findIndex(col => col.component && 'cell' in col.component && col.component.cell === code.cell.name);

    return (code.cell.kind === 'details' || index < 0) ? spec.cols.length : index;
  };

  return [...cells].sort((a, b) => column(a) - column(b));
}

/**
 * The scaffold of a cell or of the row details with its filling: an Angular component in an Angular project, with the
 * markup of the skin in its template, and a Custom Element in Vanilla JS for a page without a framework.
 */
export function cellCode(spec: BroTableSpec, cell: BroSpecCell, target: BroTarget, filling?: BroCellFilling, tagSuffix: string = '', simulated: boolean = false): BroCellCode {
  const names = BroNames.of(spec, tagSuffix);
  const angular = (target === 'angular');
  const code: BroCellCode = {
    cell,
    file: names.cellFile(cell.name),
    className: names.cellClass(cell.name),
    tag: names.tag(cell.name),
    angular,
    content: '',
    filled: angular ? Boolean(filling?.template) : Boolean(filling?.render)
  };

  code.content = angular ? angularCell(spec, code, filling, simulated) : vanillaCell(spec, code, filling);

  return code;
}

function angularCell(spec: BroTableSpec, code: BroCellCode, filling: BroCellFilling | undefined, simulated: boolean): string {
  const {cell} = code;
  const details = (cell.kind === 'details');
  const server = details && Boolean(spec.config?.rowDetailsServer);
  const actions = !details && Boolean(cell.actions?.length);

  const angularModules: Record<string, string[]> = {
    '@angular/core': ['ChangeDetectionStrategy', 'Component', 'Input', ...((actions || server) ? ['EventEmitter', 'Output'] : []), ...((server && simulated) ? ['type OnInit'] : [])]
  };
  const localModules: Record<string, string[]> = {
    [`./${BroNames.of(spec).kebab}`]: [`type ${spec.rowType}`]
  };
  // The classes of the template by their modules, for the field imports of the component
  const classes: Record<string, string[]> = {};

  const template = filling?.template?.trim() || `<!-- TODO: ${htmlComment(cell.shows)}; the fields of the row: ${cell.fields.join(', ')} -->`;
  const imported: {name: string; from: string}[] = [
    ...templateClasses(template).map(name => ({name, from: angularClasses[name]})),
    ...(filling?.imports ?? []).map(item => (typeof item === 'string') ? {name: item, from: angularClasses[item]} : item)
  ];

  for (const {name, from} of imported) {
    const modules = from.startsWith('.') ? localModules : angularModules;

    if (!Object.values(classes).flat().includes(name)) {
      (modules[from] ??= []).push(name);
      (classes[from] ??= []).push(name);
    }
  }

  const decorator = [
    `  template: \`\n${indentBlock(templateText(template), '      ')}\`,`,
    ...(filling?.styles?.trim() ? [`  styles: \`\n${indentBlock(templateText(filling.styles.trim()), '      ')}\`,`] : []),
    `  changeDetection: ChangeDetectionStrategy.OnPush${Object.keys(classes).length ? ',' : ''}`,
    ...(Object.keys(classes).length ? [importsField(classes)] : [])
  ];

  const members = details
    ? [
        `  @Input() row!: ${spec.rowType};`,
        ...(server
          ? [
              '',
              '  /** Set for the details that load from the server: emit loaded with the loaded part, 1 at the end. */',
              '  @Input() server?: string;',
              '',
              '  @Output(events.detailsServerLoadedEvent) loaded: EventEmitter<number> = new EventEmitter<number>();',
              ...(simulated
                ? [
                    '',
                    '  /** The simulated server gives the details in a second: your request for them takes its place. */',
                    '  ngOnInit() {',
                    '    if (this.server) {',
                    '      setTimeout(() => this.loaded.emit(1), 1000);',
                    '    }',
                    '  }'
                  ]
                : [])
            ]
          : [])
      ]
    : [
        `  @Input() col!: BroCol<${spec.rowType}>;`,
        `  @Input() row!: ${spec.rowType};`,
        ...(actions ? ['', '  @Output() action: EventEmitter<string> = new EventEmitter<string>();'] : [])
      ];

  if (filling?.members?.trim()) {
    members.push('', indentBlock(filling.members.trim(), '  '));
  }

  return [
    imports({
      ...angularModules,
      '@table-bro/core': details ? ['type BroRowDetailsElement', ...(server ? ['events'] : [])] : ['type BroCellElement', 'type BroCol'],
      ...localModules
    }),
    '',
    '@Component({',
    ...decorator,
    '})',
    `export class ${code.className} implements ${details ? 'BroRowDetailsElement' : 'BroCellElement'}<${spec.rowType}>${(server && simulated) ? ', OnInit' : ''} {`,
    ...members,
    '}',
    ''
  ].join('\n');
}

function vanillaCell(spec: BroTableSpec, code: BroCellCode, filling: BroCellFilling | undefined): string {
  const {cell} = code;
  const details = (cell.kind === 'details');
  const server = details && Boolean(spec.config?.rowDetailsServer);
  const actions = !details && Boolean(cell.actions?.length);

  const render = filling?.render?.trim() || `// TODO: ${lineComment(cell.shows)}; the fields of the row: ${cell.fields.join(', ')}. Values go in with textContent`;

  const body = [
    ...(details ? [`  row?: ${spec.rowType};`] : [`  col?: BroCol<${spec.rowType}>;`, `  row?: ${spec.rowType};`]),
    '',
    '  /** A move in the DOM connects the element again; it keeps its markup. */',
    '  private built: boolean = false;',
    '',
    '  connectedCallback(): void {',
    '    if (this.built) {',
    '      return;',
    '    }',
    '',
    '    this.built = true;',
    '',
    '    this.render();',
    '  }',
    '',
    '  private render(): void {',
    indentBlock(render, '    '),
    '  }'
  ];

  if (actions) {
    body.push(
      '',
      '  /** Sends an action of the cell: the table gives it to the page with the column and the row. */',
      '  private sendAction(action: string): void {',
      '    this.dispatchEvent(new CustomEvent(\'action\', {detail: action}));',
      '  }'
    );
  }

  if (server) {
    body.push(
      '',
      '  /** For the details that load from the server (the attribute server): the loaded part, 1 at the end. */',
      '  private reportLoaded(part: number): void {',
      '    this.dispatchEvent(new CustomEvent(events.detailsServerLoadedEvent, {detail: part}));',
      '  }'
    );
  }

  if (filling?.members?.trim()) {
    body.push('', indentBlock(filling.members.trim(), '  '));
  }

  return [
    imports({
      '@table-bro/core': server ? ['events'] : [],
      'type @table-bro/core': details ? ['BroRowDetailsElement'] : ['BroCellElement', 'BroCol'],
      [`type ./${BroNames.of(spec).kebab}`]: [spec.rowType]
    }),
    '',
    `export class ${code.className} extends HTMLElement implements ${details ? 'BroRowDetailsElement' : 'BroCellElement'}<${spec.rowType}> {`,
    ...body,
    '}',
    ''
  ].join('\n');
}

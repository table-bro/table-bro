import type {BroMcpExtension}                                        from '../extension.js';
import type {BroSpecSkin, BroTableSpec}                              from '../spec/spec.js';
import {type BroSpecLimits, type BroSpecReport, validateSpec}        from '../spec/validate-spec.js';
import {angularTable, type BroGeneratedFile, type BroTableFiles}     from './angular.js';
import {angularClasses, type BroSpecFillings, fillingsErrors}        from './fillings.js';
import {type BroSetupStep, type BroTarget, setupSteps, skinFeatures} from './setup.js';
import {vanillaTable}                                                from './vanilla.js';

export interface BroGenerateOptions {
  target: BroTarget;
  skin: BroSpecSkin;
  /** The parts of the code that a model writes; without them the scaffolds have TODOs in their place. */
  fillings?: BroSpecFillings;
  /** The paid modules of the project: the generator writes their fields of the config and adds their setup. */
  extensions?: BroMcpExtension[];
  /** The suffix of the tags of the cells: tables generated into one page define their own Custom Elements. */
  tagSuffix?: string;
  /** Angular in the server mode: the page answers the queries of the table from the rows of the spec, as a server would. */
  simulateServer?: boolean;
  /** The sizes of a spec that the host takes. */
  limits?: BroSpecLimits;
}

export interface BroGeneratedCode {
  /** The check of the spec: with errors there are no files. */
  report: BroSpecReport;
  files: BroGeneratedFile[];
  /** The setup of the project, once for all its tables. */
  setup: BroSetupStep[];
  /** What to finish by hand. */
  todo: string[];
}

/**
 * Writes the code of a table from its spec for a target and a skin: a pure function, the spec and the fillings in,
 * the files out. It checks the spec first and writes nothing for a spec with errors.
 */
export function generateCode(spec: BroTableSpec, options: BroGenerateOptions): BroGeneratedCode {
  const {target, skin} = options;
  const report = validateSpec(spec, {skin, extensions: options.extensions, limits: options.limits});

  if (target === 'vanilla' && skin === 'mat') {
    report.valid = false;
    report.errors.push({path: '', message: 'the mat skin is for Angular', fix: 'use the target angular, or the skin bs or nv'});
  }

  // Fillings of another form would fail the generator: they are errors of the fillings, with their paths
  const fillingIssues = fillingsErrors(options.fillings);

  if (fillingIssues.length) {
    report.valid = false;
    report.errors.push(...fillingIssues);
  }

  // An import that the generator cannot place would crash it: it is an error of the fillings, with the path
  for (const [cell, skins] of Object.entries(fillingIssues.length ? {} : options.fillings?.cells ?? {})) {
    for (const [fillingSkin, filling] of Object.entries(skins ?? {})) {
      (filling?.imports ?? []).forEach((item, index) => {
        const known = (typeof item === 'string') ? Boolean(angularClasses[item]) : (typeof item?.name === 'string' && typeof item?.from === 'string');

        if (!known) {
          report.valid = false;
          report.errors.push({
            path: `fillings.cells.${cell}.${fillingSkin}.imports[${index}]`,
            message: `${JSON.stringify(item)} is not an import that the generator can place`,
            fix: 'give {"name": "OrderBadge", "from": "./order-badge"} for a class of the project; the classes of Angular Material and the pipes of Angular come from the template, and a string is only the name of such a class'
          });
        }
      });
    }
  }

  if (!report.valid) {
    return {report, files: [], setup: [], todo: []};
  }

  const fillings = options.fillings ?? {};
  const extensions = options.extensions ?? [];
  const table: BroTableFiles = (target === 'angular') ? angularTable(spec, skin, fillings, options.tagSuffix, extensions, options.simulateServer) : vanillaTable(spec, skin, fillings, options.tagSuffix, extensions);

  // The cells of an Angular project are Angular components in every skin: they become Custom Elements with @angular/elements
  const elements = (target === 'angular' && skin !== 'mat' && Boolean(spec.cells?.length)) ? ['@angular/elements'] : [];

  // A module joins the setup when the spec uses one of its fields
  const modules = extensions.filter(extension => Object.keys(extension.config ?? {}).some(field => (<Record<string, unknown>>spec.config ?? {})[field] !== undefined));

  // The page of an Angular server table loads the answers of its API with HttpClient; the simulated server needs none
  const http: BroSetupStep[] = (target === 'angular' && spec.config?.server && (spec.api || !options.simulateServer))
    ? [{
        title: 'Provide HttpClient',
        text: 'The table loads its rows from the API with HttpClient. In the providers of `app.config.ts`:',
        code: "import {provideHttpClient} from '@angular/common/http';\n\n// providers: [..., provideHttpClient()]",
        language: 'typescript'
      }]
    : [];

  return {report, files: table.files, setup: [...setupSteps(target, skin, elements, skinFeatures(spec, skin)), ...http, ...modules.flatMap(extension => (extension.setup ?? []).map(step => ({...step, module: extension.package})))], todo: table.todo};
}

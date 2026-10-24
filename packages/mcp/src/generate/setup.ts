import type {BroSpecSkin, BroTableSpec} from '../spec/spec.js';
import {imports}                        from './code.js';

export type BroTarget = 'angular' | 'vanilla';

/** The CSS of the core and of each skin, each in its package. */
const css: Record<BroSpecSkin | 'core', string> = {
  core: 'node_modules/@table-bro/core/dist/table-bro.min.css',
  mat: 'node_modules/@table-bro/angular-material/dist/table-bro.material.min.css',
  bs: 'node_modules/@table-bro/bootstrap/dist/table-bro.bootstrap.min.css',
  nv: 'node_modules/@table-bro/native/dist/table-bro.native.min.css'
};

/** What each package gives the project: the step that installs the packages names them before the command. */
const packageRoles: Record<string, string> = {
  '@table-bro/core': '`@table-bro/core`: the table engine itself, the Custom Element <table-bro> with its rows, pages, sort, search and row details, and the CSS of the core',
  '@table-bro/angular': '`@table-bro/angular`: `<table-bro-ng>` for the templates of Angular, with signal inputs and outputs, and the contracts of a page and of its service',
  '@table-bro/angular-material': '`@table-bro/angular-material`: the skin mat, pixel-perfect Material data tables on the components of Angular Material, in the theme of the application, with its Filter Drawer',
  '@angular/elements': '`@angular/elements`: turns the Angular components of the cells into Custom Elements, which the table creates by their tags',
  '@table-bro/bootstrap': '`@table-bro/bootstrap`: the skin bs, the table on the components and the classes of Bootstrap 5: its buttons, dropdowns and tooltips',
  bootstrap: '`bootstrap`: Bootstrap itself, its CSS and the Dropdown and Tooltip that the skin uses',
  '@types/bootstrap': '`@types/bootstrap`: the types of Bootstrap, which the import of Dropdown and Tooltip needs in a strict TypeScript project',
  '@table-bro/native': '`@table-bro/native`: the skin nv, plain HTML elements, no UI library'
};

/** The functions of the optional elements of a skin: provideTableBroMatSkin() takes them, a vanilla skin calls them after its import. */
export type BroSkinFeature = 'withTags' | 'withSwitch' | 'withToolbarMenu';

/** What each optional element is: the text of a setup names the functions with them. */
const featureRoles: Record<BroSkinFeature, string> = {
  withTags: '`withTags()` for tags',
  withSwitch: '`withSwitch()` for switches',
  withToolbarMenu: '`withToolbarMenu()` for the menu of the toolbar'
};

/**
 * The optional elements of the skin that a table of a spec uses: its ready elements tags and switch, and the menu of
 * the toolbar, an element of its own only in the skin mat.
 * @param spec - the spec of the table
 * @param skin - the skin of the project
 */
export function skinFeatures(spec: BroTableSpec, skin: BroSpecSkin): BroSkinFeature[] {
  const elements = (spec.cols ?? []).map(col => (col.component && 'element' in col.component) ? col.component.element : undefined);

  return (<[BroSkinFeature, boolean][]>[
    ['withTags', elements.includes('tags')],
    ['withSwitch', elements.includes('switch')],
    ['withToolbarMenu', skin === 'mat' && Boolean(spec.toolbar?.menu)]
  ]).filter(([, used]) => used).map(([feature]) => feature);
}

/** A step of the setup of a project, as the docs of Bootstrap show such steps: a title, a line about it, its code. */
export interface BroSetupStep {
  title: string;
  /** The line under the title: a name in backticks is code. */
  text?: string;
  /** The points of the step, a list before its code: a name in backticks is code. */
  items?: string[];
  code?: string;
  language?: 'bash' | 'html' | 'json' | 'scss' | 'typescript';
  /** The npm package of the paid module that the step sets up: the site shows such steps apart, after the code. */
  module?: string;
}

/**
 * The setup of a project, once for all its tables: the packages, the CSS and the registration of the skin with its
 * optional elements. The generator gives it apart from the files of a table.
 * @param target - an Angular project or Vanilla JS
 * @param skin - the skin of the project
 * @param extraPackages - the packages that the tables need besides the ones of the skin
 * @param features - the optional elements of the skin that the tables use
 */
export function setupSteps(target: BroTarget, skin: BroSpecSkin, extraPackages: string[] = [], features: BroSkinFeature[] = []): BroSetupStep[] {
  const angular = (target === 'angular');
  const calls = features.map(feature => `${feature}()`).join(', ');
  // The elements that only some tables use: a project that registers the skin already adds the ones of a new table
  const optional = `The elements that only some tables use come with their functions: ${(<BroSkinFeature[]>['withTags', 'withSwitch', ...((skin === 'mat') ? ['withToolbarMenu'] : [])]).map(feature => featureRoles[feature]).join(', ')}; a project that registers the skin already adds the ones of a new table${(skin === 'mat') ? ' to the call' : `. A page may define them itself, as \`customElements.define('bro-${skin}-tags', ${(skin === 'bs') ? 'BroBootstrapTagsComponent' : 'BroNativeTagsComponent'})\``}.`;
  // Angular server-side rendering renders a vanilla skin only when the server bundle imports its package
  const ssrImport = (pkg: string): string => ` With Angular server-side rendering, \`app.config.ts\` imports the package as well, \`import '${pkg}';\`, so that the server renders the skin too: [Prerendering](https://table-bro.com/docs/ssr/prerendering).`;
  // A vanilla skin registers itself on its import, and its optional elements come with calls after it
  const vanillaCalls = features.map(feature => `${feature}();`);
  const packages = ['@table-bro/core', ...(angular ? ['@table-bro/angular'] : []), ...{
    mat: ['@table-bro/angular-material', '@angular/elements'],
    bs: ['@table-bro/bootstrap', 'bootstrap', '@types/bootstrap'],
    nv: ['@table-bro/native']
  }[skin], ...extraPackages];

  const styles = [...(skin === 'bs' ? ['node_modules/bootstrap/dist/css/bootstrap.min.css'] : []), css.core, css[skin]];

  const steps: BroSetupStep[] = [
    {
      title: 'Install the packages',
      text: (skin === 'mat') ? 'The table and the parts it needs; a project without Angular Material adds it first with `ng add @angular/material`.' : 'The table and the parts it needs:',
      items: packages.map(name => packageRoles[name] ?? `\`${name}\``),
      code: `npm install ${packages.join(' ')}`,
      language: 'bash'
    },
    angular
      ? {
          title: 'Add the CSS',
          text: 'To `"styles"` of `angular.json`:',
          code: `"styles": [\n${styles.map(style => `  "${style}"`).join(',\n')}\n]`,
          language: 'json'
        }
      : {
          title: 'Link the CSS',
          text: 'On the page:',
          code: styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n'),
          language: 'html'
        }
  ];

  if (skin === 'mat') {
    steps.push({
      title: 'Register the skin and its elements',
      text: `In the providers of \`app.config.ts\`. ${optional}`,
      code: [
        imports({
          '@angular/core': ['type ApplicationConfig'],
          '@table-bro/angular-material': ['provideTableBroMatSkin', ...features]
        }),
        '',
        'export const appConfig: ApplicationConfig = {',
        '  providers: [',
        `    provideTableBroMatSkin(${calls})`,
        '  ]',
        '};'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Keep the theme of Angular Material',
      text: 'The mat skin takes the theme of the application, as the components of Angular Material do: the table looks as a `mat-table` of the project, and a table in the dark theme takes the dark scheme of the theme. `ng add @angular/material` writes the theme into `styles.scss`; a project without it adds it:',
      code: [
        '@use \'@angular/material\' as mat;',
        '',
        'html {',
        '  @include mat.theme((',
        '    color: (',
        '      primary: mat.$azure-palette,',
        '      tertiary: mat.$blue-palette,',
        '    ),',
        '    typography: Roboto,',
        '    density: 0,',
        '  ));',
        '}'
      ].join('\n'),
      language: 'scss'
    }, {
      title: 'Load the fonts of the icons',
      text: 'The mat skin shows the ligature icons of Material, as Angular Material asks; the cells and the dialogs of the page take the newer Material Symbols. In `index.html`:',
      code: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">\n<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300,0,0" rel="stylesheet">',
      language: 'html'
    });
  } else if (skin === 'bs') {
    steps.push({
      title: 'Register the skin',
      text: `Once, ${angular ? 'in `main.ts`' : 'before the tables'}: the import registers the skin, which takes the classes of Bootstrap. ${optional}${angular ? ssrImport('@table-bro/bootstrap') : ''}`,
      code: [
        imports({bootstrap: ['Dropdown', 'Tooltip'], '@table-bro/bootstrap': ['useBootstrap', ...features]}),
        '',
        'useBootstrap({Dropdown, Tooltip});',
        ...vanillaCalls
      ].join('\n'),
      language: 'typescript'
    });
  } else {
    steps.push({
      title: 'Register the skin',
      text: `Once, ${angular ? 'in `main.ts`' : 'before the tables'}: the import registers the skin. ${optional}${angular ? ssrImport('@table-bro/native') : ''}`,
      code: features.length ? [imports({'@table-bro/native': features}), '', ...vanillaCalls].join('\n') : 'import \'@table-bro/native\';',
      language: 'typescript'
    });
  }

  return steps;
}

/** The steps of a setup as Markdown, for an agent. */
export function setupText(steps: BroSetupStep[]): string {
  return steps.map((step, index) => [
    `**${index + 1}. ${step.title}**`,
    ...(step.text ? [step.text] : []),
    ...(step.items ? [step.items.map(item => `- ${item}`).join('\n')] : []),
    ...(step.code ? [`\`\`\`${step.language ?? ''}\n${step.code}\n\`\`\``] : [])
  ].join('\n\n')).join('\n\n');
}

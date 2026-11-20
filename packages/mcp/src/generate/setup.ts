import type {BroSpecSkin, BroTableSpec} from '../spec/spec.js';
import {imports}                        from './code.js';

export type BroTarget = 'angular' | 'vanilla';

/** The CSS of the core and of each skin, each in its package. */
const css: Record<BroSpecSkin | 'core', string> = {
  core: 'node_modules/@table-bro/core/dist/table-bro.min.css',
  mat: 'node_modules/@table-bro/angular-material/dist/table-bro.material.min.css',
  mui: 'node_modules/@table-bro/react-mui/dist/table-bro.react-mui.min.css',
  vuetify: 'node_modules/@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css',
  suid: 'node_modules/@table-bro/solid-suid/dist/table-bro.solid-suid.min.css',
  'm3-svelte': 'node_modules/@table-bro/svelte-m3/dist/table-bro.svelte-m3.min.css',
  bs: 'node_modules/@table-bro/bootstrap/dist/table-bro.bootstrap.min.css',
  nv: 'node_modules/@table-bro/native/dist/table-bro.native.min.css'
};

/** What each package gives the project: the step that installs the packages names them before the command. */
const packageRoles: Record<string, string> = {
  '@table-bro/core': '`@table-bro/core`: the table engine itself, the Custom Element <table-bro> with its rows, pages, sort, search and row details, and the CSS of the core',
  '@table-bro/angular': '`@table-bro/angular`: `<table-bro-ng>` for the templates of Angular, with signal inputs and outputs, and the contracts of a page and of its service',
  '@table-bro/angular-material': '`@table-bro/angular-material`: the skin mat, pixel-perfect Material data tables on the components of Angular Material, in the theme of the application, with its Filter Drawer',
  '@angular/elements': '`@angular/elements`: turns the Angular components of the cells into Custom Elements, which the table creates by their tags',
  '@table-bro/react-mui': '`@table-bro/react-mui`: the skin mui, the table on the components of MUI for React and Preact, in the MUI theme of the application',
  '@mui/material': '`@mui/material`: MUI itself, whose components the skin renders',
  '@emotion/react': '`@emotion/react` and `@emotion/styled`: the styles of MUI',
  '@emotion/styled': '',
  '@table-bro/vue-vuetify': '`@table-bro/vue-vuetify`: the skin vuetify, the table on the components of Vuetify for Vue, in the themes of the Vuetify of the application',
  vuetify: '`vuetify`: Vuetify itself, whose components the skin renders',
  '@table-bro/solid-suid': '`@table-bro/solid-suid`: the skin suid, the table on the components of SUID, the port of MUI to Solid, in the SUID theme of the application',
  '@suid/material': '`@suid/material`: SUID itself, whose components the skin renders; it supports Solid 1, and the plugin of Solid for Vite compiles its components, published as JSX',
  '@table-bro/svelte-m3': '`@table-bro/svelte-m3`: the skin m3-svelte, the table on the components of M3 Svelte for Svelte, in the Material 3 theme of the application',
  'm3-svelte': '`m3-svelte`: M3 Svelte itself, whose components the skin mounts',
  'vite-plugin-functions-mixins': '`vite-plugin-functions-mixins`: the plugin of Vite that compiles the CSS of the components of M3 Svelte',
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
  const own = (skin === 'bs' || skin === 'nv') ? `. A page may define them itself, as \`customElements.define('bro-${skin}-tags', ${(skin === 'bs') ? 'BroBootstrapTagsComponent' : 'BroNativeTagsComponent'})\`` : '';
  const optional = `The elements that only some tables use come with their functions: ${(<BroSkinFeature[]>['withTags', 'withSwitch', ...((skin === 'mat') ? ['withToolbarMenu'] : [])]).map(feature => featureRoles[feature]).join(', ')}; a project that registers the skin already adds the ones of a new table${(skin === 'mat') ? ' to the call' : own}.`;
  // Angular server-side rendering renders a vanilla skin only when the server bundle imports its package
  const ssrImport = (pkg: string): string => ` With Angular server-side rendering, \`app.config.ts\` imports the package as well, \`import '${pkg}';\`, so that the server renders the skin too: [Prerendering](https://table-bro.com/docs/ssr/prerendering).`;
  // A vanilla skin registers itself on its import, and its optional elements come with calls after it
  const vanillaCalls = features.map(feature => `${feature}();`);
  const packages = ['@table-bro/core', ...(angular ? ['@table-bro/angular'] : []), ...{
    mat: ['@table-bro/angular-material', '@angular/elements'],
    mui: ['@table-bro/react-mui', '@mui/material', '@emotion/react', '@emotion/styled'],
    vuetify: ['@table-bro/vue-vuetify', 'vuetify'],
    suid: ['@table-bro/solid-suid', '@suid/material'],
    'm3-svelte': ['@table-bro/svelte-m3', 'm3-svelte', 'vite-plugin-functions-mixins'],
    bs: ['@table-bro/bootstrap', 'bootstrap', '@types/bootstrap'],
    nv: ['@table-bro/native']
  }[skin], ...extraPackages];

  const styles = [...(skin === 'bs' ? ['node_modules/bootstrap/dist/css/bootstrap.min.css'] : []), css.core, css[skin]];

  const steps: BroSetupStep[] = [
    {
      title: 'Install the packages',
      text: (skin === 'mat') ? 'The table and the parts it needs; a project without Angular Material adds it first with `ng add @angular/material`.' : 'The table and the parts it needs:',
      // A package that another line names together with its own has no line of its own
      items: packages.filter(name => packageRoles[name] !== '').map(name => packageRoles[name] ?? `\`${name}\``),
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
  } else if (skin === 'mui') {
    steps.push({
      title: 'Register the skin with the theme of the application',
      text: `Once, before the tables: the import registers the skin, and \`setMuiTheme()\` gives its elements the MUI theme of the application, which the application renders with \`ThemeProvider\` of MUI. The table reads the colors of the theme from its CSS variables, which the option \`cssVariables\` of the theme writes. ${optional}`,
      code: [
        imports({'@mui/material/styles': ['createTheme'], '@table-bro/react-mui': ['setMuiTheme', ...features]}),
        '',
        'export const theme = createTheme({',
        '  cssVariables: {colorSchemeSelector: \'data-mui-color-scheme\'},',
        '  colorSchemes: {light: true, dark: true}',
        '});',
        '',
        'setMuiTheme(theme);',
        ...vanillaCalls
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Render the table from an effect',
      text: 'The elements of the skin render at once, by `flushSync` of React, which React puts off inside its own render and effects: a component renders the table outside them, as `queueMicrotask()` in an effect. Preact renders at once everywhere.',
      code: [
        'useEffect(() => {',
        '  const container = ref.current!;',
        '',
        '  // The render function of the module of the table, as renderOrderTable()',
        '  queueMicrotask(() => renderOrderTable(container));',
        '}, []);'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Load the font of the icons',
      text: 'The mui skin shows the ligature icons of Material. In `index.html`:',
      code: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">',
      language: 'html'
    });
  } else if (skin === 'vuetify') {
    steps.push({
      title: 'Register the skin with the Vuetify of the application',
      text: `Once, before the tables: the import registers the skin, and \`setVuetify()\` gives its elements the instance of Vuetify that the application installs, with its themes, defaults and icons. The table reads the colors of the themes from the CSS variables that Vuetify writes, so the application imports \`vuetify/styles\` before the CSS of the table. ${optional}`,
      code: [
        imports({vuetify: ['createVuetify'], 'vuetify/blueprints': ['md3'], '@table-bro/vue-vuetify': ['setVuetify', ...features]}),
        '',
        'export const vuetify = createVuetify({blueprint: md3});',
        '',
        'setVuetify(vuetify);',
        ...vanillaCalls,
        '',
        '// main.ts: createApp(App).use(vuetify).mount(\'#app\');'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Render the table when the component is mounted',
      text: 'The elements of the skin render at once, by `render()` of Vue, which patches them before it returns: a component renders the table in `onMounted()`. The plugin of Vue compiles `<table-bro>` of a template as a Custom Element with `isCustomElement: tag => tag.startsWith(\'table-bro\')` of its `compilerOptions`.',
      code: [
        'const container = useTemplateRef<HTMLElement>(\'container\');',
        '',
        '// The render function of the module of the table, as renderOrderTable()',
        'onMounted(() => renderOrderTable(container.value!));'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Load the font of the icons',
      text: 'The vuetify skin shows the ligature icons of Material, whatever icon set the application gives Vuetify. In `index.html`:',
      code: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">',
      language: 'html'
    });
  } else if (skin === 'suid') {
    steps.push({
      title: 'Register the skin with the theme of the application',
      text: `Once, before the tables: the import registers the skin, and \`setSuidTheme()\` gives its elements the SUID theme of the application, which the application renders with \`ThemeProvider\` of SUID. The skin writes the CSS variables of the theme that the table reads, and writes them again when a palette given as a getter changes. ${optional}`,
      code: [
        imports({'@suid/material/styles': ['createTheme'], '@table-bro/solid-suid': ['setSuidTheme', ...features]}),
        '',
        'export const theme = createTheme();',
        '',
        'setSuidTheme(theme);',
        ...vanillaCalls
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Render the table when the component mounts',
      text: 'Solid renders the elements of the skin at once, also inside its effects, so a component renders the table in `onMount()`.',
      code: [
        'onMount(() => {',
        '  // The render function of the module of the table, as renderOrderTable()',
        '  renderOrderTable(container);',
        '});'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Load the font of the icons',
      text: 'The suid skin shows the ligature icons of Material. In `index.html`:',
      code: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">',
      language: 'html'
    });
  } else if (skin === 'm3-svelte') {
    steps.push({
      title: 'Compile M3 Svelte',
      text: 'M3 Svelte publishes its components as their sources: Vite compiles them with the plugin of Svelte, and the CSS of their styles with `vite-plugin-functions-mixins`. The plugin names Vite 7 as its peer dependency and works with Vite 8: a project of Vite 8 adds `"overrides": {"vite-plugin-functions-mixins": {"vite": "$vite"}}` to its `package.json`. In `vite.config.ts`:',
      code: [
        imports({'@sveltejs/vite-plugin-svelte': ['svelte'], vite: ['defineConfig'], 'vite-plugin-functions-mixins': ['functionsMixins']}),
        '',
        'export default defineConfig({',
        '  plugins: [svelte(), functionsMixins({deps: [\'m3-svelte\']})]',
        '});'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Register the skin with the theme of the application',
      text: `Once, before the tables: the import registers the skin. The table and the components of M3 Svelte read the colors of the M3 Svelte theme of the application, its CSS variables \`--m3c-*\`: the application imports the styles of M3 Svelte and its theme, as the theme page of M3 Svelte writes it, with the function \`--m3-density\` and the colors of the light and the dark scheme. ${optional}`,
      code: [
        '// theme.css: @import "m3-svelte/etc/styles.css"; @import "m3-svelte/etc/recommended-styles.css"; and the theme',
        'import \'./theme.css\';',
        features.length ? imports({'@table-bro/svelte-m3': features}) : 'import \'@table-bro/svelte-m3\';',
        ...(features.length ? ['', ...vanillaCalls] : [])
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Render the table in onMount',
      text: 'The elements of the skin render at once: `mount()` of Svelte renders a component synchronously, and an element renders a change by `flushSync()`. A component renders the table when its container is in the DOM, in `onMount()`.',
      code: [
        'let container: HTMLElement;',
        '',
        '// The render function of the module of the table, as renderOrderTable()',
        'onMount(() => renderOrderTable(container));'
      ].join('\n'),
      language: 'typescript'
    }, {
      title: 'Load the font of the icons',
      text: 'The m3-svelte skin shows the icons of Material Symbols by their names. In `index.html`:',
      code: '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">',
      language: 'html'
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

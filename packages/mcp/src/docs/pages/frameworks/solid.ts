import type {BroDocPage}                                   from '../../pages.js';
import {mcpInstall, mcpSection, skinsSection, suidInstall} from '../shared.js';

/** The page frameworks/solid of Docs. */
export const solidPage: BroDocPage = {
  path: 'frameworks/solid',
  name: 'Solid data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Solid app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, \`on:bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/solid-suid/solid) is the sample project \`samples/solid-suid/solid\` of the repository, with Solid 1.9 and the Solid SUID skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/solid-suid/solid) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/solid\` and Native work in Solid the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Solid?

${mcpSection('#####', 'Solid')}

##### Install manually

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/solid-suid\`, and SUID, which supports Solid 1. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Solid the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the theme of the application**

   The SUID theme of the application takes the palette of the color scheme of the system, and follows it when it changes. Its palettes have the colors of the sample of Angular Material, the azure palette of Material 3, and the font Roboto, so that the table looks as the table of the skin \`mat\`; the page stays light, as the page of that sample. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`suid\`, and \`setSuidTheme()\` gives its elements the theme and writes the CSS variables of the theme that the table reads. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of SUID**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [SolidStart](https://table-bro.com/docs/ssr/solidstart) come after these: the server entry prerenders the table in its loading state in the markup of SUID.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`ref\` gives the element ([Solid, ref](https://docs.solidjs.com/reference/jsx-attributes/ref)), \`onMount\` makes the call: Solid renders the elements of the skin at once, also inside its effects, so the table measures them rendered. \`on:bro-action\` adds the listener of the event by its exact name ([Solid, on:*](https://docs.solidjs.com/reference/jsx-attributes/on)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

\`vite-plugin-solid\` compiles the JSX of Solid and the components of SUID, which SUID publishes as JSX, and \`"jsx": "preserve"\` with \`"jsxImportSource": "solid-js"\` in \`tsconfig.json\` gives its types to TypeScript. \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Solid, with the methods of \`TableBroHTMLElement\`, and \`bro-action\` to its events of \`on:\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of SUID with \`CssBaseline\`:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Solid need a wrapper for Custom Elements?

No. Solid passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); \`on:\` listens to an event by its exact name, as \`bro-action\`. Its package \`solid-element\` also turns a Solid component into a Custom Element ([Solid, solid-element](https://www.npmjs.com/package/solid-element)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref, as in an effect of a signal of the rows.

##### Does it work with SolidStart?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMount\`, and the server render of SolidStart prerenders it in its loading state in the markup of SUID, with the server entry of the skin: [SolidStart](https://table-bro.com/docs/ssr/solidstart).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [SolidStart](https://table-bro.com/docs/ssr/solidstart), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    suidInstall,
    {file: 'src/theme.ts', language: 'ts', code: `import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the azure
// palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the surface
// as the background of the table, the outline as the borders of the rows and the outline of the chips, and the font
// Roboto. The page stays light, as the page of that sample, and the table follows the color scheme of the system:
// the palette follows a change of the scheme, and the components of SUID and the table take it
const scheme = window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme.matches);

scheme.addEventListener('change', event => setDark(event.matches));

const lightPalette = {
  mode: 'light' as const,
  primary: {main: '#005cbb'},
  text: {primary: '#1a1b1f', secondary: '#44474e', disabled: 'rgba(26, 27, 31, 0.38)'},
  divider: '#74777f',
  background: {default: '#faf9fd', paper: '#faf9fd'},
  action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)', disabledOpacity: 0.38},
  grey: {400: '#74777f'}
};

// The dark scheme keeps the light background of the page, which CssBaseline gives the body
const darkPalette = {
  mode: 'dark' as const,
  primary: {main: '#abc7ff'},
  text: {primary: '#e3e2e6', secondary: '#e0e2ec', disabled: 'rgba(227, 226, 230, 0.38)'},
  divider: '#8e9099',
  background: {default: '#faf9fd', paper: '#121316'},
  action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)', disabledOpacity: 0.38},
  grey: {700: '#8e9099'}
};

const palette = createRoot(() => createMemo(() => createPalette(dark() ? darkPalette : lightPalette)));

export const theme = createTheme({palette, typography: {fontFamily: 'Roboto'}});
`},
    {file: 'src/skin.ts', language: 'ts', code: `// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin suid, and
// setSuidTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/solid-suid/dist/table-bro.solid-suid.min.css';
import {setSuidTheme} from '@table-bro/solid-suid';

import {theme} from './theme';

import './sample-page.css';

setSuidTheme(theme);
`},
    {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Solid SUID</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`},
    {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
  {description: 'Handcrafted Wooden Table, Gorgeous Bronze Watch, Modern Fresh Salad, Refined Plastic Keyboard, Practical Rubber Shoes', price: 80},
  {description: 'Small Concrete Gloves, Licensed Frozen Pizza, Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes', price: 57},
  {description: 'Rustic Cotton Shirt, Ergonomic Steel Chair, Handcrafted Wooden Table, Small Concrete Gloves, Sleek Granite Lamp', price: 13},
  {description: 'Refined Plastic Keyboard, Ergonomic Steel Chair, Modern Fresh Salad, Gorgeous Bronze Watch, Sleek Granite Lamp', price: 27},
  {description: 'Licensed Frozen Pizza, Practical Rubber Shoes, Gorgeous Bronze Watch, Sleek Granite Lamp, Rustic Cotton Shirt', price: 96},
  {description: 'Small Concrete Gloves, Handcrafted Wooden Table, Gorgeous Bronze Watch, Ergonomic Steel Chair, Practical Rubber Shoes', price: 69},
  {description: 'Practical Rubber Shoes, Modern Fresh Salad, Refined Plastic Keyboard, Handcrafted Wooden Table, Gorgeous Bronze Watch', price: 91},
  {description: 'Modern Fresh Salad, Practical Rubber Shoes, Ergonomic Steel Chair, Licensed Frozen Pizza, Gorgeous Bronze Watch', price: 48},
  {description: 'Gorgeous Bronze Watch, Refined Plastic Keyboard, Licensed Frozen Pizza, Ergonomic Steel Chair, Rustic Cotton Shirt', price: 75},
  {description: 'Small Concrete Gloves, Refined Plastic Keyboard, Handcrafted Wooden Table, Rustic Cotton Shirt, Practical Rubber Shoes', price: 97},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Licensed Frozen Pizza, Practical Rubber Shoes, Sleek Granite Lamp', price: 54},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Ergonomic Steel Chair, Practical Rubber Shoes, Handcrafted Wooden Table', price: 99},
  {description: 'Sleek Granite Lamp, Ergonomic Steel Chair, Handcrafted Wooden Table, Gorgeous Bronze Watch, Practical Rubber Shoes', price: 55},
  {description: 'Refined Plastic Keyboard, Sleek Granite Lamp, Modern Fresh Salad, Handcrafted Wooden Table, Ergonomic Steel Chair', price: 81},
  {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes, Small Concrete Gloves, Rustic Cotton Shirt', price: 86},
  {description: 'Practical Rubber Shoes, Small Concrete Gloves, Refined Plastic Keyboard, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 56},
  {description: 'Rustic Cotton Shirt, Practical Rubber Shoes, Small Concrete Gloves, Ergonomic Steel Chair, Licensed Frozen Pizza', price: 20},
  {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Small Concrete Gloves, Sleek Granite Lamp, Handcrafted Wooden Table', price: 34},
  {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Small Concrete Gloves, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 72},
  {description: 'Ergonomic Steel Chair, Practical Rubber Shoes, Gorgeous Bronze Watch, Rustic Cotton Shirt, Modern Fresh Salad', price: 57}
];

export const conf: BroConfig = {
  skin: 'suid',
  toolbarTitle: 'Orders'
};
`},
    {file: 'vite.config.ts', language: 'ts', code: `import {defineConfig, mergeConfig} from 'vite';
import solid                       from 'vite-plugin-solid';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    solid()
  ]
}));
`},
    {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of Solid, with its attribute theme and its event bro-action for on:bro-action
import type {JSX as SolidJSX} from 'solid-js';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': SolidJSX.HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }

    interface CustomEvents {
      'bro-action': CustomEvent<BroActionDetail>;
    }
  }
}
`},
    {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {onMount} from 'solid-js';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  let table!: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"
                 on:bro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
    {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@suid/material/CssBaseline';
import {ThemeProvider} from '@suid/material/styles';
import {render}        from 'solid-js/web';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

render(() => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>
), document.getElementById('app')!);
`}
  ]
};

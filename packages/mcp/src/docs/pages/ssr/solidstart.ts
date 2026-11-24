import type {BroDocPage} from '../../pages.js';

/** The page ssr/solidstart of Docs. */
export const solidstartPage: BroDocPage = {
  path: 'ssr/solidstart',
  name: 'SolidStart',
  text: `<!-- intro -->
SolidStart renders a page on the server, or at the build of a static site: its server entry prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and the component of the table renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in \`onMount()\`. The skin \`suid\` renders the components of SUID there with its server entry, \`@table-bro/solid-suid/server\`, by \`renderToString\` of Solid, with the styles of SUID and the CSS variables of the theme in their markup. The steps are the ones of the sample project \`samples/solid-suid/start\` of the repository, a static site of SolidStart 2 with Nitro, whose [working page](https://table-bro.com/samples/solid-suid/start) shows the prerendered table before its scripts run. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in SolidStart?

1. **Install the packages**

   The table and the skin, SUID, SolidStart with Nitro, which prerenders the page at the build, and the server DOM:

   {{install.sh}}

2. **Bundle SUID, the skin and the core for the server**

   SUID publishes its components as JSX, which the plugin of Solid compiles for the server only when the server bundle carries it: \`ssr.noExternal\` names SUID, the skin and the core. The sample builds a static site into \`dist\` with the page \`/\` prerendered. \`vite.config.ts\`:

   {{vite.config.ts}}

3. **Prerender the table**

   The elements of the core and of the skin extend the \`HTMLElement\` of the server DOM, which a module of its own gives to the global scope before they load. \`src/server-dom.ts\`:

   {{src/server-dom.ts}}

   The prerender takes the columns and the config of \`configure()\` and the theme of the application; the rows wait for the browser. \`src/prerender-orders.ts\`:

   {{src/prerender-orders.ts}}

   The server entry imports the server DOM first, and gives the prerendered table to the page by the locals of the request. \`src/entry-server.tsx\`:

   {{src/entry-server.tsx}}

   \`src/locals.d.ts\`:

   {{src/locals.d.ts}}

4. **Render the table in the page**

   The component of the table renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of Solid keeps, and \`configure()\` renders the table with its rows in its place. \`src/PrerenderedOrdersTable.tsx\`:

   {{src/PrerenderedOrdersTable.tsx}}

   The application renders it in the theme of SUID. \`src/app.tsx\`:

   {{src/app.tsx}}

5. **Give the server the light theme**

   The server does not know the color scheme of the system of the user: it renders the light palette, and the browser takes the scheme of the system. The palettes are the ones of [Solid data table](https://table-bro.com/docs/frameworks/solid). \`src/theme.ts\`:

   {{src/theme.ts}}

\`src/skin.ts\`, \`src/orders.ts\` and \`src/elements.d.ts\` are the ones of [Solid data table](https://table-bro.com/docs/frameworks/solid). The select of the page sizes renders as the native select of SUID on the server, since the select of the menu of SUID 0.19 fails in the server render of Solid; the browser renders the select of the menu.

#### Related

[Solid data table](https://table-bro.com/docs/frameworks/solid), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/solid-suid @suid/material @solidjs/start nitro linkedom
`},
    {file: 'vite.config.ts', language: 'ts', code: `import {solidStart}   from '@solidjs/start/config';
import {nitro}        from 'nitro/vite';
import {defineConfig} from 'vite';

// A static site: the build prerenders the page with its prerendered table into dist. The plugin of Solid compiles the
// components of SUID, published as JSX, for the browser and for the server, so the server bundle carries SUID and the
// skin; it carries the core too, which loads after the server DOM gives it its HTMLElement (src/server-dom.ts)
export default defineConfig({
  ssr: {noExternal: [/^@suid\\//, '@table-bro/core', '@table-bro/solid-suid']},
  plugins: [
    solidStart(),
    nitro({
      preset: 'static',
      prerender: {routes: ['/']},
      output: {dir: 'dist', publicDir: 'dist'}
    })
  ]
});
`},
    {file: 'src/server-dom.ts', language: 'ts', code: `import {parseHTML} from 'linkedom';

// The elements of the core and of the skin extend the HTMLElement of a server DOM: this module gives it to the global
// scope, and the modules that import it before the core and the skin load after it
const {window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;
`},
    {file: 'src/prerender-orders.ts', language: 'ts', code: `// The server DOM first: the core and the skin take its HTMLElement
import './server-dom';

import {prerenderTableBro} from '@table-bro/core';
import {setSuidTheme}      from '@table-bro/solid-suid/server';

import {parseHTML} from 'linkedom';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of SUID: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser. The
 * server entry of the skin renders its elements in the theme of the application.
 */
export function prerenderOrders(): PrerenderedTable {
  setSuidTheme(theme);

  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
    {file: 'src/entry-server.tsx', language: 'tsx', code: `// @refresh reload
// The server DOM first: the core and the skin, which the server bundle carries, take its HTMLElement
import './server-dom';

import {createHandler, StartServer} from '@solidjs/start/server';

import {prerenderOrders} from './prerender-orders';

// The page of the server carries the table prerendered in its loading state: the table of the page takes it from the
// locals of the request
export default createHandler(event => {
  event.locals.orders = prerenderOrders();

  return (
    <StartServer
      document={({assets, children, scripts}) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Table, Bro + SolidStart + Solid SUID</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
`},
    {file: 'src/locals.d.ts', language: 'ts', code: `// The prerendered table of the page in the locals of a request of the server
import type {PrerenderedTable} from './prerender-orders';

declare global {
  namespace App {
    interface RequestEventLocals {
      orders?: PrerenderedTable;
    }
  }
}
`},
    {file: 'src/PrerenderedOrdersTable.tsx', language: 'tsx', code: `import {onMount}                   from 'solid-js';
import {getRequestEvent, isServer} from 'solid-js/web';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

/**
 * The table of the orders with its prerender: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place. The hydration of Solid keeps the markup of the server, which the browser has no copy of.
 */
export function PrerenderedOrdersTable() {
  let table!: TableBroHTMLElement;
  const prerendered = isServer ? getRequestEvent()?.locals.orders : undefined;
  // The attributes of the prerender as they are, but the id, which the element has: the spread of Solid writes the class
  // of a property with a space after it
  const attributes = Object.fromEntries(Object.entries(prerendered?.attributes ?? {})
    .filter(([name]) => name !== 'id')
    .map(([name, value]) => [\`attr:\${name}\`, value]));

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro {...attributes} id="orders" ref={table} theme="auto" innerHTML={prerendered?.html}
                 on:bro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
    {file: 'src/app.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@suid/material/CssBaseline';
import {ThemeProvider} from '@suid/material/styles';

import {PrerenderedOrdersTable} from './PrerenderedOrdersTable';
import {theme}                  from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrerenderedOrdersTable />
    </ThemeProvider>
  );
}
`},
    {file: 'src/theme.ts', language: 'ts', code: `import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';
import {isServer}                             from 'solid-js/web';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the azure
// palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the surface
// as the background of the table, the outline as the borders of the rows and the outline of the chips, and the font
// Roboto. The page stays light, as the page of that sample, and the table follows the color scheme of the system:
// the server renders the light one, and the browser follows a change of the scheme
const scheme = isServer ? undefined : window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme?.matches ?? false);

scheme?.addEventListener('change', event => setDark(event.matches));

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
`}
  ]
};

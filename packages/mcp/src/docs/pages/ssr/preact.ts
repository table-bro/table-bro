import type {BroDocPage} from '../../pages.js';

/** The page ssr/preact of Docs. */
export const preactPage: BroDocPage = {
  path: 'ssr/preact',
  name: 'Preact (Astro)',
  text: `<!-- intro -->
Astro renders a page at the build of a static site, or on the server: the frontmatter of the page prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and a component of Preact, which Astro hydrates in the browser, renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in an effect. The skin \`mui\` renders the components of MUI there with its server entry, \`@table-bro/react-mui/server\`, through \`preact/compat\`, which takes the place of React in the browser and on the server. The steps are the ones of the sample project \`samples/preact-astro\` of the repository, a static site of Astro 7 with Preact 11: its [working page](https://table-bro.com/samples/preact-astro/) shows the prerendered table before its scripts run. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Astro?

1. **Install the packages**

   The table and the skin, MUI with Emotion, Preact, Astro with its integration of Preact, and the server DOM:

   {{install.sh}}

2. **Run MUI through preact/compat and bundle it for the prerender**

   The integration of Preact with \`compat: true\` gives MUI and the skin \`preact/compat\` in place of React, in the browser and on the server. The build of the prerender bundles MUI, Emotion, the core and the skin, so that they import \`preact/compat\` and the core loads after the server DOM: Astro 7 builds the prerender in an environment of Vite of its own, which \`resolve.noExternal\` covers and \`ssr.noExternal\` does not. The sample builds a static site into \`dist\` under the base path of its working page. \`astro.config.ts\`:

   {{astro.config.ts}}

3. **Prerender the table**

   The elements of the core and of the skin extend the \`HTMLElement\` of the server DOM, which a module of its own gives to the global scope before they load. \`src/server-dom.ts\`:

   {{src/server-dom.ts}}

   The prerender takes the columns and the config of \`configure()\` and the theme of the application; the rows wait for the browser. The function imports the server entry of the skin itself, so that the entry registers the skin \`mui\` with its elements after the browser entry, which the table of the page imports. \`src/prerender-orders.ts\`:

   {{src/prerender-orders.ts}}

4. **Render the table in the page**

   The frontmatter of the page imports the server DOM first and prerenders the table at the build. \`InitColorSchemeScript\` of MUI sets the color scheme before the page shows, light as the page of the sample of Angular Material, and the component \`App\` takes the prerendered table, which \`client:load\` hydrates in the browser. \`src/pages/index.astro\`:

   {{src/pages/index.astro}}

   \`App\` renders the table in the MUI theme of the application, whose server render gives the page the CSS variables of the theme in its styles of Emotion. \`src/App.tsx\`:

   {{src/App.tsx}}

   The component of the table renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of Preact keeps, and \`configure()\` renders the table with its rows in its place. \`src/OrdersTable.tsx\`:

   {{src/OrdersTable.tsx}}

\`src/theme.ts\`, \`src/skin.ts\`, \`src/orders.ts\` and \`src/elements.d.ts\` are the ones of [Preact data table](https://table-bro.com/docs/frameworks/preact).

#### Related

[Preact data table](https://table-bro.com/docs/frameworks/preact), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/react-mui @mui/material @emotion/react @emotion/styled @emotion/cache preact astro @astrojs/preact linkedom
`},
    {file: 'astro.config.ts', language: 'ts', code: `import preact         from '@astrojs/preact';
import {defineConfig} from 'astro/config';

// A static site: the build prerenders the page with its prerendered table into dist under the base path of BASE_PATH.
// preact/compat takes the place of React for MUI and the skin, in the browser and on the server. The build of the
// prerender bundles MUI, Emotion and the skin, so that they import preact/compat; it bundles the core too, which loads
// after the server DOM gives it its HTMLElement (src/server-dom.ts). resolve.noExternal covers the environment of the
// prerender, which ssr.noExternal does not
export default defineConfig({
  base: process.env.BASE_PATH,
  integrations: [preact({compat: true})],
  vite: {
    resolve: {noExternal: [/^@mui\\//, /^@emotion\\//, '@table-bro/core', '@table-bro/react-mui']}
  }
});
`},
    {file: 'src/server-dom.ts', language: 'ts', code: `import {parseHTML} from 'linkedom';

// The elements of the core and of the skin extend the HTMLElement of a server DOM: this module gives it to the global
// scope, and the modules that import it before the core and the skin load after it
const {window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;
`},
    {file: 'src/prerender-orders.ts', language: 'ts', code: `// The server DOM first: the core takes its HTMLElement
import './server-dom';

import {prerenderTableBro} from '@table-bro/core';

import {parseHTML} from 'linkedom';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of MUI: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser. The
 * server entry of the skin renders its elements in the theme of the application.
 */
export async function prerenderOrders(): Promise<PrerenderedTable> {
  // The server entry registers the skin mui with its elements for the server DOM after the browser entry, which the
  // table of the page imports, has registered it without them
  const {setMuiTheme} = await import('@table-bro/react-mui/server');

  setMuiTheme(theme);

  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
    {file: 'src/pages/index.astro', language: 'astro', code: `---
// The server DOM first: the core and the skin, which the server bundle carries, take its HTMLElement
import '../server-dom';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import {App}             from '../App';
import {prerenderOrders} from '../prerender-orders';

// The table of the orders, prerendered in its loading state at the build
const prerendered = await prerenderOrders();
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Table, Bro + Astro + Preact MUI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    {/* The color scheme of MUI on the page before its scripts run, as the theme of App sets it in the browser */}
    <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="light" />
    <App client:load prerendered={prerendered} />
  </body>
</html>
`},
    {file: 'src/App.tsx', language: 'tsx', code: `import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';

import {OrdersTable}           from './OrdersTable';
import type {PrerenderedTable} from './prerender-orders';
import {theme}                 from './theme';

/**
 * The component of the page that Astro hydrates in the browser: the MUI theme of the application, whose server render
 * gives the page the CSS variables of the theme in its styles of Emotion, and the table. The page is light, as the page
 * of the sample of Angular Material; the table takes the scheme of the system by its theme.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function App({prerendered}: {prerendered: PrerenderedTable}) {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <OrdersTable prerendered={prerendered} />
    </ThemeProvider>
  );
}
`},
    {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import './skin';

import {useEffect, useRef} from 'preact/hooks';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows}      from './orders';
import type {PrerenderedTable} from './prerender-orders';

/**
 * The table of the orders: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place. The hydration of Preact keeps the markup of the server.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function OrdersTable({prerendered}: {prerendered: PrerenderedTable}) {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    table.current!.configure({cols, rows, conf});
  }, []);

  return (
    <div class="bro-table-shadow-container">
      <table-bro {...prerendered.attributes} ref={table} theme="auto" dangerouslySetInnerHTML={{__html: prerendered.html}}
                 onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`}
  ]
};

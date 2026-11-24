import type {BroDocPage} from '../../pages.js';

/** The page ssr/nextjs of Docs. */
export const nextjsPage: BroDocPage = {
  path: 'ssr/nextjs',
  name: 'Next.js',
  text: `<!-- intro -->
Next.js renders a page on the server, or at the build of a static export: a server component prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and a client component renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in an effect. The skin \`mui\` renders the components of MUI there with its server entry, \`@table-bro/react-mui/server\`, and the styles of Emotion in their markup. The steps are the ones of the sample project \`samples/react-mui/next\` of the repository, a static export with Next.js 16: its [working page](https://table-bro.com/samples/react-mui/next/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/next) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Next.js?

1. **Install the packages**

   The table and the skin, MUI with Emotion and its adapter for the App Router of Next.js, the server DOM, and \`server-only\`, which keeps the prerender out of the bundle of the browser:

   {{install.sh}}

2. **Keep the packages of the table out of the server bundle**

   The server entry of the skin renders by \`react-dom/server\`, which the server components of Next.js do not bundle: \`serverExternalPackages\` lets Node take the packages of the table as they are. The sample also exports static pages into \`dist\` under the base path of its working page. \`next.config.ts\`:

   {{next.config.ts}}

3. **Prerender the table**

   The server DOM gives its \`HTMLElement\` to the global scope before the import of the skin, as its elements extend it. The prerender takes the columns and the config of \`configure()\` and the theme of the application; the rows wait for the browser. \`src/prerender-table.ts\`:

   {{src/prerender-table.ts}}

4. **Render the table in the page**

   The page, a server component, prerenders the table and gives it to the client component of the table. \`src/app/page.tsx\`:

   {{src/app/page.tsx}}

   The client component renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of React keeps, and \`configure()\` renders the table with its rows in its place. \`src/OrdersTable.tsx\`:

   {{src/OrdersTable.tsx}}

5. **Give the application its theme and the CSS of the table**

   \`InitColorSchemeScript\` sets the color scheme before the page shows, light as the page of the sample of Angular Material, and the provider of MUI for the App Router gives the styles of Emotion of the server render to the page. \`src/app/layout.tsx\`:

   {{src/app/layout.tsx}}

   \`src/app/Providers.tsx\`, whose \`defaultMode="light"\` keeps the page light; the table takes the color scheme of the system by its theme:

   {{src/app/Providers.tsx}}

   The CSS of the core and of the skin come by \`src/app/globals.css\`:

   {{src/app/globals.css}}

\`src/theme.ts\`, \`src/skin.ts\`, \`src/orders.ts\` and \`src/elements.d.ts\` are the ones of [React data table](https://table-bro.com/docs/frameworks/react).

#### Related

[React data table](https://table-bro.com/docs/frameworks/react), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/react-mui @mui/material @mui/material-nextjs @emotion/react @emotion/styled @emotion/cache linkedom server-only
`},
    {file: 'next.config.ts', language: 'ts', code: `import type {NextConfig} from 'next';

// A static export: the build renders the page with its prerendered table. The server entry of the skin renders the
// components of MUI by react-dom/server, so Node takes it and its libraries as they are, not the bundle of Next.js
const config: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: process.env.BASE_PATH ?? '',
  trailingSlash: true,
  serverExternalPackages: ['@table-bro/core', '@table-bro/react-mui', 'linkedom']
};

export default config;
`},
    {file: 'src/prerender-table.ts', language: 'ts', code: `import 'server-only';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of MUI: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export async function prerenderOrders(): Promise<PrerenderedTable> {
  const {parseHTML} = await import('linkedom');
  const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

  // The elements of the skin extend the HTMLElement of the server DOM: it is global before the import of the skin
  globalThis.HTMLElement ??= window.HTMLElement;

  const {prerenderTableBro} = await import('@table-bro/core');
  const {setMuiTheme} = await import('@table-bro/react-mui/server');

  setMuiTheme(theme);

  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
    {file: 'src/app/page.tsx', language: 'tsx', code: `import {OrdersTable}     from '../OrdersTable';
import {prerenderOrders} from '../prerender-table';

export default async function Page() {
  return <OrdersTable prerendered={await prerenderOrders()} />;
}
`},
    {file: 'src/OrdersTable.tsx', language: 'tsx', code: `'use client';

import './skin';

import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows}           from './orders';
import type {PrerenderedTable} from './prerender-table';

/**
 * The table of the orders: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function OrdersTable({prerendered}: {prerendered: PrerenderedTable}) {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    queueMicrotask(() => element.configure({cols, rows, conf}));
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro {...prerendered.attributes} ref={table} theme="auto" dangerouslySetInnerHTML={{__html: prerendered.html}}></table-bro>
    </div>
  );
}
`},
    {file: 'src/app/layout.tsx', language: 'tsx', code: `import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import type {ReactNode}      from 'react';

import {Providers} from './Providers';

import './globals.css';
import './sample-page.css';

export const metadata = {title: 'Table, Bro + Next.js + React MUI'};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="light" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`},
    {file: 'src/app/Providers.tsx', language: 'tsx', code: `'use client';

import CssBaseline              from '@mui/material/CssBaseline';
import {ThemeProvider}          from '@mui/material/styles';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v16-appRouter';
import type {ReactNode}         from 'react';

import {theme} from '../theme';

/**
 * The MUI theme of the application with the styles of Emotion of the server render of Next.js. The page is light, as the
 * page of the sample of Angular Material; the table takes the scheme of the system by its theme.
 */
export function Providers({children}: {children: ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
`},
    {file: 'src/app/globals.css', language: 'css', code: `/* The CSS of the core and of the skin */
@import '@table-bro/core/dist/table-bro.min.css';
@import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
`}
  ]
};

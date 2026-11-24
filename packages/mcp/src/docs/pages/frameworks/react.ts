import type {BroDocPage}                                                                 from '../../pages.js';
import {mcpInstall, mcpSection, muiInstall, muiSkin, muiTheme, ordersFile, skinsSection} from '../shared.js';

/** The page frameworks/react of Docs. */
export const reactPage: BroDocPage = {
  path: 'frameworks/react',
  name: 'React data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a React 19 app renders it in JSX as it is, without a wrapper package. A ref gives the element its columns, rows and config by \`configure()\`, an effect adds the listener of its \`bro-action\` events, and the \`theme\` prop sets its theme. The [working page](https://table-bro.com/samples/react-mui/react) is the sample project \`samples/react-mui/react\` of the repository, with React 19.3 and the React MUI skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/react) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/react\` and Native work in React the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in React?

${mcpSection('#####', 'React')}

##### Install manually

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/react-mui\`, and MUI with Emotion, its styles. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in React the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the theme of the application**

   The MUI theme of the application turns on its CSS variables, which the table reads, and the attribute of its color schemes, which a table with a theme of its own sets. Its light and dark schemes have the colors of the sample of Angular Material, the azure palette of Material 3, so that the table looks as the table of the skin \`mat\`. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`mui\`, and \`setMuiTheme()\` gives its elements the theme. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of MUI**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [Next.js](https://table-bro.com/docs/ssr/nextjs) come after these: a server component prerenders the table in its loading state in the markup of MUI.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call after the first render, through \`queueMicrotask()\`: the elements of the skin render by \`flushSync\` of React, which waits for the end of the effects, and the table measures them right after it renders them. The same effect adds the listener of \`bro-action\` and removes it at the end; the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

React 19 sets a prop of a custom element as a property when the element has a property of that name, and as an attribute otherwise ([React 19, Support for Custom Elements](https://react.dev/blog/2024/12/05/react-19)): \`theme\` is a property of \`‹table-bro›\`. \`"jsx": "react-jsx"\` in \`tsconfig.json\` of the sample gives the JSX runtime of React to TypeScript and to Vite.

#### How does TypeScript know the element?

JSX of React knows the HTML elements only; a declaration adds \`‹table-bro›\` with the methods of \`TableBroHTMLElement\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of MUI, which writes the CSS variables of the theme, with \`CssBaseline\`. \`defaultMode="light"\` keeps the page light, as the page of the sample of Angular Material; the table takes the color scheme of the system by its theme:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-mui-color-scheme\` of the MUI theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does React 19 need a wrapper for Custom Elements?

No. React 19 passes the props of a custom element as properties or attributes ([React, Custom HTML elements](https://react.dev/reference/react-dom/components#custom-html-elements)) and passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Table, Bro takes its data by \`configure()\` through a ref, which works in every version of React.

##### Can I listen to bro-action without a ref?

The sample uses \`addEventListener\` in an effect: it works in React 18 and 19 and removes the listener on unmount.

##### Does it work with Next.js?

Yes. The table renders in the browser, as \`configure()\` runs in an effect of a client component (\`'use client'\`), and the server render of Next.js prerenders it in its loading state in the markup of MUI: [Next.js](https://table-bro.com/docs/ssr/nextjs).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Next.js](https://table-bro.com/docs/ssr/nextjs), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    muiInstall,
    muiTheme,
    muiSkin,
    {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + React MUI</title>
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
    ordersFile('mui'),
    {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of React, with its attribute theme
import type {DetailedHTMLProps, HTMLAttributes} from 'react';

import type {TableBroHTMLElement} from '@table-bro/core';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': DetailedHTMLProps<HTMLAttributes<TableBroHTMLElement>, TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }
  }
}
`},
    {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    // The elements of the skin render by flushSync of React, which waits for the end of the effects: the table
    // renders after them, and measures its elements rendered
    queueMicrotask(() => element.configure({cols, rows, conf}));
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"></table-bro>
    </div>
  );
}
`},
    {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {StrictMode}    from 'react';
import {createRoot}    from 'react-dom/client';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

// The page is light, as the page of the sample of Angular Material; the table takes the scheme of the system by its
// theme
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <OrdersTable />
    </ThemeProvider>
  </StrictMode>
);
`}
  ]
};

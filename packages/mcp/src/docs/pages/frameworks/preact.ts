import type {BroDocPage}                                                                from '../../pages.js';
import {mcpInstall, mcpSection, muiInstall, muiOrders, muiSkin, muiTheme, skinsSection} from '../shared.js';

/** The page frameworks/preact of Docs. */
export const preactPage: BroDocPage = {
  path: 'frameworks/preact',
  name: 'Preact data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Preact app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, the prop \`onbro-action\` listens to its events, and the \`theme\` prop sets its theme. The [working page](https://table-bro.com/samples/react-mui/preact) is the sample project \`samples/react-mui/preact\` of the repository, with Preact 11 and the React MUI skin through \`preact/compat\`; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/preact) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/preact\` and Native work in Preact the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Preact?

${mcpSection('#####', 'Preact')}

##### Install manually

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/react-mui\`, MUI with Emotion, its styles, and Preact. MUI and the skin are components of React, which Preact runs through \`preact/compat\`. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Preact without it, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Run React through preact/compat**

   The aliases of Vite give MUI and the skin \`preact/compat\` in place of React. \`vite.config.ts\`, where \`samplePage\` is the config of the working page; a project of its own exports \`defineConfig()\` with the aliases alone:

   {{vite.config.ts}}

   \`paths\` of \`tsconfig.json\` give their types the ones of \`preact/compat\`, and \`"jsxImportSource": "preact"\` the JSX runtime of Preact:

   {{tsconfig.json}}

3. **Give the skin the theme of the application**

   The MUI theme of the application turns on its CSS variables, which the table reads, and the attribute of its color schemes, which a table with a theme of its own sets. Its light and dark schemes have the colors of the sample of Angular Material, the azure palette of Material 3, so that the table looks as the table of the skin \`mat\`. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`mui\`, and \`setMuiTheme()\` gives its elements the theme. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

4. **Load the fonts of MUI**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

5. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [Preact (Astro)](https://table-bro.com/docs/ssr/preact) come after these: the build of Astro prerenders the table in its loading state in the markup of MUI.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call; Preact renders the elements of the skin at once. Preact adds a listener for an event prop it does not know by the exact name after \`on\`, \`bro-action\` for \`onbro-action\` ([Preact, Web Components](https://preactjs.com/guide/v10/web-components/)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}


#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Preact, with the methods of \`TableBroHTMLElement\` and the prop \`onbro-action\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of MUI, which writes the CSS variables of the theme, with \`CssBaseline\`. \`defaultMode="light"\` keeps the page light, as the page of the sample of Angular Material; the table takes the color scheme of the system by its theme:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-mui-color-scheme\` of the MUI theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Preact need a wrapper for Custom Elements?

No. Preact passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Its package \`preact-custom-element\` also turns a Preact component into a Custom Element ([Preact, preact-custom-element](https://preactjs.com/guide/v10/preact-custom-element/)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does preact/compat change it?

\`‹table-bro›\` is an element of the DOM, the same in Preact and in React. \`preact/compat\` runs MUI and the skin, which are components of React.

##### Does it work with Astro?

Yes. The table renders in the browser, as \`configure()\` runs in an effect of a component of Preact that Astro hydrates, and the build of Astro prerenders it in its loading state in the markup of MUI, with the server entry of the skin: [Preact (Astro)](https://table-bro.com/docs/ssr/preact).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Preact (Astro)](https://table-bro.com/docs/ssr/preact), [Angular data table](https://table-bro.com/docs/frameworks/angular), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    {...muiInstall, code: muiInstall.code.replace('\n', ' preact\n')},
    {file: 'vite.config.ts', language: 'ts', code: `import {samplePage} from './sample-page.config.ts';

// MUI and the skin import React: preact/compat takes its place
export default {
  ...samplePage,
  resolve: {
    alias: {
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      react: 'preact/compat'
    }
  }
};
`},
    {file: 'tsconfig.json', language: 'json', code: `{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    /* The types of MUI and of the skin take the ones of React from preact/compat */
    "paths": {
      "react": ["./node_modules/preact/compat"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"],
      "react-dom": ["./node_modules/preact/compat"],
      "react-dom/client": ["./node_modules/preact/compat/client"]
    },

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`},
    muiTheme,
    muiSkin,
    {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Preact MUI</title>
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
    muiOrders,
    {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of Preact, with its attribute theme and its event bro-action
import type {HTMLAttributes} from 'preact';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'; 'onbro-action'?: (event: CustomEvent<BroActionDetail>) => void};
    }
  }
}
`},
    {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {useEffect, useRef} from 'preact/hooks';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    table.current!.configure({cols, rows, conf});
  }, []);

  return (
    <div class="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"
                 onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
    {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {render}        from 'preact';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

// The page is light, as the page of the sample of Angular Material; the table takes the scheme of the system by its
// theme
render(
  <ThemeProvider theme={theme} defaultMode="light">
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>,
  document.getElementById('app')!
);
`}
  ]
};

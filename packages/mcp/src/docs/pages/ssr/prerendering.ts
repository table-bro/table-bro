import type {BroDocPage} from '../../pages.js';
import {frameworkOrders} from '../shared.js';

/** The page ssr/prerendering of Docs. */
export const prerenderingPage: BroDocPage = {
  path: 'ssr/prerendering',
  name: 'Prerender function',
  text: `<!-- intro -->
A page that a server renders shows the table before any script runs. The prerender renders the table in its loading state: the toolbar, the column headers, the loading row and the paginator, in the markup of its skin. The CSS of the skin sizes it, so the table takes its place on the page at once, and the page has no layout shift when the table renders in the browser. There the table renders with its rows in the same element, and the loading animation goes on instead of starting over. The pages of this section show the prerender in Angular SSR, Astro with Preact, Next.js, SolidStart, SvelteKit and Nuxt, each with its sample project; this page shows the function that renders the table on any server with a DOM, and the limits of the prerender.

<!-- setup -->
#### prerenderTableBro() _since 1.2.0_

Without Angular, \`prerenderTableBro(element, {cols, conf})\` of \`@table-bro/core\` renders the table into a \`‹table-bro›\` element of a server DOM, a DOM without a browser. It takes the columns and the config of \`configure()\`; the rows wait for the browser. The table creates its nodes in the document of the element, so the server needs no global \`document\`, and the imports of the core and of the skins \`bs\` and \`nv\` work without a DOM. The element goes into its document before the call, so that the elements of the skin render their markup as they connect:

{{src/prerender.ts}}

In the browser, \`configure()\` on the same element renders the table with its rows in place of the prerender:

{{src/browser.ts}}

The columns, the rows and the config come from \`src/orders.ts\`:

{{src/orders.ts}}

#### Limits

1. **The loading state only**

   The prerender renders the table without rows, in its loading state: the rows, the sort and the pages come with the table of the browser.

2. **The theme auto**

   The server does not know the color scheme of the system of the user. With the theme \`auto\` the prerendered table takes no class of a theme and shows the theme of the page; the table of the browser then follows the system. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

3. **The elements of the skin**

   The elements of a skin render on the server only when the skin defines them in a registry of custom elements, \`BroSkinConfig.defineElements(registry)\`, as \`bs\` and \`nv\` do and \`mui\`, \`suid\`, \`m3-svelte\` and \`vuetify\` do with their server entries, and the window of the server DOM has that registry, \`customElements\`. Without them the toolbar, the column headers and the paginator stay the empty tags of the skin with their attributes until the browser renders the table. \`‹table-bro-ng›\` gives the server DOM of Angular a registry for the time of the prerender, and renders the elements of \`mat\` with its Angular components.

4. **Critical CSS**

   A production build of Angular inlines the critical CSS of a page with Beasties and loads the whole stylesheet after the page shows (\`optimization.styles.inlineCritical\`). The scripts of the page may run before the stylesheet loads: the table then measures its parts without the styles of the components of its skin, and keeps that geometry, with its body collapsed. Turn the inlining off, as the samples of Angular do, so that the stylesheet loads before the page shows. To \`"production"\` of the configurations of the build in \`angular.json\`:

   {{angular-optimization.json}}

   The CSS of the core and of the skins keeps the layout of a prerendered table with the critical CSS too, which drops the selectors that start with a pseudo-class: the sizes of a skin come also by \`table-bro:where([data-bro-prerender].<skin>)\`, so the prerendered table keeps its size before the stylesheets of the page load.

#### Related

[Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'src/prerender.ts', language: 'ts', code: `import {prerenderTableBro} from '@table-bro/core';
// The import registers the skin nv; without a DOM it defines no elements
import '@table-bro/native';

import {cols, conf} from './orders';

/**
 * Renders the table of the orders in its loading state into a page of a server DOM. The element is in the document
 * first, so the elements of the skin connect and render their markup.
 * @param page - the document of the page in the server DOM
 */
export function prerenderOrders(page: Document): void {
  const table = page.createElement('table-bro');

  page.body.append(table);
  prerenderTableBro(table, {cols, conf});
}
`},
    {file: 'src/browser.ts', language: 'ts', code: `import '@table-bro/native';

import {cols, conf, rows} from './orders';

// The prerendered table of the page: configure() renders the table with its rows in its place
document.querySelector('table-bro')!.configure({cols, rows, conf});
`},
    frameworkOrders,
    {file: 'angular-optimization.json', language: 'json', code: `"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": false
  },
  "fonts": true
}
`}
  ]
};

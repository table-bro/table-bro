import type {BroDocPage}  from '../../pages.js';
import {ssrAngularPage}   from './angular.js';
import {nextjsPage}       from './nextjs.js';
import {nuxtPage}         from './nuxt.js';
import {ssrPreactPage}    from './preact.js';
import {prerenderingPage} from './prerendering.js';
import {solidstartPage}   from './solidstart.js';
import {sveltekitPage}    from './sveltekit.js';

/** The page ssr of Docs. */
export const ssrPage: BroDocPage = {
  path: 'ssr',
  name: 'Server-side rendering',
  text: `<!-- intro -->
A page that a server renders shows the table before any script runs: the prerender renders the table in its loading state, with the toolbar, the column headers, the loading row and the paginator in the markup of its skin, and the table takes its place on the page at once, without a layout shift. In the browser the table renders with its rows in the same element. The pages of this section show it in Angular SSR, where \`‹table-bro-ng›\` prerenders the table itself, and in Astro with Preact, Next.js, SolidStart, SvelteKit and Nuxt, where \`prerenderTableBro()\` renders it into a server DOM with the elements of the skin of the framework, each with the steps of its sample project in the repository and a working page. Prerender function shows \`prerenderTableBro()\` on any server with a DOM, and the limits of the prerender.`,
  files: []
};

/** The pages of the section Server-side rendering of Docs, in the order of the menu of Docs. */
export const ssrPages: BroDocPage[] = [ssrPage, ssrAngularPage, ssrPreactPage, nextjsPage, solidstartPage, sveltekitPage, nuxtPage, prerenderingPage];

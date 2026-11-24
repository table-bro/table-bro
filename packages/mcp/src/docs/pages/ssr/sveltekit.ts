import type {BroDocPage} from '../../pages.js';

/** The page ssr/sveltekit of Docs. */
export const sveltekitPage: BroDocPage = {
  path: 'ssr/sveltekit',
  name: 'SvelteKit',
  text: `<!-- intro -->
SvelteKit renders a page on the server, or at its build: the load of the page on the server prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and the page renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in \`onMount()\`. The skin \`m3-svelte\` renders the components of M3 Svelte there with its server entry, \`@table-bro/svelte-m3/server\`, by \`render()\` of \`svelte/server\`. The steps are the ones of the sample project \`samples/svelte-m3/sveltekit\` of the repository, static pages of SvelteKit 3: its [working page](https://table-bro.com/samples/svelte-m3/sveltekit/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/svelte-m3/sveltekit) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in SvelteKit?

1. **Install the packages**

   The table and the skin, M3 Svelte and the plugin of its CSS, the server DOM, and SvelteKit with its adapter of static pages:

   {{install.sh}}

2. **Compile M3 Svelte and prerender the pages**

   SvelteKit compiles the components of M3 Svelte for the browser and for the server, and the plugin of M3 Svelte the CSS of their styles; the condition \`svelte\` of the exports of the skin lets SvelteKit bundle the skin with them on the server. The plugin names Vite 7 as its peer dependency and works with Vite 8, by \`"overrides": {"vite-plugin-functions-mixins": {"vite": "$vite"}}\` in \`package.json\`. The sample writes static pages into \`dist\` under the base path of its working page. \`vite.config.ts\`:

   {{vite.config.ts}}

   \`src/routes/+layout.ts\` prerenders the pages at the build:

   {{src/routes/+layout.ts}}

3. **Give the server DOM to the elements**

   The elements of the skin extend the \`HTMLElement\` of the server DOM: the hooks of the server make it global, before the server imports the core and the skin with the modules of the pages. \`src/hooks.server.ts\`:

   {{src/hooks.server.ts}}

4. **Prerender the table**

   The prerender takes the columns and the config of \`configure()\`; the rows wait for the browser. The folder \`server\` of \`#lib\` keeps it out of the bundle of the browser. \`src/lib/server/prerender-table.ts\`:

   {{src/lib/server/prerender-table.ts}}

   The load of the page on the server gives the prerendered table to the page. \`src/routes/+page.server.ts\`:

   {{src/routes/+page.server.ts}}

5. **Render the table in the page**

   The page renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of Svelte keeps, and \`configure()\` renders the table with its rows in its place. \`src/routes/+page.svelte\`:

   {{src/routes/+page.svelte}}

\`src/lib/skin.ts\`, \`src/lib/theme.css\` and \`src/lib/orders.ts\` are the ones of \`src/skin.ts\`, \`src/theme.css\` and \`src/orders.ts\` of [Svelte data table](https://table-bro.com/docs/frameworks/svelte).

#### Related

[Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/svelte-m3 m3-svelte linkedom
npm install -D @sveltejs/kit @sveltejs/adapter-static vite-plugin-functions-mixins
`},
    {file: 'vite.config.ts', language: 'ts', code: `import adapter           from '@sveltejs/adapter-static';
import {sveltekit}       from '@sveltejs/kit/vite';
import {defineConfig}    from 'vite';
import {functionsMixins} from 'vite-plugin-functions-mixins';

// M3 Svelte publishes its components as their sources: SvelteKit compiles them for the browser and for the server, and
// the plugin of M3 Svelte the mixins and the functions of their CSS. The pages are prerendered at the build into dist,
// under the base path of the variable BASE_PATH, as the working page of table-bro.com has it; a project of its own
// leaves it out. The paths of the pages are absolute: table-bro.com serves a page without the trailing slash, and a
// relative ./_app would point to the folder above it
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({pages: 'dist', assets: 'dist'}),
      paths: {base: process.env.BASE_PATH ?? '', relative: false}
    }),
    functionsMixins({deps: ['m3-svelte']})
  ]
});
`},
    {file: 'src/routes/+layout.ts', language: 'ts', code: `// The page is prerendered at the build, with the table in its loading state
export const prerender = true;
`},
    {file: 'src/hooks.server.ts', language: 'ts', code: `import {parseHTML} from 'linkedom';

// The elements of the skin extend the HTMLElement of the server DOM of the prerender, linkedom: it is global before the
// server imports the core and the skin, which SvelteKit does after the hooks, with the modules of the pages
globalThis.HTMLElement ??= parseHTML('<!doctype html><html><body></body></html>').window.HTMLElement;
`},
    {file: 'src/lib/server/prerender-table.ts', language: 'ts', code: `import {prerenderTableBro} from '@table-bro/core';
import '@table-bro/svelte-m3/server';

import {parseHTML} from 'linkedom';

import {cols, conf} from '../orders';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of M3 Svelte: the
 * page shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export function prerenderOrders(): PrerenderedTable {
  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
    {file: 'src/routes/+page.server.ts', language: 'ts', code: `import type {PageServerLoad} from './$types';
import {prerenderOrders}     from '#lib/server/prerender-table';

export const load: PageServerLoad = () => ({prerendered: prerenderOrders()});
`},
    {file: 'src/routes/+page.svelte', language: 'svelte', code: `<script lang="ts">
  // The skin is registered before the tables
  import '#lib/skin';

  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from '#lib/orders';

  import type {PageProps} from './$types';

  // The page of the server has the table prerendered, and configure() renders it with its rows in the browser, in its
  // place
  let {data}: PageProps = $props();
  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro {...data.prerendered.attributes} bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}>{@html data.prerendered.html}</table-bro>
</div>
`}
  ]
};

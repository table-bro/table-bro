import type {BroDocPage} from '../../pages.js';

/** The page ssr/nuxt of Docs. */
export const nuxtPage: BroDocPage = {
  path: 'ssr/nuxt',
  name: 'Nuxt',
  text: `<!-- intro -->
Nuxt renders a page on the server, or at the build of a static site: a component prerenders the table on the server with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), \`useAsyncData()\` carries the markup to the browser, and \`configure()\` renders the table with its rows in \`onMounted()\`. The skin \`vuetify\` renders the components of Vuetify there with its server entry, \`@table-bro/vue-vuetify/server\`, by the synchronous part of the server render of Vue. The steps are the ones of the sample project \`samples/vue-vuetify/nuxt\` of the repository, a static site with Nuxt 4: its [working page](https://table-bro.com/samples/vue-vuetify/nuxt/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/vue-vuetify/nuxt) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Nuxt?

1. **Install the packages**

   The table and the skin, Vuetify and the server DOM:

   {{install.sh}}

2. **Take Vuetify and the skin through the build**

   The components of Vuetify import their styles, so the build of Nuxt takes Vuetify and the skin through Vite (\`build.transpile\`); the template compiler knows \`‹table-bro›\` as a Custom Element, and the CSS of Vuetify, of the core and of the skin come by \`css\`. The sample also generates its static pages into \`dist\` under the base path of its working page. \`nuxt.config.ts\`:

   {{nuxt.config.ts}}

3. **Give the application its Vuetify**

   A plugin installs a Vuetify for each render of the server and in the browser, with \`ssr: true\` and the themes of [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), and provides it. \`app/plugins/vuetify.ts\`:

   {{app/plugins/vuetify.ts}}

   In the browser, the import of the skin defines \`‹table-bro›\` and registers the skin, and \`setVuetify()\` gives its elements the Vuetify of the application. \`app/plugins/table-bro.client.ts\`:

   {{app/plugins/table-bro.client.ts}}

4. **Prerender the table**

   The server DOM gives its \`HTMLElement\` to the global scope before the import of the skin, as its elements extend it, and the server entry takes the Vuetify of the render. The prerender takes the columns and the config of \`configure()\`; the rows wait for the browser. \`app/prerender-table.ts\`:

   {{app/prerender-table.ts}}

5. **Render the table in the page**

   The component prerenders the table on the server in \`useAsyncData()\`, renders \`‹table-bro›\` with its attributes and its markup, which the hydration of Vue keeps, and \`configure()\` renders the table with its rows in its place. \`app/components/OrdersTable.vue\`:

   {{app/components/OrdersTable.vue}}

   \`app/app.vue\` renders it in \`VApp\` of Vuetify:

   {{app/app.vue}}

\`app/orders.ts\` is \`src/orders.ts\` of [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).

#### Related

[Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/vue-vuetify vuetify linkedom nuxt
`},
    {file: 'nuxt.config.ts', language: 'ts', code: `// A static site: the build prerenders the page with its table in the markup of Vuetify, into dist under the base path
// of BASE_PATH. Vue compiles <table-bro> of its templates as a Custom Element, and the build takes Vuetify and the skin
// through Vite, with the styles that their components import
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  app: {
    baseURL: \`\${process.env.BASE_PATH ?? ''}/\`,
    head: {
      title: 'Table, Bro + Nuxt + Vue Vuetify',
      link: [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons'}
      ]
    }
  },
  css: ['vuetify/styles', '@table-bro/core/dist/table-bro.min.css', '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css', '~/assets/sample-page.css'],
  build: {
    transpile: ['vuetify', '@table-bro/vue-vuetify']
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('table-bro')
    }
  },
  nitro: {
    output: {
      publicDir: 'dist'
    }
  }
});
`},
    {file: 'app/plugins/vuetify.ts', language: 'ts', code: `import {createVuetify, type ThemeDefinition} from 'vuetify';
import {md3}                                 from 'vuetify/blueprints';
import {aliases, md}                         from 'vuetify/iconsets/md';

// The light theme of the sample of Angular Material, its azure palette, in the colors of Vuetify: the system tokens of
// mat of the same roles. The light surface of Vuetify is the surface variant of Material, the surface variant of
// Vuetify its inverse surface, the background of the tooltips. The text of the high emphasis is the on-surface of mat,
// opaque, and the medium emphasis gives its on-surface-variant on the surface; the border is the outline of the rows of
// mat, and the state layers have the opacities of mat
const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAF9FD',
    'on-background': '#1A1B1F',
    primary: '#005CBB',
    'on-primary': '#FFFFFF',
    secondary: '#565E71',
    'on-secondary': '#FFFFFF',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    surface: '#FAF9FD',
    'on-surface': '#1A1B1F',
    'surface-light': '#E0E2EC',
    'surface-variant': '#2F3033',
    'on-surface-variant': '#F2F0F4'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.8,
    'disabled-opacity': 0.38,
    'border-color': '#74777F',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The dark theme of the same palette, which the table takes in a dark system by its theme auto, as the table of the
// sample of Angular Material takes the dark tokens of mat there
const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121316',
    'on-background': '#E3E2E6',
    primary: '#ABC7FF',
    'on-primary': '#002F65',
    secondary: '#BEC6DC',
    'on-secondary': '#283041',
    error: '#FFB4AB',
    'on-error': '#690005',
    surface: '#121316',
    'on-surface': '#E3E2E6',
    'surface-light': '#44474E',
    'surface-variant': '#E3E2E6',
    'on-surface-variant': '#2F3033'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 1,
    'disabled-opacity': 0.38,
    'border-color': '#8E9099',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The Vuetify of the application, with the blueprint of Material 3, for each render of the server and in the browser:
// its themes give the colors to the table, on the light page of the sample of Angular Material, and its icons are the
// ligatures of Material Icons, the font of the page
export default defineNuxtPlugin({
  name: 'vuetify',
  setup: nuxtApp => {
    const vuetify = createVuetify({
      ssr: true,
      blueprint: md3,
      icons: {defaultSet: 'md', aliases, sets: {md}},
      theme: {defaultTheme: 'light', themes: {light, dark}}
    });

    nuxtApp.vueApp.use(vuetify);

    return {provide: {vuetify}};
  }
});
`},
    {file: 'app/plugins/table-bro.client.ts', language: 'ts', code: `// The skin in the browser: its import defines <table-bro> and registers the skin vuetify, and setVuetify() gives its
// elements the Vuetify of the application. The server renders the table with the server entry of the skin
// (prerender-table.ts)
import {setVuetify} from '@table-bro/vue-vuetify';

export default defineNuxtPlugin({
  dependsOn: ['vuetify'],
  setup: nuxtApp => setVuetify(nuxtApp.$vuetify)
});
`},
    {file: 'app/prerender-table.ts', language: 'ts', code: `import type {BroVuetifyInstance} from '@table-bro/vue-vuetify';

import {cols, conf} from './orders';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of Vuetify: the
 * page shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 * @param vuetify - the Vuetify of the render of the server
 */
export async function prerenderOrders(vuetify: BroVuetifyInstance): Promise<PrerenderedTable> {
  const {parseHTML} = await import('linkedom');
  const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

  // The elements of the skin extend the HTMLElement of the server DOM: it is global before the import of the skin
  globalThis.HTMLElement ??= window.HTMLElement;

  const {prerenderTableBro} = await import('@table-bro/core');
  const {setVuetify} = await import('@table-bro/vue-vuetify/server');

  setVuetify(vuetify);

  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
    {file: 'app/components/OrdersTable.vue', language: 'vue', code: `<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from '../orders';

const {$vuetify} = useNuxtApp();
const table = useTemplateRef<TableBroHTMLElement>('table');

// The server prerenders the table in its loading state, and the page carries its markup to the browser
const {data: prerendered} = await useAsyncData('orders', async () => import.meta.server
  ? (await import('../prerender-table')).prerenderOrders($vuetify)
  : null);

// configure() renders the table with its rows in the place of the prerender
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro v-bind="prerendered?.attributes" id="orders" ref="table" theme="auto" @bro-action="onAction" v-html="prerendered?.html"></table-bro>
  </div>
</template>
`},
    {file: 'app/app.vue', language: 'vue', code: `<script setup lang="ts">
import {VApp} from 'vuetify/components/VApp';
</script>

<template>
  <VApp>
    <OrdersTable />
  </VApp>
</template>
`}
  ]
};

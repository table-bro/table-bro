import type {BroDocPage}                      from '../../pages.js';
import {mcpInstall, mcpSection, skinsSection} from '../shared.js';

/** The page frameworks/vue of Docs. */
export const vuePage: BroDocPage = {
  path: 'frameworks/vue',
  name: 'Vue 3 data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Vue 3 app renders it in a template once the compiler knows the tag: \`compilerOptions.isCustomElement\` of \`@vitejs/plugin-vue\`. A template ref gives the element its columns, rows and config by \`configure()\`, \`@bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/vue-vuetify/vue) is the sample project \`samples/vue-vuetify/vue\` of the repository, with Vue 3.5 and the Vue Vuetify skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/vue-vuetify/vue) opens it in the browser, and the setup below is its code. Vue Vuetify implements Material M3 with the blueprint \`md3\` of Vuetify, which the setup installs. The Bootstrap skin of the sample project \`samples/frameworks/vue\` and Native work in Vue the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Vue?

${mcpSection('#####', 'Vue')}

##### Install manually

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/vue-vuetify\`, and Vuetify. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Vue the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the Vuetify of the application**

   The Vuetify of the application, with the blueprint of Material 3: its themes, in the azure palette of Material 3 of the sample of Angular Material, give the colors to the table, light or dark as the system, so that the table looks as the table of the skin \`mat\` on the light page of that sample, and the icon set \`md\` of Vuetify gives its components the ligatures of Material Icons, which the skin shows too. \`src/vuetify.ts\`:

   {{src/vuetify.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`vuetify\`, and \`setVuetify()\` gives its elements the instance of Vuetify. The CSS of Vuetify, of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of Material**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I tell Vue that table-bro is a Custom Element?

Without it, Vue resolves \`‹table-bro›\` as a component of the app and warns that it fails. \`isCustomElement\` of the template compiler skips the tags of Table, Bro ([Vue, Using Custom Elements in Vue](https://vuejs.org/guide/extras/web-components.html)). \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

With server-side rendering, the steps of [Nuxt](https://table-bro.com/docs/ssr/nuxt) come after these: a component prerenders the table in its loading state in the markup of Vuetify.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`useTemplateRef\` gives the element, \`onMounted\` makes the call. The elements of the skin render by \`render()\` of Vue, which patches them before it returns, so the table measures them rendered. \`@bro-action\` adds the listener of the event, which logs the name of each action, and \`theme\` sets the theme; a binding \`:theme\` goes to the property \`theme\` of the element, since Vue sets a binding of a custom element as a property when the element has it. \`src/OrdersTable.vue\`:

{{src/OrdersTable.vue}}

#### How do I render it?

\`src/App.vue\` renders the table in \`VApp\` of Vuetify, which gives the page the background of the theme:

{{src/App.vue}}

\`src/main.ts\` imports the skin before the tables, and installs Vuetify in the app:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-vuetify-theme\`, which gives it the theme of Vuetify of that name. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Vue need a wrapper for Custom Elements?

No. Vue passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); it only needs \`isCustomElement\` for the tags of Table, Bro.

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does it work with Nuxt?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMounted()\`, and the server render of Nuxt prerenders it in its loading state in the markup of Vuetify: [Nuxt](https://table-bro.com/docs/ssr/nuxt).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Nuxt](https://table-bro.com/docs/ssr/nuxt), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/vue-vuetify vuetify
`},
    {file: 'src/vuetify.ts', language: 'ts', code: `import {createVuetify, type ThemeDefinition} from 'vuetify';
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

// The Vuetify of the application, with the blueprint of Material 3: its themes give the colors to the table, on the
// light page of the sample of Angular Material, and its defaults the look of the components in it. Its icons are the
// ligatures of Material Icons, the font of the page, as the arrow of the select of the page size
export const vuetify = createVuetify({
  blueprint: md3,
  icons: {defaultSet: 'md', aliases, sets: {md}},
  theme: {defaultTheme: 'light', themes: {light, dark}}
});
`},
    {file: 'src/skin.ts', language: 'ts', code: `// The CSS of Vuetify, of the core and of the skin, then the skin: its import defines <table-bro> and registers the
// skin vuetify, and setVuetify() gives its elements the Vuetify of the application
import 'vuetify/styles';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css';
import {setVuetify} from '@table-bro/vue-vuetify';

import {vuetify} from './vuetify';

import './sample-page.css';

setVuetify(vuetify);
`},
    {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Vue Vuetify</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
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
  skin: 'vuetify',
  toolbarTitle: 'Orders'
};
`},
    {file: 'vite.config.ts', language: 'ts', code: `import vue                         from '@vitejs/plugin-vue';
import {defineConfig, mergeConfig} from 'vite';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    // Vue compiles <table-bro> of its templates as a Custom Element, not as a component of Vue
    vue({template: {compilerOptions: {isCustomElement: tag => tag.startsWith('table-bro')}}})
  ]
}));
`},
    {file: 'src/OrdersTable.vue', language: 'vue', code: `<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

const table = useTemplateRef<TableBroHTMLElement>('table');

// The elements of the skin render by render() of Vue, which patches them at once: the table measures them rendered
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro id="orders" ref="table" theme="auto" @bro-action="onAction"></table-bro>
  </div>
</template>
`},
    {file: 'src/App.vue', language: 'vue', code: `<script setup lang="ts">
import {VApp} from 'vuetify/components/VApp';

import OrdersTable from './OrdersTable.vue';
</script>

<template>
  <VApp>
    <OrdersTable />
  </VApp>
</template>
`},
    {file: 'src/main.ts', language: 'ts', code: `// The skin is registered before the tables
import './skin';

import {createApp} from 'vue';

import App       from './App.vue';
import {vuetify} from './vuetify';

createApp(App).use(vuetify).mount('#app');
`}
  ]
};

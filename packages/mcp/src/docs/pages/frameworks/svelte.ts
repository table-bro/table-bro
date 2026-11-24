import type {BroDocPage}                                  from '../../pages.js';
import {mcpInstall, mcpSection, ordersFile, skinsSection} from '../shared.js';

/** The page frameworks/svelte of Docs. */
export const sveltePage: BroDocPage = {
  path: 'frameworks/svelte',
  name: 'Svelte data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Svelte 5 app renders it in markup as it is. \`bind:this\` gives the element its columns, rows and config by \`configure()\`, the attribute \`onbro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/svelte-m3/svelte) is the sample project \`samples/svelte-m3/svelte\` of the repository, with Svelte 5.58 and the Svelte M3 skin on the components of [M3 Svelte](https://github.com/KTibow/m3-svelte), Material 3 for Svelte; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/svelte-m3/svelte) opens it in the browser, and the setup below is its code. Svelte M3 implements Material M3. The Bootstrap skin of the sample project \`samples/frameworks/svelte\` and Native work in Svelte the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Svelte?

${mcpSection('#####', 'Svelte')}

##### Install manually

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/svelte-m3\`, M3 Svelte, and the plugin of Vite that compiles the CSS of its components. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Svelte the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Compile M3 Svelte**

   M3 Svelte publishes its components as their sources: Vite compiles them with the plugin of Svelte, and the CSS of their styles with \`vite-plugin-functions-mixins\`. \`vite.config.ts\`, where \`samplePage\` is the config of the working page; a project of its own exports \`defineConfig()\` with the plugins:

   {{vite.config.ts}}

   The plugin names Vite 7 as its peer dependency and works with Vite 8: the \`package.json\` of the sample lets npm install it by \`"overrides": {"vite-plugin-functions-mixins": {"vite": "$vite"}}\`.

3. **Give the skin the theme of the application**

   The table and the components of M3 Svelte read the colors of the M3 Svelte theme of the application, its CSS variables \`--m3c-*\`. The theme imports the styles of M3 Svelte and has the function \`--m3-density\` and the colors of the light and the dark scheme, as the theme page of M3 Svelte writes them; the sample takes the colors of the sample of Angular Material, the azure palette of Angular Material in the roles of M3 Svelte, with its font Roboto in a light page, so that both tables look the same. \`src/theme.css\`:

   {{src/theme.css}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`m3-svelte\`. The CSS of the theme, of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) takes. \`src/skin.ts\`:

   {{src/skin.ts}}

4. **Load the fonts**

   Roboto and the icons of Material Symbols, which the skin shows by their names, come from Google Fonts. \`index.html\`:

   {{index.html}}

5. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [SvelteKit](https://table-bro.com/docs/ssr/sveltekit) come after these: the load of the page prerenders the table in its loading state in the markup of M3 Svelte.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`bind:this\` gives the element ([Svelte, bind:this](https://svelte.dev/docs/svelte/bind)), \`onMount\` makes the call ([Svelte, Lifecycle hooks](https://svelte.dev/docs/svelte/lifecycle-hooks)). The elements of the skin render at once there: \`mount()\` of Svelte renders a component synchronously, and an element renders a change by \`flushSync()\`, since the table measures them right after it renders them. An attribute that starts with \`on\` adds a listener of the event of its name, \`bro-action\` for \`onbro-action\` ([Svelte, Events](https://svelte.dev/docs/svelte/basic-markup)); the sample logs the name of each action. \`src/OrdersTable.svelte\`:

{{src/OrdersTable.svelte}}

#### How do I render it?

\`src/main.ts\` imports the skin before the tables:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, which gives it the dark or the light scheme of the colors of the M3 Svelte theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Svelte need a wrapper for Custom Elements?

No. Svelte passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Svelte also compiles its own components into Custom Elements ([Svelte, Custom elements](https://svelte.dev/docs/svelte/custom-elements)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same element.

##### Does it work with SvelteKit?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMount\`, and the server render of SvelteKit prerenders it in its loading state in the markup of M3 Svelte, with the server entry of the skin: [SvelteKit](https://table-bro.com/docs/ssr/sveltekit).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [SvelteKit](https://table-bro.com/docs/ssr/sveltekit), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/svelte-m3 m3-svelte
npm install -D vite-plugin-functions-mixins
`},
    {file: 'vite.config.ts', language: 'ts', code: `import {svelte}                    from '@sveltejs/vite-plugin-svelte';
import {defineConfig, mergeConfig} from 'vite';
import {functionsMixins}           from 'vite-plugin-functions-mixins';

import {samplePage} from './sample-page.config.ts';

// M3 Svelte publishes its components as their sources: Svelte compiles them, and the plugin of M3 Svelte the mixins and
// the functions of their CSS
export default mergeConfig(samplePage, defineConfig({
  plugins: [
    svelte(),
    functionsMixins({deps: ['m3-svelte']})
  ]
}));
`},
    {file: 'src/theme.css', language: 'css', code: `/*
 * The theme of M3 Svelte of the application in the colors, the type and the color scheme of the sample
 * samples/angular-material, so that the table looks as the table of that sample: the styles of M3 Svelte, the density
 * of its components, the color roles of the theme of Angular Material with the azure palette and the blue tertiary
 * palette, light and dark by light-dark(), in a light page, and the font Roboto. The roles of M3 Svelte that Material 3
 * has not, the dim, the subtle and the on-on-primary colors, are the ones that genCSS() of m3-svelte/etc/colors writes
 * for the Vibrant scheme of the azure primary color #005cbb. The components of M3 Svelte and the skin m3-svelte read
 * them.
 */
@import "m3-svelte/etc/styles.css";
@import "m3-svelte/etc/recommended-styles.css";

@function --m3-density(--size) {
  result: var(--size);
}

:root {
  @apply --m3-body-medium;
  color-scheme: light;
  background-color: var(--m3c-surface);
  color: var(--m3c-on-surface);
}

/*
 * The tables of the skin, the elements with the class m3-svelte, take the colors of their own color scheme, as the light
 * page has a table in the dark scheme of the system: the build lowers light-dark() into variables of the color scheme of
 * each element, which a color role reads where it is declared
 */
@layer tokens {
  :root,
  .m3-svelte {
    --m3-font: Roboto, sans-serif;

    --m3c-surface: light-dark(#faf9fd, #121316);
    --m3c-surface-dim: light-dark(#dbd9dd, #121316);
    --m3c-surface-bright: light-dark(#faf9fd, #38393c);
    --m3c-surface-container-lowest: light-dark(#ffffff, #0d0e11);
    --m3c-surface-container-low: light-dark(#f4f3f6, #1a1b1f);
    --m3c-surface-container: light-dark(#efedf0, #1f2022);
    --m3c-surface-container-high: light-dark(#e9e7eb, #292a2c);
    --m3c-surface-container-highest: light-dark(#e3e2e6, #343537);
    --m3c-on-surface: light-dark(#1a1b1f, #e3e2e6);
    --m3c-on-surface-variant: light-dark(#44474e, #e0e2ec);
    --m3c-outline: light-dark(#74777f, #8e9099);
    --m3c-outline-variant: light-dark(#c4c6d0, #44474e);
    --m3c-inverse-surface: light-dark(#2f3033, #e3e2e6);
    --m3c-inverse-on-surface: light-dark(#f2f0f4, #2f3033);
    --m3c-primary: light-dark(#005cbb, #abc7ff);
    --m3c-primary-dim: light-dark(#0050a5, #4490ff);
    --m3c-on-primary: light-dark(#ffffff, #002f65);
    --m3c-primary-container: light-dark(#d7e3ff, #00458f);
    --m3c-on-primary-container: light-dark(#00458f, #d7e3ff);
    --m3c-primary-fixed: #d7e3ff;
    --m3c-primary-fixed-dim: #abc7ff;
    --m3c-on-primary-fixed: #001b3f;
    --m3c-on-primary-fixed-variant: #00458f;
    --m3c-inverse-primary: light-dark(#abc7ff, #005cbb);
    --m3c-secondary: light-dark(#565e71, #bec6dc);
    --m3c-secondary-dim: light-dark(#4c5071, #d4d7ff);
    --m3c-on-secondary: light-dark(#ffffff, #283041);
    --m3c-secondary-container: light-dark(#dae2f9, #3e4759);
    --m3c-on-secondary-container: light-dark(#3e4759, #dae2f9);
    --m3c-secondary-fixed: #dae2f9;
    --m3c-secondary-fixed-dim: #bec6dc;
    --m3c-on-secondary-fixed: #131c2b;
    --m3c-on-secondary-fixed-variant: #3e4759;
    --m3c-tertiary: light-dark(#343dff, #bec2ff);
    --m3c-tertiary-dim: light-dark(#544c7d, #cdc2fb);
    --m3c-on-tertiary: light-dark(#ffffff, #0001ac);
    --m3c-tertiary-container: light-dark(#e0e0ff, #0000ef);
    --m3c-on-tertiary-container: light-dark(#0000ef, #e0e0ff);
    --m3c-tertiary-fixed: #e0e0ff;
    --m3c-tertiary-fixed-dim: #bec2ff;
    --m3c-on-tertiary-fixed: #00006e;
    --m3c-on-tertiary-fixed-variant: #0000ef;
    --m3c-error: light-dark(#ba1a1a, #ffb4ab);
    --m3c-error-dim: light-dark(#a80710, #ff554a);
    --m3c-on-error: light-dark(#ffffff, #690005);
    --m3c-error-container: light-dark(#ffdad6, #93000a);
    --m3c-on-error-container: light-dark(#93000a, #ffdad6);
    --m3c-shadow: #000000;
    --m3c-scrim: #000000;
    --m3c-on-on-primary: light-dark(#0060c2, #85b1ff);
    --m3c-primary-container-subtle: light-dark(#cadaff, #003876);
    --m3c-on-primary-container-subtle: light-dark(#004b9a, #9abdff);
    --m3c-secondary-container-subtle: light-dark(#d4d7ff, #323756);
    --m3c-on-secondary-container-subtle: light-dark(#464b6b, #b6bae0);
    --m3c-tertiary-container-subtle: light-dark(#ddd5ff, #3a3261);
    --m3c-on-tertiary-container-subtle: light-dark(#4e4676, #bfb5ed);
    --m3c-error-container-subtle: light-dark(#ffcfc9, #790006);
    --m3c-on-error-container-subtle: light-dark(#9e000b, #ffa49a);
  }
}
`},
    {file: 'src/skin.ts', language: 'ts', code: `// The theme of M3 Svelte, the CSS of the core and of the skin, then the skin: its import defines <table-bro> and
// registers the skin m3-svelte, whose elements render the components of M3 Svelte in the theme of the application
import './theme.css';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/svelte-m3/dist/table-bro.svelte-m3.min.css';
import '@table-bro/svelte-m3';

import './sample-page.css';
`},
    {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Svelte M3</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`},
    ordersFile('m3-svelte'),
    {file: 'src/OrdersTable.svelte', language: 'svelte', code: `<script lang="ts">
  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from './orders';

  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro id="orders" bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
</div>
`},
    {file: 'src/main.ts', language: 'ts', code: `// The skin is registered before the tables
import './skin';

import {mount} from 'svelte';

import OrdersTable from './OrdersTable.svelte';

mount(OrdersTable, {target: document.getElementById('app')!});
`}
  ]
};

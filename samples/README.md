# Samples

Pages with a table of Table, Bro, one per skin, each set up as its page of Docs, Getting started, says, and the pages
of the frameworks of Docs, Frameworks:

- `angular-material`: Angular, Angular Material and `@table-bro/angular-material`;
- `angular-ssr`: the same page with the server render of Angular, which prerenders the table at the build in its
  loading state, and the hydration of the page in the browser;
- `react-mui`: React and MUI with `@table-bro/react-mui`, in `react-mui/react`, and the same page in Preact through
  `preact/compat`, in `react-mui/preact`, built by Vite; in `react-mui/next` Next.js prerenders the table in the markup
  of MUI at the build of its static export, with the server entry of the skin;
- `preact-astro`: the page of `react-mui/preact` with Astro and its integration of Preact, `@astrojs/preact`, which
  takes React from `preact/compat`: Astro prerenders the table in the markup of MUI at the build of its static site,
  with the server entry of the skin, and an island of Preact hydrates the page in the browser;
- `solid-suid`: Solid and SUID with `@table-bro/solid-suid`, in `solid-suid/solid`, built by Vite with the plugin of
  Solid, which compiles the components of SUID; the theme has the azure palette and the font of the theme of
  `angular-material` in the roles of SUID, on a light page with the table in the color scheme of the system; in
  `solid-suid/start` SolidStart prerenders the table in the markup of SUID at the build of its static site, with the
  server entry of the skin;
- `svelte-m3`: Svelte and M3 Svelte with `@table-bro/svelte-m3`, in `svelte-m3/svelte`, built by Vite with the plugins
  of Svelte and of the CSS of M3 Svelte, in the default theme of M3 Svelte; in `svelte-m3/sveltekit` SvelteKit
  prerenders the table in the markup of M3 Svelte at its build, with the server entry of the skin;
- `vue-vuetify`: Vue and Vuetify with the blueprint of Material 3 and `@table-bro/vue-vuetify`, in `vue-vuetify/vue`,
  built by Vite, in the azure palette of `angular-material` in the colors of Vuetify, on a light page with the table in
  the color scheme of the system; in `vue-vuetify/nuxt` Nuxt prerenders the table in the markup of Vuetify at the build
  of its static site, with the server entry of the skin;
- `bootstrap`: Vanilla JS with Bootstrap and `@table-bro/bootstrap`, built by Vite;
- `native`: Vanilla JS with `@table-bro/native`, built by Vite;
- `no-build`: Vanilla JS with Bootstrap and `@table-bro/bootstrap` without a bundler: `index.html` takes the packages
  from jsDelivr by an import map, and `npm run build:samples` copies the folder as it is;
- `frameworks`: a Vite project per framework, `react`, `vue`, `svelte`, `solid` and `preact`, each with Bootstrap
  and `@table-bro/bootstrap`; StackBlitz opens each folder as it is.

A page installs the packages as its users do: `npm install`, then `npm run build` or `npm start` (`npm run dev` for Vite).

`npm run build:samples` at the root of the repository builds every page from the packages of the repository: after
`npm run build`, it publishes them to a local npm registry (Verdaccio) by `npm run publish:packages`, as a release
publishes them to npm, installs each page from it and builds it into `dist/samples/<name>`, under the base path
`/samples/<name>/` of table-bro.com; the projects of `frameworks` go to `dist/samples/frameworks/<framework>`.

## Source maps and the readable code of a page

A page built for table-bro.com has source maps, so the Sources of DevTools show the files of the sample and of the
packages. The code of a Vite sample stays readable in its own chunk: `sample-page.config.ts` puts the packages into the
chunk `libraries` and minifies only that chunk; the bundler keeps the names and drops the plain comments, which the
source map has. The Angular CLI minifies all the code of `angular-material`, which has source maps for its own code and
for the packages (`sourceMap` of its production build).

## The budget of `angular-material`

The initial bundle of the page is 662 kB raw, 146 kB as brotli: Angular Material and the CDK 291 kB of it, most of them
the paginator, which takes the select, the form field and the overlay of Material for the page size; Angular 171 kB, the
core of Table, Bro 88 kB, the CSS 31 kB, the component of the table with its twenty orders 3 kB. The budget of
`angular.json` follows this size instead of the 500 kB of `ng new`: a warning above 675 kB, about 2% over the page, and
an error above 715 kB. The table of the page uses no optional element of the skin: the code of one of them without its
use, as the tags of `withTags()` (38 kB), the switch of `withSwitch()` (30 kB) or the menu of `withToolbarMenu()`
(30 kB), gives the warning; the tags and the switch together (66 kB) fail the build.

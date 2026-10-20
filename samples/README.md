# Samples

Pages with a table of Table, Bro, one per skin, each set up as its page of Docs, Getting started, says, and the pages
of the frameworks of Docs, Frameworks:

- `angular-material`: Angular, Angular Material and `@table-bro/angular-material`;
- `bootstrap`: Vanilla JS with Bootstrap and `@table-bro/bootstrap`, built by Vite;
- `native`: Vanilla JS with `@table-bro/native`, built by Vite;
- `frameworks`: a Vite project per framework, `react`, `vue`, `svelte`, `solid` and `preact`, each with
  `@table-bro/native`; StackBlitz opens each folder as it is.

A page installs the packages as its users do: `npm install`, then `npm run build` or `npm start` (`npm run dev` for Vite).

`npm run build:samples` at the root of the repository builds every page from the packages of the repository: after
`npm run build`, it packs them as npm publishes them, serves the tarballs from a local npm registry (Verdaccio), installs
each page from it and builds it into `dist/samples/<name>`, under the base path `/samples/<name>/` of table-bro.com; the
projects of `frameworks` go to `dist/samples/frameworks/<framework>`.

## Source maps and the readable code of a page

A page built for table-bro.com has source maps, so the Sources of DevTools show the files of the sample and of the
packages. The code of a Vite sample stays readable in its own chunk: `sample-page.config.ts` puts the packages into the
chunk `libraries` and minifies only that chunk; the bundler keeps the names and drops the plain comments, which the
source map has. The Angular CLI minifies all the code of `angular-material`, which has source maps for its own code and
for the packages (`sourceMap` of its production build).

## The budget of `angular-material`

The initial bundle of the page is 648 kB raw, 144 kB as brotli: Angular Material and the CDK 288 kB of it, most of them
the paginator, which takes the select, the form field and the overlay of Material for the page size; Angular 171 kB,
the core of Table, Bro 83 kB, the CSS 30 kB. The budget of `angular.json` follows this size instead of the 500 kB of
`ng new`: a warning above 660 kB, about 2% over the page, and an error above 700 kB. The table of the page uses no
optional element of the skin: the code of one of them without its use, as the tags of `withTags()` (38 kB), the
switch of `withSwitch()` (30 kB) or the menu of `withToolbarMenu()` (30 kB), gives the warning; the tags and the switch
together (66 kB) fail the build.

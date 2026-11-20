import {defineConfig} from 'tsdown';

const common = {
  // The entry of the browser, and the one of the server, which renders the elements of a prerender to markup
  entry: {'table-bro.vue-vuetify': 'js/table-bro.vue-vuetify.ts', 'table-bro.vue-vuetify.server': 'js/table-bro.vue-vuetify.server.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Vue, Vuetify and the core come from the application, which shares them with its own components; the components of
  // Vuetify import their own styles, which the bundler of the application takes
  deps: {neverBundle: ['@table-bro/core', 'vue', /^vue\//, /^@vue\//, 'vuetify', /^vuetify\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of Vue and Vuetify has a bundler
export default defineConfig([
  {
    ...common,
    format: 'esm',
    outExtensions: () => ({js: '.esm.js'}),
    // The code that both entries share, with the registration of the skin, under a name of its own
    outputOptions: {chunkFileNames: 'table-bro.vue-vuetify.shared.esm.js'},
    dts: false,
    minify: true,
    sourcemap: true
  },
  // The types of each entry in one file, without a shared chunk: the report of check:api reads the one of the browser
  ...Object.entries(common.entry).map(([name, file]) => ({
    ...common,
    entry: {[name]: file},
    format: 'esm' as const,
    clean: false,
    dts: {emitDtsOnly: true}
  }))
]);

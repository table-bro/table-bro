import {defineConfig} from 'tsdown';

const common = {
  entry: {'table-bro.vue-vuetify': 'js/table-bro.vue-vuetify.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Vue, Vuetify and the core come from the application, which shares them with its own components; the components of
  // Vuetify import their own styles, which the bundler of the application takes
  deps: {neverBundle: ['@table-bro/core', 'vue', /^vue\//, /^@vue\//, 'vuetify', /^vuetify\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an application of Vue and Vuetify
// has a bundler
export default defineConfig([
  {
    ...common,
    format: 'esm',
    outExtensions: () => ({js: '.esm.js'}),
    dts: false,
    minify: true,
    sourcemap: true
  },
  {
    ...common,
    format: 'esm',
    dts: {emitDtsOnly: true}
  }
]);

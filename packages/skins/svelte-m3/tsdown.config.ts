import {defineConfig} from 'tsdown';

const common = {
  // The entry of the browser, and the one of the server, which renders the elements of a prerender to markup
  entry: {'table-bro.svelte-m3': 'js/table-bro.svelte-m3.ts', 'table-bro.svelte-m3.server': 'js/table-bro.svelte-m3.server.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Svelte, M3 Svelte and the core come from the application: its bundler compiles the components of M3 Svelte, which
  // it publishes as their sources, and shares them and Svelte with its own components
  deps: {neverBundle: ['@table-bro/core', 'm3-svelte', /^m3-svelte\//, 'svelte', /^svelte\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of Svelte has a bundler
export default defineConfig([
  {
    ...common,
    format: 'esm',
    outExtensions: () => ({js: '.esm.js'}),
    // The code that both entries share, with the registration of the skin, under a name of its own
    outputOptions: {chunkFileNames: 'table-bro.svelte-m3.shared.esm.js'},
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

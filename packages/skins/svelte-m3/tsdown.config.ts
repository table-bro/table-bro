import {defineConfig} from 'tsdown';

const common = {
  entry: {'table-bro.svelte-m3': 'js/table-bro.svelte-m3.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Svelte, M3 Svelte and the core come from the application: its bundler compiles the components of M3 Svelte, which
  // it publishes as their sources, and shares them and Svelte with its own components
  deps: {neverBundle: ['@table-bro/core', 'm3-svelte', /^m3-svelte\//, 'svelte', /^svelte\//]}
} as const;

// The skin for bundlers (ESM) with source maps, and its types in one file. No UMD: an application of Svelte has a
// bundler
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
    clean: false,
    dts: {emitDtsOnly: true}
  }
]);

import {defineConfig} from 'tsdown';

const common = {
  entry: {'table-bro.solid-suid': 'js/table-bro.solid-suid.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Solid, SUID and the core come from the application, which shares them with its own components
  deps: {neverBundle: ['@table-bro/core', /^@suid\//, 'solid-js', /^solid-js\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of Solid has a bundler, which compiles the components of SUID, published as JSX, by the plugin of Solid
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

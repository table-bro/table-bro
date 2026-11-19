import {defineConfig} from 'tsdown';

const common = {
  // The entry of the browser, and the one of the server, which renders the elements of a prerender to markup
  entry: {'table-bro.react-mui': 'js/table-bro.react-mui.ts', 'table-bro.react-mui.server': 'js/table-bro.react-mui.server.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // React, MUI and the core come from the application, which shares them with its own components
  deps: {neverBundle: ['@table-bro/core', /^@mui\//, /^@emotion\//, 'react', /^react\//, 'react-dom', /^react-dom\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of React and MUI has a bundler
export default defineConfig([
  {
    ...common,
    format: 'esm',
    outExtensions: () => ({js: '.esm.js'}),
    // The code that both entries share, with the registration of the skin, under a name of its own
    outputOptions: {chunkFileNames: 'table-bro.react-mui.shared.esm.js'},
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

import {defineConfig} from 'tsdown';

const common = {
  entry: {'table-bro.react-mui': 'js/table-bro.react-mui.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // React, MUI and the core come from the application, which shares them with its own components
  deps: {neverBundle: ['@table-bro/core', /^@mui\//, 'react', /^react\//, 'react-dom', /^react-dom\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of React and MUI has a bundler
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

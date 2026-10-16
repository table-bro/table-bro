import {defineConfig} from 'tsdown';

// A UMD skin without the core would fail with a TypeError on the first access to TableBro.
const requireCoreBanner = `if (typeof exports !== 'object' && typeof define !== 'function' && typeof TableBro === 'undefined') {
  throw new Error('@table-bro/bootstrap: load the @table-bro/core script before the skin script, the TableBro global is missing.');
}`;

const common = {
  entry: {'table-bro.bootstrap': 'js/table-bro.bootstrap.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  deps: {neverBundle: ['@table-bro/core']}
} as const;

// The skin for bundlers (ESM) and for a script tag after the core (UMD with the TableBroBootstrap global), ES2022 as the
// browsers of Angular, with source maps; its types in one file, from a build of their own
export default defineConfig([
  {
    ...common,
    format: ['esm', 'umd'],
    globalName: 'TableBroBootstrap',
    // tsdown names the UMD file table-bro.bootstrap.umd itself
    outExtensions: ({format}) => ({js: (format === 'umd') ? '.js' : '.esm.js'}),
    outputOptions: (options, format) => (format === 'umd') ? {...options, banner: requireCoreBanner, globals: {'@table-bro/core': 'TableBro'}} : options,
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

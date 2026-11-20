import {defineConfig} from 'tsdown';

const common = {
  // The entry of the browser, the one of the server, which renders the elements of a prerender to markup, and the
  // config of the skin alone, without Solid and SUID
  entry: {
    'table-bro.solid-suid': 'js/table-bro.solid-suid.ts',
    'table-bro.solid-suid.server': 'js/table-bro.solid-suid.server.ts',
    'table-bro.solid-suid.config': 'js/table-bro.solid-suid.config.ts'
  },
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  // Solid, SUID and the core come from the application, which shares them with its own components: its bundler gives
  // the server entry the server build of Solid
  deps: {neverBundle: ['@table-bro/core', /^@suid\//, 'solid-js', /^solid-js\//]}
} as const;

// The skin for bundlers (ESM) with source maps; its types in one file, from a build of their own. No UMD: an
// application of Solid has a bundler, which compiles the components of SUID, published as JSX, by the plugin of Solid
export default defineConfig([
  {
    ...common,
    format: 'esm',
    outExtensions: () => ({js: '.esm.js'}),
    // The code that both entries share, with the registration of the skin, under a name of its own
    outputOptions: {chunkFileNames: 'table-bro.solid-suid.shared.esm.js'},
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

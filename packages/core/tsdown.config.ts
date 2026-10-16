import path from 'node:path';
import url  from 'node:url';

import {defineConfig} from 'tsdown';

const dir = path.dirname(url.fileURLToPath(import.meta.url));

// The production build takes the selector maps of *.prod.ts: today they have the names of the development maps, so
// the styles of an application work with both builds, and a build from the sources may shorten them there
const prodSelectors = {
  name: 'prod-selectors',
  resolveId(source: string, importer: string | undefined) {
    const file = importer && path.resolve(path.dirname(importer), source);

    return [path.join(dir, 'shared/shared-selectors'), path.join(dir, 'table-bro-selectors')].includes(file) ? `${file}.prod.ts` : null;
  }
};

const common = {
  entry: {'table-bro': 'index.ts'},
  platform: 'browser',
  target: 'es2022',
  outDir: 'dist',
  plugins: [prodSelectors]
} as const;

// The core for bundlers (ESM) and for a script tag (UMD with the TableBro global), ES2022 as the browsers of Angular,
// with source maps; its types in one file, from a build of their own, so the ESM stays one file without a runtime chunk
export default defineConfig([
  {
    ...common,
    format: ['esm', 'umd'],
    globalName: 'TableBro',
    // tsdown names the UMD file table-bro.umd itself
    outExtensions: ({format}) => ({js: (format === 'umd') ? '.js' : '.esm.js'}),
    dts: false,
    minify: true,
    sourcemap: true
  },
  {
    ...common,
    format: 'esm',
    dts: {emitDtsOnly: true},
    // The Lottie animations of the states of the skins mat and bs go from lottie/ into dist/lottie as they are. This
    // build has one format, so it copies them once
    copy: {from: 'lottie', to: 'dist'}
  }
]);

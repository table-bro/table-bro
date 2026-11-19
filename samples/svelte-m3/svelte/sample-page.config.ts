// The build of the working page of the sample on table-bro.com: source maps for DevTools, and the code of the sample
// readable in its own chunk, apart from the minified chunk of the packages. A project of its own does not need it.
import remapping                              from '@jridgewell/remapping';
import {minify, type Plugin, type UserConfig} from 'vite';

/**
 * Minifies the chunk of the libraries once the bundle is built: the chunk of the code of the sample stays as it is
 * written. Its source map leads from the minified code to the files of the packages.
 */
const minifyLibraries: Plugin = {
  name: 'minify-libraries',
  async generateBundle(_, bundle) {
    for (const chunk of Object.values(bundle)) {
      const file = bundle[`${chunk.fileName}.map`];

      if (chunk.type === 'chunk' && chunk.name === 'libraries' && file?.type === 'asset') {
        const {code, map} = await minify(chunk.fileName, chunk.code, {sourcemap: true});

        chunk.code = `${code}\n//# sourceMappingURL=${file.fileName.split('/').pop()}\n`;
        file.source = remapping([map!, chunk.map!], () => null).toString();
      }
    }
  }
};

export const samplePage: UserConfig = {
  plugins: [
    minifyLibraries
  ],
  build: {
    sourcemap: true,
    minify: false,
    cssMinify: true,
    rolldownOptions: {
      output: {
        // The packages and the helpers of the bundler go to the chunk of the libraries
        codeSplitting: {groups: [{name: 'libraries', test: /node_modules|^\0/}]}
      }
    }
  }
};

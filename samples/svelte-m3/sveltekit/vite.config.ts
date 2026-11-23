import adapter           from '@sveltejs/adapter-static';
import {sveltekit}       from '@sveltejs/kit/vite';
import {defineConfig}    from 'vite';
import {functionsMixins} from 'vite-plugin-functions-mixins';

// M3 Svelte publishes its components as their sources: SvelteKit compiles them for the browser and for the server, and
// the plugin of M3 Svelte the mixins and the functions of their CSS. The pages are prerendered at the build into dist,
// under the base path of the variable BASE_PATH, as the working page of table-bro.com has it; a project of its own
// leaves it out. The paths of the pages are absolute: table-bro.com serves a page without the trailing slash, and a
// relative ./_app would point to the folder above it
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({pages: 'dist', assets: 'dist'}),
      paths: {base: process.env.BASE_PATH ?? '', relative: false}
    }),
    functionsMixins({deps: ['m3-svelte']})
  ]
});

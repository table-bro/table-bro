import {svelte}                    from '@sveltejs/vite-plugin-svelte';
import {defineConfig, mergeConfig} from 'vite';
import {functionsMixins}           from 'vite-plugin-functions-mixins';

import {samplePage} from './sample-page.config.ts';

// M3 Svelte publishes its components as their sources: Svelte compiles them, and the plugin of M3 Svelte the mixins and
// the functions of their CSS
export default mergeConfig(samplePage, defineConfig({
  plugins: [
    svelte(),
    functionsMixins({deps: ['m3-svelte']})
  ]
}));

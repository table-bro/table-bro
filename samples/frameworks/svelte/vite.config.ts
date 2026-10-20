import {svelte}                    from '@sveltejs/vite-plugin-svelte';
import {defineConfig, mergeConfig} from 'vite';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    svelte()
  ]
}));

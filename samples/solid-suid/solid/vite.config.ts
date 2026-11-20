import {defineConfig, mergeConfig} from 'vite';
import solid                       from 'vite-plugin-solid';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    solid()
  ]
}));

import vue                         from '@vitejs/plugin-vue';
import {defineConfig, mergeConfig} from 'vite';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    // Vue compiles <table-bro> of its templates as a Custom Element, not as a component of Vue
    vue({template: {compilerOptions: {isCustomElement: tag => tag.startsWith('table-bro')}}})
  ]
}));

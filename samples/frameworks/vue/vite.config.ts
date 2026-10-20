import vue            from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    // Vue compiles <table-bro> of its templates as a Custom Element, not as a component of Vue
    vue({template: {compilerOptions: {isCustomElement: tag => tag.startsWith('table-bro')}}})
  ]
});

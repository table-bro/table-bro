import {solidStart}   from '@solidjs/start/config';
import {nitro}        from 'nitro/vite';
import {defineConfig} from 'vite';

// A static site: the build prerenders the page with its prerendered table into dist. The plugin of Solid compiles the
// components of SUID, published as JSX, for the browser and for the server, so the server bundle carries SUID and the
// skin; it carries the core too, which loads after the server DOM gives it its HTMLElement (src/server-dom.ts)
export default defineConfig({
  ssr: {noExternal: [/^@suid\//, '@table-bro/core', '@table-bro/solid-suid']},
  plugins: [
    solidStart(),
    nitro({
      preset: 'static',
      prerender: {routes: ['/']},
      output: {dir: 'dist', publicDir: 'dist'}
    })
  ]
});

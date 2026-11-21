import preact         from '@astrojs/preact';
import {defineConfig} from 'astro/config';

// A static site: the build prerenders the page with its prerendered table into dist under the base path of BASE_PATH.
// preact/compat takes the place of React for MUI and the skin, in the browser and on the server. The build of the
// prerender bundles MUI, Emotion and the skin, so that they import preact/compat; it bundles the core too, which loads
// after the server DOM gives it its HTMLElement (src/server-dom.ts). resolve.noExternal covers the environment of the
// prerender, which ssr.noExternal does not
export default defineConfig({
  base: process.env.BASE_PATH,
  integrations: [preact({compat: true})],
  vite: {
    resolve: {noExternal: [/^@mui\//, /^@emotion\//, '@table-bro/core', '@table-bro/react-mui']}
  }
});

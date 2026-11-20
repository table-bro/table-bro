import {createVuetify} from 'vuetify';
import {md3}           from 'vuetify/blueprints';
import {aliases, md}   from 'vuetify/iconsets/md';

// The Vuetify of the application, with the blueprint of Material 3, for each render of the server and in the browser:
// its themes give the colors to the table, and its icons are the ligatures of Material Icons, the font of the page
export default defineNuxtPlugin({
  name: 'vuetify',
  setup: nuxtApp => {
    const vuetify = createVuetify({ssr: true, blueprint: md3, icons: {defaultSet: 'md', aliases, sets: {md}}});

    nuxtApp.vueApp.use(vuetify);

    return {provide: {vuetify}};
  }
});

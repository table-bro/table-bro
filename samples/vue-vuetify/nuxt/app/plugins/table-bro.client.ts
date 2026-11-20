// The skin in the browser: its import defines <table-bro> and registers the skin vuetify, and setVuetify() gives its
// elements the Vuetify of the application. The server renders the table with the server entry of the skin
// (prerender-table.ts)
import {setVuetify} from '@table-bro/vue-vuetify';

export default defineNuxtPlugin({
  dependsOn: ['vuetify'],
  setup: nuxtApp => setVuetify(nuxtApp.$vuetify)
});

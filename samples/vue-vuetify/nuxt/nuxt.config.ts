// A static site: the build prerenders the page with its table in the markup of Vuetify, into dist under the base path
// of BASE_PATH. Vue compiles <table-bro> of its templates as a Custom Element, and the build takes Vuetify and the skin
// through Vite, with the styles that their components import
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  app: {
    baseURL: `${process.env.BASE_PATH ?? ''}/`,
    head: {
      title: 'Table, Bro + Nuxt + Vue Vuetify',
      link: [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons'}
      ]
    }
  },
  css: ['vuetify/styles', '@table-bro/core/dist/table-bro.min.css', '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css', '~/assets/sample-page.css'],
  build: {
    transpile: ['vuetify', '@table-bro/vue-vuetify']
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('table-bro')
    }
  },
  nitro: {
    output: {
      publicDir: 'dist'
    }
  }
});

// The CSS of Vuetify, of the core and of the skin, then the skin: its import defines <table-bro> and registers the
// skin vuetify, and setVuetify() gives its elements the Vuetify of the application
import 'vuetify/styles';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css';
import {setVuetify} from '@table-bro/vue-vuetify';

import {vuetify} from './vuetify';

import './sample-page.css';

setVuetify(vuetify);

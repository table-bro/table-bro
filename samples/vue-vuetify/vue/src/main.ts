// The skin is registered before the tables
import './skin';

import {createApp} from 'vue';

import App       from './App.vue';
import {vuetify} from './vuetify';

createApp(App).use(vuetify).mount('#app');

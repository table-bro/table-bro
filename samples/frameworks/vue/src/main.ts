// The skin is registered before the tables
import './skin';

import {createApp} from 'vue';

import OrdersTable from './OrdersTable.vue';

createApp(OrdersTable).mount('#app');

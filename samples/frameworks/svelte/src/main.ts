// The skin is registered before the tables
import './skin';

import {mount} from 'svelte';

import OrdersTable from './OrdersTable.svelte';

mount(OrdersTable, {target: document.getElementById('app')!});

// The skin is registered before the tables
import './skin';

import {render} from 'solid-js/web';

import {OrdersTable} from './OrdersTable';

render(() => <OrdersTable />, document.getElementById('app')!);

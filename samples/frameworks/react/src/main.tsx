// The skin is registered before the tables
import './skin';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {OrdersTable} from './OrdersTable';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <OrdersTable />
  </StrictMode>
);

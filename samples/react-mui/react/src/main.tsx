// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {StrictMode}    from 'react';
import {createRoot}    from 'react-dom/client';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrdersTable />
    </ThemeProvider>
  </StrictMode>
);

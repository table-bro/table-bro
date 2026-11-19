// The skin is registered before the tables
import './skin';

import CssBaseline     from '@suid/material/CssBaseline';
import {ThemeProvider} from '@suid/material/styles';
import {render}        from 'solid-js/web';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

render(() => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>
), document.getElementById('app')!);

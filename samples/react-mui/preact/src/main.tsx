// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {render}        from 'preact';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>,
  document.getElementById('app')!
);

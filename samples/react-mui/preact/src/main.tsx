// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {render}        from 'preact';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

// The page is light, as the page of the sample of Angular Material; the table takes the scheme of the system by its
// theme
render(
  <ThemeProvider theme={theme} defaultMode="light">
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>,
  document.getElementById('app')!
);

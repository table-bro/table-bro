// The skin is registered before the tables
import './skin';

import CssBaseline     from '@suid/material/CssBaseline';
import {ThemeProvider} from '@suid/material/styles';

import {PrerenderedOrdersTable} from './PrerenderedOrdersTable';
import {theme}                  from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrerenderedOrdersTable />
    </ThemeProvider>
  );
}

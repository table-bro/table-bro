import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';

import {OrdersTable}           from './OrdersTable';
import type {PrerenderedTable} from './prerender-orders';
import {theme}                 from './theme';

/**
 * The island of the page: the MUI theme of the application, whose server render gives the page the CSS variables of the
 * theme in its styles of Emotion, and the table. The page is light, as the page of the sample of Angular Material; the
 * table takes the scheme of the system by its theme.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function App({prerendered}: {prerendered: PrerenderedTable}) {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <OrdersTable prerendered={prerendered} />
    </ThemeProvider>
  );
}

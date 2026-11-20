'use client';

import CssBaseline              from '@mui/material/CssBaseline';
import {ThemeProvider}          from '@mui/material/styles';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v16-appRouter';
import type {ReactNode}         from 'react';

import {theme} from '../theme';

/**
 * The MUI theme of the application with the styles of Emotion of the server render of Next.js. The page is light, as the
 * page of the sample of Angular Material; the table takes the scheme of the system by its theme.
 */
export function Providers({children}: {children: ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

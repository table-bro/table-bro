import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import type {ReactNode}      from 'react';

import {Providers} from './Providers';

import './globals.css';
import './sample-page.css';

export const metadata = {title: 'Table, Bro + Next.js + React MUI'};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body>
        <InitColorSchemeScript attribute="data-mui-color-scheme" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// @refresh reload
// The server DOM first: the core and the skin, which the server bundle carries, take its HTMLElement
import './server-dom';

import {createHandler, StartServer} from '@solidjs/start/server';

import {prerenderOrders} from './prerender-orders';

// The page of the server carries the table prerendered in its loading state: the table of the page takes it from the
// locals of the request
export default createHandler(event => {
  event.locals.orders = prerenderOrders();

  return (
    <StartServer
      document={({assets, children, scripts}) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Table, Bro + SolidStart + Solid SUID</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});

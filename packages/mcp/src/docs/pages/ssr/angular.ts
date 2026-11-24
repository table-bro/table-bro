import type {BroDocPage} from '../../pages.js';

/** The page ssr/angular of Docs. */
export const angularPage: BroDocPage = {
  path: 'ssr/angular',
  name: 'Angular SSR',
  text: `<!-- intro -->
\`‹table-bro-ng›\` prerenders the table itself during the server-side rendering of Angular, in the skins \`mat\`, \`bs\` and \`nv\`: the component of the table stays as it is in the browser. The application needs only the server render of Angular ([Angular, Server-side and hybrid rendering](https://angular.dev/guide/ssr)): the steps below are the ones of the sample project \`samples/angular-ssr\` of the repository, which prerenders a page with a table at the build and hydrates it in the browser. Its [working page](https://table-bro.com/samples/angular-ssr/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/angular-ssr) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Angular? _since 1.2.0_

1. **Install the server render of Angular**

   {{install.sh}}

2. **Build the entry of the server**

   To \`"options"\` of the build in \`angular.json\`: the entry of the server, and the prerender of the pages at the build.

   {{angular.json}}

3. **Start the application on the server**

   \`src/main.server.ts\` starts the application with its config and the server render of its routes, prerendered at the build:

   {{src/main.server.ts}}

4. **Hydrate the page in the browser**

   \`provideClientHydration()\` joins the providers of the application, next to the skin. \`src/app/app.config.ts\`:

   {{src/app/app.config.ts}}

5. **Keep the table as it is**

   The component of the table is the one of the browser: the server render prerenders it in its loading state. \`src/app/orders.component.ts\`:

   {{src/app/orders.component.ts}}

The skin \`mat\` renders its elements on the server with the Angular components that \`provideTableBroMatSkin()\` provides. The skins \`bs\` and \`nv\` render their Custom Elements there when the server render loads the package of the skin: import \`@table-bro/bootstrap\` or \`@table-bro/native\` in a file that the server bundle has too, as \`app.config.ts\` or the component of the table. The import works without a DOM: it registers the skin and defines no elements. A skin that only \`main.ts\` registers is a skin of the browser: \`‹table-bro-ng›\` stays empty on the server, and the table renders in the browser.

In the browser the first table of \`‹table-bro-ng›\` renders in the prerendered \`‹table-bro›\`, and the hydration of Angular does not check it.

A production build of Angular inlines the critical CSS of a page: turn the inlining off, as the limits of [Prerender function](https://table-bro.com/docs/ssr/prerendering) show, so that the stylesheet loads before the page shows.

#### Related

[Angular data table](https://table-bro.com/docs/frameworks/angular), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
  files: [
    {file: 'install.sh', language: 'bash', code: `npm install @angular/platform-server @angular/ssr
`},
    {file: 'angular.json', language: 'json', code: `"server": "src/main.server.ts",
"outputMode": "static"
`},
    {file: 'src/main.server.ts', language: 'ts', code: `import {mergeApplicationConfig}                         from '@angular/core';
import {bootstrapApplication, type BootstrapContext}    from '@angular/platform-browser';
import {provideServerRendering, RenderMode, withRoutes} from '@angular/ssr';

import {App}       from './app/app';
import {appConfig} from './app/app.config';

// The server render of the page, at the build: the table of the page prerenders in its loading state
const serverConfig = mergeApplicationConfig(appConfig, {providers: [provideServerRendering(withRoutes([{path: '**', renderMode: RenderMode.Prerender}]))]});

export default (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);
`},
    {file: 'src/app/app.config.ts', language: 'ts', code: `import {type ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideClientHydration}                                     from '@angular/platform-browser';

import {provideTableBroMatSkin} from '@table-bro/angular-material';

// The config of the browser and of the server render: the hydration takes the page that the server has rendered
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideTableBroMatSkin(),
    provideClientHydration()
  ]
};
`},
    {file: 'src/app/orders.component.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                     from '@table-bro/angular';
import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng class="bro-table-shadow-container" tableId="orders"
                  [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroNg
  ]
})
export class OrdersComponent {
  cols = signal<BroCol<Order>[]>([
    {
      title: 'Description',
      name: 'description'
    }, {
      title: 'Price',
      name: 'price',
      dataType: 'number',
      className: 'bro-col_text-right'
    }
  ]);

  // The orders of the demos of Docs on table-bro.com
  rows = signal<Order[]>([
    {description: 'Handcrafted Wooden Table, Gorgeous Bronze Watch, Modern Fresh Salad, Refined Plastic Keyboard, Practical Rubber Shoes', price: 80},
    {description: 'Small Concrete Gloves, Licensed Frozen Pizza, Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes', price: 57},
    {description: 'Rustic Cotton Shirt, Ergonomic Steel Chair, Handcrafted Wooden Table, Small Concrete Gloves, Sleek Granite Lamp', price: 13},
    {description: 'Refined Plastic Keyboard, Ergonomic Steel Chair, Modern Fresh Salad, Gorgeous Bronze Watch, Sleek Granite Lamp', price: 27},
    {description: 'Licensed Frozen Pizza, Practical Rubber Shoes, Gorgeous Bronze Watch, Sleek Granite Lamp, Rustic Cotton Shirt', price: 96},
    {description: 'Small Concrete Gloves, Handcrafted Wooden Table, Gorgeous Bronze Watch, Ergonomic Steel Chair, Practical Rubber Shoes', price: 69},
    {description: 'Practical Rubber Shoes, Modern Fresh Salad, Refined Plastic Keyboard, Handcrafted Wooden Table, Gorgeous Bronze Watch', price: 91},
    {description: 'Modern Fresh Salad, Practical Rubber Shoes, Ergonomic Steel Chair, Licensed Frozen Pizza, Gorgeous Bronze Watch', price: 48},
    {description: 'Gorgeous Bronze Watch, Refined Plastic Keyboard, Licensed Frozen Pizza, Ergonomic Steel Chair, Rustic Cotton Shirt', price: 75},
    {description: 'Small Concrete Gloves, Refined Plastic Keyboard, Handcrafted Wooden Table, Rustic Cotton Shirt, Practical Rubber Shoes', price: 97},
    {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Licensed Frozen Pizza, Practical Rubber Shoes, Sleek Granite Lamp', price: 54},
    {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Ergonomic Steel Chair, Practical Rubber Shoes, Handcrafted Wooden Table', price: 99},
    {description: 'Sleek Granite Lamp, Ergonomic Steel Chair, Handcrafted Wooden Table, Gorgeous Bronze Watch, Practical Rubber Shoes', price: 55},
    {description: 'Refined Plastic Keyboard, Sleek Granite Lamp, Modern Fresh Salad, Handcrafted Wooden Table, Ergonomic Steel Chair', price: 81},
    {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Practical Rubber Shoes, Small Concrete Gloves, Rustic Cotton Shirt', price: 86},
    {description: 'Practical Rubber Shoes, Small Concrete Gloves, Refined Plastic Keyboard, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 56},
    {description: 'Rustic Cotton Shirt, Practical Rubber Shoes, Small Concrete Gloves, Ergonomic Steel Chair, Licensed Frozen Pizza', price: 20},
    {description: 'Modern Fresh Salad, Refined Plastic Keyboard, Small Concrete Gloves, Sleek Granite Lamp, Handcrafted Wooden Table', price: 34},
    {description: 'Refined Plastic Keyboard, Modern Fresh Salad, Small Concrete Gloves, Licensed Frozen Pizza, Rustic Cotton Shirt', price: 72},
    {description: 'Ergonomic Steel Chair, Practical Rubber Shoes, Gorgeous Bronze Watch, Rustic Cotton Shirt, Modern Fresh Salad', price: 57}
  ]);

  conf = signal<BroConfig>({
    skin: 'mat',
    toolbarTitle: 'Orders'
  });
}
`}
  ]
};

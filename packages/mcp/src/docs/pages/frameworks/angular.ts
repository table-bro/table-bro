import type {BroDocPage}                                                      from '../../pages.js';
import {mcpInstall, mcpSection, setupMat, setupNgBs, setupNgNv, skinsSection} from '../shared.js';

/** The page frameworks/angular of Docs. */
export const angularPage: BroDocPage = {
  path: 'frameworks/angular',
  name: 'Angular data table',
  text: `<!-- intro -->
Table, Bro has its own package for Angular, \`@table-bro/angular\`: the component \`‹table-bro-ng›\` renders the Custom Element \`‹table-bro›\`, gives it the signal inputs \`cols\`, \`rows\` and \`conf\`, and turns its \`bro-action\` events into the outputs \`action\` and \`query\`. It works with the three skins: Angular Material, Vanilla Bootstrap and Vanilla HTML. Angular Material implements Material M3. The page below is the [working page](https://table-bro.com/samples/angular-material) of the sample project \`samples/angular-material\` of the repository, with Angular 22 and Angular Material; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/angular-material) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Angular?

${mcpSection('#####')}

##### Install manually

The steps of each skin; the component of the table is the same in all three.

###### Angular Material

${setupMat.text}

###### Vanilla Bootstrap

${setupNgBs.text}

###### Vanilla HTML

${setupNgNv.text}

With server-side rendering, the steps of [Angular SSR](https://table-bro.com/docs/ssr/angular) come after these: the server render of Angular prerenders the table in its loading state, with the same component.

${skinsSection}

#### How do I pass cols, rows and conf?

\`‹table-bro-ng›\` takes them as inputs, here from signals of the component ([Angular, Accepting data with input properties](https://angular.dev/guide/components/inputs)). A new value of \`rows\` replaces the rows of the table, and \`conf.skin\` names the registered skin. \`src/app/orders.component.ts\`:

{{src/app/orders.component.ts}}

#### How do I listen to bro-action?

The output \`action\` emits the detail of every \`bro-action\` event of the table, a \`BroActionDetail\`: custom cells, the toolbar, the paginator. The output \`query\` emits the queries of a table with server-side data instead ([Angular, Custom events with outputs](https://angular.dev/guide/components/outputs)). In the template: \`(action)="onAction($event)"\`.

#### How do I switch the theme?

The input \`theme\` of \`‹table-bro-ng›\` is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; without it the table takes \`config.theme\`, \`'auto'\` by default. The table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does the template need CUSTOM_ELEMENTS_SCHEMA?

Not for \`‹table-bro-ng›\`: it is a component of Angular in \`imports\` of the component. A template that renders \`‹table-bro›\` itself needs [CUSTOM_ELEMENTS_SCHEMA](https://angular.dev/api/core/CUSTOM_ELEMENTS_SCHEMA). Angular also turns its own components into Custom Elements ([Angular, Custom Elements](https://angular.dev/guide/elements)).

##### Does it work with server-side rendering?

Yes: \`‹table-bro-ng›\` prerenders the table in its loading state during the server-side rendering of Angular, as [Angular SSR](https://table-bro.com/docs/ssr/angular) shows.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular SSR](https://table-bro.com/docs/ssr/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
  files: [
    mcpInstall,
    ...setupMat.files,
    ...setupNgBs.files,
    ...setupNgNv.files,
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

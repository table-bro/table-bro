import type {BroDocPage}                                                                     from '../../pages.js';
import {angularOrders, mcpInstall, mcpSection, setupMat, setupNgBs, setupNgNv, skinsSection} from '../shared.js';

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
    angularOrders
  ]
};

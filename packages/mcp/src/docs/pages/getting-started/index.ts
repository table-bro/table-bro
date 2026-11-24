import type {BroDocPage}                        from '../../pages.js';
import {installCommand, mcpInstall, mcpSection} from '../shared.js';

/** The page getting-started of Docs. */
export const gettingStartedPage: BroDocPage = {
  path: 'getting-started',
  name: 'Getting started',
  text: `<!-- steps -->
Table, Bro is the Custom Element \`‹table-bro›\`: it takes the columns, the rows and a config with the name of its skin, and renders the table with its toolbar and its paginator. A page in Vanilla JS creates the element and gives it the three, \`orders.ts\`:

{{orders.ts}}

<!-- setup -->
${mcpSection('###')}

### Install manually

Table, Bro is a table engine, and a skin gives it the look and the controls of a UI library: Angular Material for Angular apps, React MUI for React and Preact, Solid SUID for Solid, Svelte M3 for Svelte, Vue Vuetify for Vue, and for any page Vanilla Bootstrap, on Bootstrap 5, and Vanilla HTML, plain HTML elements, the reference skin to start your own from. The goal is any framework with any UI components: a skin of your design system, or of the component library of your framework, is built the same way, as Create your own skin below shows. The command installs the table and its skin; the page of the framework gives the whole setup, step by step, with a working page.

| Framework | Skin | Install | Page |
| --- | --- | --- | --- |
| Angular | Angular Material, \`mat\` | \`${installCommand('angular', 'mat')}\` | [Angular data table](https://table-bro.com/docs/frameworks/angular) |
| React and Preact | React MUI, \`mui\` | \`${installCommand('vanilla', 'mui')}\` | [React data table](https://table-bro.com/docs/frameworks/react), [Preact data table](https://table-bro.com/docs/frameworks/preact) |
| Solid | Solid SUID, \`suid\` | \`${installCommand('vanilla', 'suid')}\` | [Solid data table](https://table-bro.com/docs/frameworks/solid) |
| Svelte | Svelte M3, \`m3-svelte\` | \`${installCommand('vanilla', 'm3-svelte')}\` | [Svelte data table](https://table-bro.com/docs/frameworks/svelte) |
| Vue | Vue Vuetify, \`vuetify\` | \`${installCommand('vanilla', 'vuetify')}\` | [Vue 3 data table](https://table-bro.com/docs/frameworks/vue) |
| Vanilla JS | Vanilla Bootstrap, \`bs\` | \`${installCommand('vanilla', 'bs')}\` | [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla) |
| Vanilla JS | Vanilla HTML, \`nv\` | \`${installCommand('vanilla', 'nv')}\` | [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla) |

The skins Vanilla Bootstrap and Vanilla HTML work in every framework: install them as on [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla). In Angular they render through the component \`table-bro-ng\`, and [Angular data table](https://table-bro.com/docs/frameworks/angular) shows their setup.

<!-- own-skin -->
### Create your own skin

A skin gives the table the look and the controls of a UI library, and a skin of your design system, or of the component library of your framework, is built as the shipped skins are. It is a config, \`BroSkinConfig\`, which \`registerSkin(name, config)\` of \`@table-bro/core\` registers once, before the tables, and \`conf.skin\` of a table names: the classes of the parts of the table in \`css\`, the Custom Elements of its controls in \`components\`, each by its \`selector\`, the attribute of the color mode of your UI library in \`themeAttribute\` and the definition of its elements in \`defineElements\`.

Start from Vanilla HTML, \`nv\`: give its config \`nativeSkinConfig\` of \`@table-bro/native\` the classes of your design system, or replace its elements with Custom Elements of your UI components, and register it under a name of its own, as \`registerSkin('brand', brandSkinConfig)\` and \`conf: {skin: 'brand'}\`. An AI coding agent builds a skin of the components of your library with the skill [create-skin](https://github.com/table-bro/table-bro/tree/main/.agents/skills/create-skin) of the repository, whose reference is React MUI, \`mui\`. [Your own skin](https://table-bro.com/docs/design/your-own-skin) describes the config, the elements, the styles, the registration and the server render of a skin.`,
  files: [
    mcpInstall,
    {file: 'orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];

const rows: Order[] = [
  {
    description: 'Modern Cotton Chair',
    price: 100
  }, {
    description: 'Awesome Concrete Ball',
    price: 200
  }
];

const conf: BroConfig = {
  skin: 'bs', // 'nv' for Vanilla HTML
  toolbarTitle: 'Orders'
};

const table = document.createElement('table-bro');

table.id = 'orders';
table.configure({cols, rows, conf});

// The shadows of the table fall into the margins of this element: the visible table takes its full width
const container = document.createElement('div');

container.className = 'bro-table-shadow-container';
container.append(table);
document.body.append(container);
`}
  ]
};

/** The pages of the section Getting started of Docs, in the order of the menu of Docs. */
export const gettingStartedPages: BroDocPage[] = [gettingStartedPage];

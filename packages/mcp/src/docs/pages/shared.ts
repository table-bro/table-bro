import {type BroTarget, setupSteps} from '../../generate/setup.js';
import type {BroSpecSkin}           from '../../spec/spec.js';
import {tableBroVersion}            from '../../version.js';
import type {BroDocFile}            from '../pages.js';

// The parts of the pages of Docs outside the modules of the pages: the setups that get_started of the MCP server gives,
// the orders of the sample projects, the sections about the skins and the MCP server that more than one page shows, and
// the files of the samples of the pages of Frameworks
/** The languages of the files of code by the languages of the steps of the setup. */
const setupLanguages: Record<string, string> = {bash: 'bash', html: 'html', json: 'json', scss: 'scss', typescript: 'ts'};

/**
 * The setup of a project of one skin, as get_started of the MCP gives it: its steps as an ordered list of the page and
 * their code as the files of code of the page.
 * @param target - an Angular project or Vanilla JS
 * @param skin - the skin of the project
 */
function setup(target: BroTarget, skin: BroSpecSkin): {text: string; files: BroDocFile[]} {
  const files: BroDocFile[] = [];

  const text = setupSteps(target, skin).map((step, i) => {
    const blocks = [`${i + 1}. **${step.title}**`];

    if (step.text) {
      blocks.push(`   ${step.text}`);
    }

    if (step.code) {
      const language = setupLanguages[step.language ?? 'text'] ?? 'text';
      const file = `setup-${skin}-${i + 1}.${language}`;

      files.push({file, language, code: `${step.code}\n`});
      blocks.push(`   {{${file}}}`);
    }

    return blocks.join('\n\n');
  }).join('\n\n');

  return {text, files};
}

/**
 * The command that installs the table and a skin, the first step of its setup.
 * @param target - an Angular project or Vanilla JS
 * @param skin - the skin of the project
 */
export const installCommand = (target: BroTarget, skin: BroSpecSkin): string => setupSteps(target, skin)[0].code!;

export const setupMat = setup('angular', 'mat');
export const setupBs = setup('vanilla', 'bs');
export const setupNv = setup('vanilla', 'nv');
export const setupNgBs = setup('angular', 'bs');
export const setupNgNv = setup('angular', 'nv');

/** The columns of the orders of the sample projects, the items of their array cols. */
export const orderCols = `  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }`;

/** The orders of the demos of Docs on table-bro.com, the items of the array rows of the sample projects. */
export const orderRows = `  {description: 'Handcrafted Wooden Table, Gorgeous Bronze Watch, Modern Fresh Salad, Refined Plastic Keyboard, Practical Rubber Shoes', price: 80},
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
  {description: 'Ergonomic Steel Chair, Practical Rubber Shoes, Gorgeous Bronze Watch, Rustic Cotton Shirt, Modern Fresh Salad', price: 57}`;

/**
 * The file src/orders.ts of a sample project of a framework, as samples/react-mui/react has it: the pages of Preact,
 * React, Solid, Svelte and Vue show it with their skins, and the page Prerendering with Vanilla Bootstrap.
 * @param skin - the skin of the table
 * @param note - the comment after the skin, as // 'nv' for Vanilla HTML
 */
export const ordersFile = (skin: BroSpecSkin, note = ''): BroDocFile => ({file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
${orderCols}
];

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
${orderRows}
];

export const conf: BroConfig = {
  skin: '${skin}',${note}
  toolbarTitle: 'Orders'
};
`});

/** The component of the table of the orders in Angular, as samples/angular-material and samples/angular-ssr have it. */
export const angularOrders: BroDocFile = {file: 'src/app/orders.component.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

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
${orderCols.replace(/^/gm, '  ')}
  ]);

  // The orders of the demos of Docs on table-bro.com
  rows = signal<Order[]>([
${orderRows.replace(/^/gm, '  ')}
  ]);

  conf = signal<BroConfig>({
    skin: 'mat',
    toolbarTitle: 'Orders'
  });
}
`};
/**
 * The section about the skins after the setup of a page of Frameworks: Getting started describes them and a skin of
 * one's own.
 */
export const skinsSection = `#### Which skins can I use?

Table, Bro ships the skins Angular Material, React MUI, Solid SUID, Svelte M3, Vue Vuetify, Vanilla Bootstrap and Vanilla HTML, and a skin of your own design system or UI components is built the same way: [Getting started](https://table-bro.com/docs/getting-started) describes the skins, and [Your own skin](https://table-bro.com/docs/design/your-own-skin) how to build one.`;

/** The files of the setup of the page of Solid, as the project samples/solid-suid/solid has them. */
export const suidInstall: BroDocFile = {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/solid-suid @suid/material
`};

/** The files of the setup of the pages of React and Preact, as the projects of samples/react-mui have them. */
export const muiInstall: BroDocFile = {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/react-mui @mui/material @emotion/react @emotion/styled
`};
export const muiTheme: BroDocFile = {file: 'src/theme.ts', language: 'ts', code: `import {createTheme} from '@mui/material/styles';

// The theme of the application: its CSS variables give the colors to the table, and the attribute of its color
// schemes lets a table with a theme of its own take the light or the dark one. The colors are the ones of the theme of
// the sample of Angular Material, the azure palette of Material 3, so the table looks as the table of the skin mat
export const theme = createTheme({
  cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'},
  colorSchemes: {
    light: {
      palette: {
        primary: {main: '#005cbb', contrastText: '#ffffff'},
        text: {primary: '#1a1b1f', secondary: '#44474e'},
        action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)'},
        background: {default: '#faf9fd', paper: '#faf9fd'},
        divider: '#e0e2ec',
        'LinearProgress': {primaryBg: '#e0e2ec'},
        'TableCell': {border: '#74777f'}
      }
    },
    dark: {
      palette: {
        primary: {main: '#abc7ff', contrastText: '#002f65'},
        text: {primary: '#e3e2e6', secondary: '#e0e2ec'},
        action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)'},
        background: {default: '#121316', paper: '#121316'},
        divider: '#44474e',
        'LinearProgress': {primaryBg: '#44474e'},
        'TableCell': {border: '#8e9099'}
      }
    }
  }
});
`};
export const muiSkin: BroDocFile = {file: 'src/skin.ts', language: 'ts', code: `// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin mui, and
// setMuiTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
import {setMuiTheme} from '@table-bro/react-mui';

import {theme} from './theme';

import './sample-page.css';

setMuiTheme(theme);
`};

/**
 * The setup of the MCP server for Claude Code, which the installation on Getting started and on every page of
 * Frameworks starts with.
 */
export const mcpInstall: BroDocFile = {file: 'mcp.sh', language: 'bash', code: `claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@${tableBroVersion}
`};

/**
 * The installation with the MCP server, the first one on Getting started and on every page of Frameworks, as in the
 * README of the repository.
 * @param level - the heading of the section on its page, ### or #####
 * @param framework - the framework of the page, whose components render the table for Vanilla JS; none for Getting
 * started and Angular, whose code the server generates
 */
export const mcpSection = (level: string, framework?: string): string => `${level} Install with the MCP server

The quickest start is the MCP server of Table, Bro: add it to your AI coding agent and describe the table you need. The agent installs the packages, generates the table, its setup and its cells, and checks the result.${framework ? ` In a ${framework} app the server generates the table for Vanilla JS: a module with a function that renders \`‹table-bro›\` into an element, which a component gives it.` : ''} For Claude Code, in the root of the project:

{{mcp.sh}}

[MCP server](https://table-bro.com/docs/ai/mcp-server) gives the setup for Codex, Cursor, VS Code and Claude Desktop.`;

/** The page without a build of Vanilla Bootstrap, the files of samples/no-build. */
export const noBuildIndex: BroDocFile = {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Vanilla Bootstrap without a build</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@table-bro/core@${tableBroVersion}/dist/table-bro.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@table-bro/bootstrap@${tableBroVersion}/dist/table-bro.bootstrap.min.css" />
    <!-- The page around the table, as on table-bro.com -->
    <link rel="stylesheet" href="sample-page.css" />
    <script type="importmap">
      {
        "imports": {
          "@table-bro/core": "https://cdn.jsdelivr.net/npm/@table-bro/core@${tableBroVersion}/dist/table-bro.esm.js",
          "@table-bro/bootstrap": "https://cdn.jsdelivr.net/npm/@table-bro/bootstrap@${tableBroVersion}/dist/table-bro.bootstrap.esm.js",
          "bootstrap": "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.esm.min.js",
          "@popperjs/core": "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/popper.min.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module" src="app.js"></script>
  </body>
</html>
`};
export const noBuildApp: BroDocFile = {file: 'app.js', language: 'js', code: `// The import of the skin defines <table-bro> and registers the skin bs, and useBootstrap() gives it the Dropdown and
// the Tooltip of Bootstrap
import {useBootstrap}      from '@table-bro/bootstrap';
import {Dropdown, Tooltip} from 'bootstrap';

useBootstrap({Dropdown, Tooltip});

const cols = [
${orderCols}
];

// The orders of the demos of Docs on table-bro.com
const rows = [
${orderRows}
];

const conf = {
  skin: 'bs',
  toolbarTitle: 'Orders'
};

const table = document.createElement('table-bro');

table.id = 'orders';
table.configure({cols, rows, conf});
table.addEventListener('bro-action', event => console.log(event.detail.action));

// The shadows of the table fall into the margins of this element: the visible table takes its full width
const container = document.createElement('div');

container.className = 'bro-table-shadow-container';
container.append(table);
document.body.append(container);
`};

/** The orders of the pages of Vanilla JS, as the sample projects samples/bootstrap and samples/native have them. */
export const vanillaOrders: BroDocFile = {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const cols: BroCol<Order>[] = [
${orderCols}
];

// The orders of the demos of Docs on table-bro.com
const rows: Order[] = [
${orderRows}
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
`};

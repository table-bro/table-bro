import {type BroTarget, setupSteps} from '../generate/setup.js';
import type {BroSpecSkin}           from '../spec/spec.js';
import {tableBroVersion}            from '../version.js';

/** A file of code of a page of Docs, which the text of the page shows. */
export interface BroDocFile {
  /** The name of the file, unique on its page; the text shows the file by the line {{file}}. */
  file: string;
  /** The language of the code, as of a Markdown code block: ts, tsx, js, scss, css, html, vue, svelte, json, bash or text. */
  language: string;
  code: string;
}

/**
 * A page of Docs: the one source of the page of Docs on table-bro.com and of its topic of get_docs. The text is
 * Markdown of a few forms: paragraphs, headings ### to ######, ordered lists whose items continue with blocks
 * indented by three spaces, tables | a | b | with the line | --- | --- | after the head, `code`, **strong**, _emphasis_ and
 * [links](url); the _emphasis_ at the end of a heading is its note, as #### Loading _with Lottie_. A line {{file}} shows a
 * file of code, and a line <!-- name --> starts the part of the page that the site shows at that name, next to its tables.
 * An API that came after 1.1.0 names the version it came in: a section by the note of its heading, as
 * #### Prerendering _since 1.2.0_, a field in a table of fields by the column Since, as | Field | Default | Since |.
 */
export interface BroDocPage {
  /** The path of the page under /docs. */
  path: string;
  name: string;
  text: string;
  files: BroDocFile[];
}

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
const installCommand = (target: BroTarget, skin: BroSpecSkin): string => setupSteps(target, skin)[0].code!;

const setupMat = setup('angular', 'mat');
const setupBs = setup('vanilla', 'bs');
const setupNv = setup('vanilla', 'nv');
const setupNgBs = setup('angular', 'bs');
const setupNgNv = setup('angular', 'nv');

/** The orders of the tables, the file src/orders.ts that the page Prerendering shows. */
const frameworkOrders: BroDocFile = {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
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

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
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
];

export const conf: BroConfig = {
  skin: 'bs', // 'nv' for Vanilla HTML
  toolbarTitle: 'Orders'
};
`};

/**
 * The section about the skins after the setup of a page of Frameworks: Getting started describes them and a skin of
 * one's own.
 */
const skinsSection = `#### Which skins can I use?

Table, Bro ships the skins Angular Material, MUI, SUID, M3 Svelte, Vuetify, Bootstrap 5 and Native, and a skin of your own design system or UI components is built the same way: [Getting started](https://table-bro.com/docs/getting-started) describes the skins, and its section [Create your own skin](https://table-bro.com/docs/getting-started#create-your-own-skin) how to build one.`;

/**
 * The setup of the MCP server for Claude Code, which the installation on Getting started and on every page of
 * Frameworks starts with.
 */
/** The files of the setup of the page of Solid, as the project samples/solid-suid/solid has them. */
const suidInstall: BroDocFile = {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/solid-suid @suid/material
`};

/** The files of the setup of the pages of React and Preact, as the projects of samples/react-mui have them. */
const muiInstall: BroDocFile = {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/react-mui @mui/material @emotion/react @emotion/styled
`};
const muiTheme: BroDocFile = {file: 'src/theme.ts', language: 'ts', code: `import {createTheme} from '@mui/material/styles';

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
const muiSkin: BroDocFile = {file: 'src/skin.ts', language: 'ts', code: `// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin mui, and
// setMuiTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
import {setMuiTheme} from '@table-bro/react-mui';

import {theme} from './theme';

import './sample-page.css';

setMuiTheme(theme);
`};
const muiOrders: BroDocFile = {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
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

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
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
];

export const conf: BroConfig = {
  skin: 'mui',
  toolbarTitle: 'Orders'
};
`};

const mcpInstall: BroDocFile = {file: 'mcp.sh', language: 'bash', code: `claude mcp add --scope project table-bro -- npx -y @table-bro/mcp@${tableBroVersion}
`};

/**
 * The installation with the MCP server, the first one on Getting started and on every page of Frameworks, as in the
 * README of the repository.
 * @param level - the heading of the section on its page, ### or #####
 * @param framework - the framework of the page, whose components render the table for Vanilla JS; none for Getting
 * started and Angular, whose code the server generates
 */
const mcpSection = (level: string, framework?: string): string => `${level} With the MCP server

The quickest start is the MCP server of Table, Bro: add it to your AI coding agent and describe the table you need. The agent installs the packages, generates the table, its setup and its cells, and checks the result.${framework ? ` In a ${framework} app the server generates the table for Vanilla JS: a module with a function that renders \`‹table-bro›\` into an element, which a component gives it.` : ''} For Claude Code, in the root of the project:

{{mcp.sh}}

[MCP server](https://table-bro.com/docs/ai/mcp-server) gives the setup for Codex, Cursor, VS Code and Claude Desktop.`;

/** The page without a build of Vanilla Bootstrap, the files of samples/no-build. */
const noBuildIndex: BroDocFile = {file: 'index.html', language: 'html', code: `<!doctype html>
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
const noBuildApp: BroDocFile = {file: 'app.js', language: 'js', code: `// The import of the skin defines <table-bro> and registers the skin bs, and useBootstrap() gives it the Dropdown and
// the Tooltip of Bootstrap
import {useBootstrap}      from '@table-bro/bootstrap';
import {Dropdown, Tooltip} from 'bootstrap';

useBootstrap({Dropdown, Tooltip});

const cols = [
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

// The orders of the demos of Docs on table-bro.com
const rows = [
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
const vanillaOrders: BroDocFile = {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

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

// The orders of the demos of Docs on table-bro.com
const rows: Order[] = [
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

/** The pages of Docs, in the order of reading. Island Details have their own pages on the site, apart from this package. */
export const docPages: BroDocPage[] = [
  {
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

The skins Vanilla Bootstrap and Vanilla HTML work in every framework too, as the pages of Frameworks show; Angular has steps of its own for them on [Angular data table](https://table-bro.com/docs/frameworks/angular).

<!-- own-skin -->
### Create your own skin

A skin is a config that \`registerSkin(name, config)\` of \`@table-bro/core\` registers once, before the tables, and \`conf.skin\` of a table names. The config, \`BroSkinConfig\`, holds the classes of the parts of the table in \`css\`; the Custom Elements of its controls in \`components\`, each by its \`selector\`: the toolbar, the sort header, the paginator, the progress bar, the buttons and the dropdowns; and the attribute of the color mode of your UI library in \`themeAttribute\`, as \`data-bs-theme\` of Bootstrap, which the table sets on its host to \`'light'\` or \`'dark'\`. The table also puts the name of the skin on its host as a class, so the CSS of your skin applies under that class.

Native is the skin to start from: its config \`nativeSkinConfig\` of \`@table-bro/native\` and its sources in [packages/skins/native](https://github.com/table-bro/table-bro/tree/main/packages/skins/native) show the parts of a skin. Give the parts the classes of your design system, or replace the elements with Custom Elements of your UI components, as the skin Angular Material does with the components of Angular Material, then register the config under a name of its own: \`registerSkin('brand', brandSkinConfig)\` and \`conf: {skin: 'brand'}\`. To change a part of a shipped skin for one table, \`config.components\` and \`config.css\` of the table are enough: they change any value or function of the config of the skin.

An AI coding agent builds a skin of the components of your library with the skill [create-skin](https://github.com/table-bro/table-bro/tree/main/.agents/skills/create-skin) of the repository: the package, the elements and their contract with the table, the theme, the styles, a sample and the checks. The skin \`mui\` on MUI is its reference.`,
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
  },
  {
    path: 'basics/fixed-row-height',
    name: 'Fixed row height',
    text: `<!-- intro -->
All body rows of a table have one fixed height, and its header has one too. Give them with the CSS variables of the skin on the table itself, before it renders: the CSS and the script of the table take them together, without a new build of the skin.

{{fixed-row-height.css}}

#### From the SCSS sources

The package of each skin ships its built CSS and its SCSS sources. A build of the SCSS of the skin gives it other heights for all its tables: configure the skin where your SCSS loads it, with \`node_modules/@table-bro/<skin>/styles\` and \`node_modules/@table-bro/core/styles/mappings/production\` among the load paths of Sass.

{{fixed-row-height.scss}}`,
    files: [
      {file: 'fixed-row-height.css', language: 'css', code: `#orders {
  --bro-header-height: 64px;
  --bro-row-height: 64px;
}
`},
      {file: 'fixed-row-height.scss', language: 'scss', code: `// The skin of the project: "table-bro.material", "table-bro.bootstrap" or "table-bro.native"
@use "table-bro.material" with ($bro-table-header-height: 64px, $bro-table-row-height: 64px);
`}
    ]
  },
  {
    path: 'basics/fixed-column-width',
    name: 'Fixed column width',
    text: `<!-- intro -->
The table gives every column its optimal width by itself: \`autoColumnWidth\`, on by default, measures the titles and the values of the columns and shares the width of the table between them.

Any column can still have a fixed width. Give the column a class with \`className\` and the width of its cells in your CSS: the table measures the column at this width and keeps it, the other columns share the rest, and a longer value ends with an ellipsis and shows whole in the tooltip.

{{fixed-col-width.ts}}

{{fixed-col-width.css}}

A build from the SCSS sources has the mixin \`bro-text-ellipsis-width\` of the module \`table-bro.api\` for it:

{{fixed-col-width.scss}}`,
    files: [
      {file: 'fixed-col-width.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description',
    className: 'bro-order_description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-col_text-right'
  }
];
`},
      {file: 'fixed-col-width.css', language: 'css', code: `.bro-order_description .bro-cell_component {
  width: 400px;
}
`},
      {file: 'fixed-col-width.scss', language: 'scss', code: `@use "table-bro.api" as *;

@include bro-text-ellipsis-width('.bro-order_description', 400px);
`}
    ]
  },
  {
    path: 'basics/auto-detected-column-width',
    name: 'Auto-detected column width',
    text: `<!-- table-basics_auto-detected-column-width -->
Before its rows come, the table measures the titles of the columns: the header stands at their widths. The rows that come give the columns the widths of their values, and the header moves to them.

<!-- auto-column-width -->
#### Column widths without auto-detection

The auto-detection measures the values of a column and gives it the width of the longest one. An application that knows the widths it needs turns it off with \`autoColumnWidth: false\` in the config: the table measures nothing and writes no widths, and your CSS gives every column its width through its class, \`className\` of the column. Give the width with the mixin \`bro-text-ellipsis-width\` of the module \`table-bro.api\`, and the column is as wide as you need: a long value keeps to the one line of its row and ends with an ellipsis.

{{auto-column-width.ts}}

{{auto-column-width.scss}}

A table with a Filter Drawer keeps the auto-detection, \`autoColumnWidth: true\` by default. The drawer declares the width that it leaves the table: the columns take it at once and move with the drawer, and a value that does not fit any more ends with an ellipsis and shows whole in the tooltip. With \`autoColumnWidth: false\` the table follows neither the drawer nor a resize: the widths of your CSS stay as they are.`,
    files: [
      {file: 'auto-column-width.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

const conf: BroConfig = {
  autoColumnWidth: false
};

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description',
    className: 'bro-order_description'
  }, {
    title: 'Price',
    name: 'price',
    dataType: 'number',
    className: 'bro-order_price bro-col_text-right'
  }
];
`},
      {file: 'auto-column-width.scss', language: 'scss', code: `@use "table-bro.api" as *;

@include bro-text-ellipsis-width('.bro-order_description', 400px);
@include bro-text-ellipsis-width('.bro-order_price', 120px);
`}
    ]
  },
  {
    path: 'basics/tooltip',
    name: 'Truncated text with hover tooltips',
    text: `<!-- table-basics_tooltip -->
Each truncated table cell shows a tooltip on hover.`,
    files: []
  },
  {
    path: 'basics/animated-pagination',
    name: 'Animated pagination',
    text: `<!-- table-basics_animated-pagination -->
When paginating, the table animates all visible rows, with no vertical scrollbar.

<!-- animated-pagination-server -->
##### Animated pagination _with server-side data loading_

<!-- animated-pagination-server code -->
{{animated-pagination_server.ts}}`,
    files: [
      {file: 'animated-pagination_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  server: true
};
`}
    ]
  },
  {
    path: 'basics/animated-page-size',
    name: 'Animated page size change',
    text: `<!-- table-basics_animated-page-size -->
The table uses animation when the number of visible rows changes.

<!-- animated-page-size-server -->
##### Animated page size change _with server-side data loading_

<!-- animated-page-size-server code -->
{{animated-page-size_server.ts}}`,
    files: [
      {file: 'animated-page-size_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  server: true
};
`}
    ]
  },
  {
    path: 'basics/table-states',
    name: 'Animated table states',
    text: `<!-- intro -->
The table supports and animates following states: _Loading_, _No data_, _No records found_, _Failed_.

The first tables show the states as Lottie animations, as every table of this site with Angular Material and Bootstrap; the Native skin shows its own icons. The tables after them show static icons: the SVG of Bootstrap Icons with Bootstrap and an icon font with Angular Material.

<!-- table-state-loading-lottie -->
#### Loading _with Lottie_

State icon and message as a Lottie animation:

<!-- table-state-no-data-lottie -->
#### No data _with Lottie_

State icon and message as a Lottie animation:

<!-- table-state-no-records-found-lottie -->
#### No records found _with Lottie_

State icon and message as a Lottie animation:

<!-- table-state-failed-lottie -->
#### Failed _with Lottie_

State icon and message as a Lottie animation:

<!-- lottie -->
#### Lottie animations

Define the icons of the states as Lottie animations (\`statesDark\` are optional):

{{lottie-icon.ts}}

The Lottie files of these tables, light and dark, come with the package \`@table-bro/core\` in \`dist/lottie\`: \`mat\` for Angular Material and \`bs\` for Bootstrap. An Angular application serves them as its assets, in \`angular.json\`:

{{lottie-assets.json}}

**Dependencies** (384 kB):

{{lottie-dependencies.html}}

<!-- table-state-loading -->
#### Loading _with animated icon_

This is the default view displayed when there's no data yet:

<!-- table-state-no-data -->
#### No data _with animated icon_

When the data is loaded and it's empty (empty array \`[]\` in \`rows\`):

<!-- table-state-no-records-found -->
#### No records found _with animated icon_

When no records are found for the user's search:

<!-- table-basics_state-failed -->
#### Failed _with animated icon_

When an error occurs during data loading:

<!-- options -->
#### Other options to configure state icons and messages:

1. **Define icons as _HTML_**

   _SVG_-icons:

   {{html-icon_bs.ts}}

   _Emoji_, as the Native skin shows them:

   {{html-icon_nv.ts}}

2. **Define icons as _icon font_**, adding \`.bro-state-icon\` to tag-container:

   Material icons:

   {{font-icon_mat.ts}}

   **Dependencies** (0.364 kB of \`CSS\`, 129 kB of \`woff2\`):

   {{font-icon_mat-dependencies.html}}`,
    files: [
      {file: 'html-icon_bs.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  components: {
    state: {
      states: {
        loading: [
          \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-rocket-takeoff-fill" viewBox="0 0 16 16">
             <path d="M12.17 9.53c2.307-2.592 3.278-4.684 3.641-6.218.21-.887.214-1.58.16-2.065a3.6 3.6 0 0 0-.108-.563 2 2 0 0 0-.078-.23V.453c-.073-.164-.168-.234-.352-.295a2 2 0 0 0-.16-.045 4 4 0 0 0-.57-.093c-.49-.044-1.19-.03-2.08.188-1.536.374-3.618 1.343-6.161 3.604l-2.4.238h-.006a2.55 2.55 0 0 0-1.524.734L.15 7.17a.512.512 0 0 0 .433.868l1.896-.271c.28-.04.592.013.955.132.232.076.437.16.655.248l.203.083c.196.816.66 1.58 1.275 2.195.613.614 1.376 1.08 2.191 1.277l.082.202c.089.218.173.424.249.657.118.363.172.676.132.956l-.271 1.9a.512.512 0 0 0 .867.433l2.382-2.386c.41-.41.668-.949.732-1.526zm.11-3.699c-.797.8-1.93.961-2.528.362-.598-.6-.436-1.733.361-2.532.798-.799 1.93-.96 2.528-.361s.437 1.732-.36 2.531Z"/>
             <path d="M5.205 10.787a7.6 7.6 0 0 0 1.804 1.352c-1.118 1.007-4.929 2.028-5.054 1.903-.126-.127.737-4.189 1.839-5.18.346.69.837 1.35 1.411 1.925"/>
           </svg>\`, 'Loading'],
        'no-data': [
          \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heartbreak-fill" viewBox="0 0 16 16">
             <path d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586M7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77"/>
           </svg>\`, 'No data'],
        'not-found': [
          \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
             <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
           </svg>\`, 'No records found'],
        fail: [
          \`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-neutral-fill" viewBox="0 0 16 16">
             <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m-3 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
           </svg>\`, 'Failed']
      }
    }
  }
};
`},
      {file: 'html-icon_nv.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  components: {
    state: {
      states: {
        loading: ['🚀', 'Loading'],
        'no-data': ['💔', 'No data'],
        'not-found': ['🔦', 'No records found'],
        fail: ['😕', 'Failed']
      }
    }
  }
};
`},
      {file: 'font-icon_mat.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  components: {
    fontIcon: {
      html: (materialIcon: string) => \`<span class="material-icons bro-state-icon">\${materialIcon}</span>\`
    },
    state: {
      fontIcon: true,
      states: {
        loading: ['front_loader', 'Loading'],
        'no-data': ['heart_broken', 'No data'],
        'not-found': ['heart_broken', 'No records found'],
        fail: ['smart_toy', 'Failed']
      }
    }
  }
};
`},
      {file: 'font-icon_mat-dependencies.html', language: 'html', code: `<head>
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
`},
      {file: 'lottie-icon.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  components: {
    state: {
      lottie: true,

      lottieHTML: (iconSrc: string): string => \`<lottie-player autoplay mode="normal" src="\${iconSrc}"></lottie-player>\`,

      states: {
        loading: ['lottie/mat/loading.json', 'Loading'],
        'no-data': ['lottie/mat/no-data.json', 'No data'],
        'not-found': ['lottie/mat/no-data.json', 'No records found'],
        fail: ['lottie/mat/fail.json', 'Failed']
      },

      statesDark: {
        loading: ['lottie/mat/dark/loading.json', 'Loading'],
        'no-data': ['lottie/mat/dark/no-data.json', 'No data'],
        'not-found': ['lottie/mat/dark/no-data.json', 'No records found'],
        fail: ['lottie/mat/dark/fail.json', 'Failed']
      }
    }
  }
};
`},
      {file: 'lottie-assets.json', language: 'json', code: `"assets": [
  {
    "glob": "**/*",
    "input": "node_modules/@table-bro/core/dist/lottie",
    "output": "lottie"
  }
]
`},
      {file: 'lottie-dependencies.html', language: 'html', code: `<body>
<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
</body>
`}
    ]
  },
  {
    path: 'design/css-styling',
    name: 'Supports CSS styling of ‹table›',
    text: `<!-- table-css -->
Table, Bro uses standard \`‹table›\` CSS styling, allowing you to apply any of your existing \`‹table›\` styles:

<!-- table-css code -->
{{table-css.ts}}

<!-- after -->
Your \`CSS\` of these classes, as of any \`‹table›\` of the page:

{{table-css.css}}`,
    files: [
      {file: 'table-css.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  css: {
    table: {
      className: '',

      thead: {
        className: '',

        tr: {
          className: 'bro-header-row',

          th: {
            className: 'bro-header-cell'
          }
        }
      },

      tbody: {
        className: '',

        tr: {
          className: 'bro-row',

          td: {
            className: 'bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'shadow'
    }
  }
};
`},
      {file: 'table-css.css', language: 'css', code: `table-bro th.bro-header-cell,
table-bro td.bro-cell {
  padding: 0 0 0 16px;
}

table-bro tr.bro-header-row {
  height: var(--bro-header-height);
}

table-bro tr.bro-row {
  height: var(--bro-row-height);
}

table-bro table {
  border-color: #dee2e6;
}

table-bro.bro-dark-theme table {
  border-color: #495057;
}
`}
    ]
  },
  {
    path: 'design/custom-content',
    name: 'Custom content in tables using Custom Elements',
    text: `<!-- table-custom-content -->
You can use any component inside table cells, creating it as a \`Custom Element\`, or transforming your _Angular/React/Svelte/Vue/[Your framework](https://custom-elements-everywhere.com/)_ components to \`Custom Element\`, e.g.

<!-- after -->
Name your own elements of the cells \`bro-cell-*\`: the library never defines this prefix and leaves it to the application.

Switcher-component as a _[Custom Element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)_:

{{bro-cell-switch.ts}}

and define it in your app and name it in the column of its cells:

{{bro-cell-switch_define.ts}}

Switcher-component as an _Angular_-component:

{{bro-cell-slide-toggle.component.ts}}

and define it in your app with \`@angular/elements\`, on the example of the page of the table:

{{bro-cell-slide-toggle.component_define.ts}}`,
    files: [
      {file: 'bro-cell-switch.ts', language: 'ts', code: `import type {BroCellElement, BroCol, BroConfig, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

export class BroCellSwitchComponent extends HTMLElement implements BroCellElement<Order> {
  // The table sets the config, the column and the row of the cell before it connects the element
  config?: BroConfig;
  col?: BroCol<Order>;
  row?: Order;

  connectedCallback(): void {
    const input = document.createElement('input');

    input.type = 'checkbox';
    input.role = 'switch';
    input.checked = this.getAttribute('checked') === 'true';

    this.replaceChildren(input);
  }
}
`},
      {file: 'bro-cell-switch_define.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

import {BroCellSwitchComponent} from './bro-cell-switch';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

customElements.define('bro-cell-switch', BroCellSwitchComponent);

const cols: BroCol<Order>[] = [
  {
    title: 'Description',
    name: 'description'
  }, {
    title: 'Action',
    name: 'action',
    component: {
      selector: 'bro-cell-switch',
      attrs: {
        checked: (_col, row) => row.action
      }
    }
  }
];
`},
      {file: 'bro-cell-slide-toggle.component.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {MatSlideToggle}                      from '@angular/material/slide-toggle';
import type {BroCellElement, BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

@Component({
  selector: 'bro-cell-slide-toggle',
  template: \`
    <mat-slide-toggle [hideIcon]="true" [checked]="row.action"></mat-slide-toggle>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggle
  ]
})
export class BroCellSlideToggleComponent implements BroCellElement<Order> {
  @Input() col!: BroCol<Order>;
  @Input() row!: Order;
}
`},
      {file: 'bro-cell-slide-toggle.component_define.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, inject, Injector, signal} from '@angular/core';
import {createCustomElement}                                          from '@angular/elements';

import {TableBroNg}                     from '@table-bro/angular';
import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

import {BroCellSlideToggleComponent} from './bro-cell-slide-toggle.component';

interface Order extends BroRow {
  description: string;
  price: number;
  action: boolean;
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>\`,
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
      title: 'Action',
      name: 'action',
      component: 'bro-cell-slide-toggle'
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);
  conf = signal<BroConfig>({skin: 'mat'});

  private injector = inject(Injector);

  constructor() {
    this.defineCustomElements();
  }

  /** The cells are Custom Elements: the table creates them by their tags, so they are defined before it. */
  private defineCustomElements() {
    if (customElements.get('bro-cell-slide-toggle')) {
      return;
    }

    customElements.define('bro-cell-slide-toggle', createCustomElement(BroCellSlideToggleComponent, {injector: this.injector}));
  }
}
`}
    ]
  },
  {
    path: 'design/shadows',
    name: 'Shadows',
    text: `<!-- table-shadows -->
Shadows are enabled by default. They can be disabled:

<!-- table-shadows code -->
{{shadows-support.ts}}`,
    files: [
      {file: 'shadows-support.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  shadowsEnabled: false
};
`}
    ]
  },
  {
    path: 'design/rounded-corners',
    name: 'Rounded corners',
    text: `<!-- table-rounded-corners -->
The table and the Filter Drawer have the rounded corners of Material 3: 12 px for the table, 16 px for the drawer.

Open details split the table into cards, and each card rounds its corners at the spaces between them.

<!-- table-rounded-corners-square -->
##### Square corners

A radius of \`0\` keeps the corners square:

<!-- table-rounded-corners-square code -->
Set the CSS variables on the table itself, the element \`‹table-bro›\` or \`tableId\` of the wrapper, and on the container of its Filter Drawer, without a new build of the skin:

{{rounded-corners.css}}

Or build the skin from its SCSS sources with square corners for all its tables:

{{rounded-corners.scss}}`,
    files: [
      {file: 'rounded-corners.css', language: 'css', code: `#orders,
table-bro-filter-drawer-container,
table-bro-filter-drawer-container-ng {
  --bro-corner-radius: 0;
  --bro-filter-drawer-corner-radius: 0;
}
`},
      {file: 'rounded-corners.scss', language: 'scss', code: `// The skin of the project: "table-bro.material", "table-bro.bootstrap" or "table-bro.native"
@use "table-bro.material" with ($bro-corner-radius: 0, $bro-filter-drawer-corner-radius: 0);
`}
    ]
  },
  {
    path: 'design/dark-light-mode',
    name: 'Dark/Light mode',
    text: `<!-- table-themes -->
You can set the value to \`auto\`, and the Table, Bro will follow the system color scheme defined by the \`prefers-color-scheme\` media query.

Alternatively, you can set it to \`light\` or \`dark\` to force a specific mode.

<!-- table-themes code -->
{{themes.ts}}`,
    files: [
      {file: 'themes.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  theme: 'auto' // 'light' | 'dark'
};
`}
    ]
  },
  {
    path: 'design/material-design',
    name: 'Material design',
    text: `<!-- table-material-design -->
Table, Bro implements the Google Material Design [data tables](https://m2.material.io/components/data-tables#specs) specs in its Material skins, one for each framework: a skin renders the components of the Material library of its framework in the table and takes the theme of your application.

#### Angular Material

Angular Material skin of Table, Bro supports 100% of Google Material Design data tables specs and integrates all the Angular Material components it depends on.

It supports Material 3 (M3) and Angular Material 22: the skin takes the theme of your application, as the components of Angular Material do, and a table in the dark theme takes the dark scheme of the theme.

#### React MUI

React MUI skin of Table, Bro renders the components of [MUI](https://mui.com/material-ui/) in the table: its toolbar, sort labels, table pagination, linear progress, chips, switches, tooltips and menus, with the sizes of the tables of the skin Angular Material.

It supports MUI 9 with React 19, and Preact through \`preact/compat\`. The table takes the colors of the MUI theme of your application from its CSS variables, so the theme turns on \`cssVariables\`, and a table with a theme of its own takes the light or the dark scheme of the theme by the attribute \`data-mui-color-scheme\`:

{{mui-skin.ts}}

The whole setup is on the pages [React data table](https://table-bro.com/docs/frameworks/react) and [Preact data table](https://table-bro.com/docs/frameworks/preact).

#### Solid SUID

Solid SUID skin of Table, Bro renders the components of [SUID](https://suid.dev), the port of MUI to Solid, in the table: its toolbar, linear progress, chips, switches, menus and the select of the page sizes, with the sizes of the tables of the skin Angular Material. SUID has no table pagination, sort label or tooltip: the skin takes the paginator and the sort header of the vanilla skins in the look of MUI, and renders its tooltips on the Popper of SUID with the behavior of the tooltips of Angular Material.

It supports SUID 0.19 with Solid 1.9. SUID writes no CSS variables, so \`setSuidTheme()\` writes the variables of the theme that the table reads, and writes them again when a palette given as a getter changes, as one that follows the color scheme of the system. A table with a theme of its own takes the variables and the theme of SUID of its scheme by the attribute \`data-suid-theme\`:

{{suid-skin.ts}}

The whole setup is on the page [Solid data table](https://table-bro.com/docs/frameworks/solid).

#### Svelte M3

Svelte M3 skin of Table, Bro renders the Material 3 components of [M3 Svelte](https://github.com/KTibow/m3-svelte) in the table: its buttons, menus, outlined select, input chips, switches and linear progress, with the sizes of the tables of the skin Angular Material. M3 Svelte has no component of a table, a top app bar, a sort header or an indeterminate progress bar, and does not export its tooltip: the skin builds them from the tokens of the theme, and its plain tooltip of Material 3 behaves as the tooltip of the skin Angular Material.

It supports M3 Svelte 7 with Svelte 5. The table takes the colors of the M3 Svelte theme of your application from its CSS variables \`--m3c-*\`, which the theme writes with \`light-dark()\`, so a table with a theme of its own takes the light or the dark scheme of the theme by its color scheme. The theme comes from the theme page of M3 Svelte:

{{m3-theme.css}}

The whole setup is on the page [Svelte data table](https://table-bro.com/docs/frameworks/svelte).

#### Vue Vuetify

Vue Vuetify skin of Table, Bro renders the components of [Vuetify](https://vuetifyjs.com/) in the table: its toolbar, the sort headers of its data table, a footer with the select of the page size, linear progress, chips, inset switches, tooltips and menus, with the sizes of the tables of the skin Angular Material.

It supports Vuetify 4 with Vue 3.5. With the blueprint of Material 3 of Vuetify the components in the table are the ones of Material 3 (M3). The components take the instance of Vuetify of your application, its themes, defaults and icons, and the table takes the colors of its themes from the CSS variables that Vuetify writes. A table with a theme of its own takes the theme of Vuetify of the same name, light or dark, by the attribute \`data-vuetify-theme\`:

{{vuetify-skin.ts}}

The whole setup is on the page [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      {file: 'mui-skin.ts', language: 'ts', code: `import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
import {setMuiTheme} from '@table-bro/react-mui';

import {createTheme} from '@mui/material/styles';

// The theme of the application, which its ThemeProvider renders: the table reads its CSS variables
export const theme = createTheme({
  cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'},
  colorSchemes: {light: true, dark: true}
});

setMuiTheme(theme);
`},
      {file: 'suid-skin.ts', language: 'ts', code: `import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/solid-suid/dist/table-bro.solid-suid.min.css';
import {setSuidTheme} from '@table-bro/solid-suid';

import {createTheme} from '@suid/material/styles';

// The theme of the application, which its ThemeProvider renders: the skin writes its CSS variables for the table
export const theme = createTheme();

setSuidTheme(theme);
`},
      {file: 'm3-theme.css', language: 'css', code: `/* The styles of M3 Svelte and the theme of the application, as the theme page of M3 Svelte writes it: the table reads
   the same CSS variables as the components of M3 Svelte */
@import "m3-svelte/etc/styles.css";
@import "m3-svelte/etc/recommended-styles.css";

@function --m3-density(--size) {
  result: var(--size);
}

:root {
  color-scheme: light dark;
}

@layer tokens {
  :root {
    --m3c-surface: light-dark(#fdf7fe, #0f0d12);
    --m3c-on-surface: light-dark(#34313a, #eae3ef);
    --m3c-primary: light-dark(#655789, #cec0ec);
    /* ... the other colors of the theme */
  }
}
`},
      {file: 'vuetify-skin.ts', language: 'ts', code: `import 'vuetify/styles';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css';
import {setVuetify} from '@table-bro/vue-vuetify';

import {createVuetify} from 'vuetify';
import {md3}           from 'vuetify/blueprints';

// The Vuetify of the application, which its app installs: the table reads the CSS variables of its themes
export const vuetify = createVuetify({blueprint: md3});

setVuetify(vuetify);
`}
    ]
  },
  {
    path: 'design/bootstrap-design',
    name: 'Bootstrap design',
    text: `<!-- table-bootstrap-design -->
Bootstrap skin of Table, Bro supports 100% of Bootstrap [Tables](https://getbootstrap.com/docs/5.3/content/tables/) specs and integrates all the Bootstrap components it depends on.

It supports Bootstrap 5.3.`,
    files: []
  },
  {
    path: 'details/default-details',
    name: 'Default Details',
    text: `<!-- table-details-default code -->
{{default-details.ts}}

<!-- table-details-default-server -->
#### Default Details _with server-side data loading_

With default \`indeterminate\` progress bar:

<!-- table-details-default-server code -->
{{default-details_server.ts}}

<!-- table-details-default-server-determinate -->
With \`determinate\` progress bar:

<!-- table-details-default-server-determinate code -->
{{default-details_server-determinate.ts}}

<!-- emit -->
Example how to emit _progress status_ from your Details component (e.g. based on your server logic):

{{details_server-determinate_emit.ts}}

<!-- emit angular -->
or in case of Details is an Angular-component (registered in your Angular-app as a Custom Element):

{{details_server-determinate_emit-angular.ts}}`,
    files: [
      {file: 'default-details.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details' // your Details-component as a Custom Element
};
`},
      {file: 'default-details_server.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

  rowDetailsServer: true
};
`},
      {file: 'default-details_server-determinate.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

  rowDetailsServer: true,
  rowDetailsProgressMode: 'determinate'
};
`},
      {file: 'details_server-determinate_emit.ts', language: 'ts', code: `import {type BroRow, type BroRowDetailsElement, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

export class BroCellDetailsComponent extends HTMLElement implements BroRowDetailsElement<Order> {
  // The table sets the row before it connects the element, and the attribute server with rowDetailsServer
  row?: Order;

  private progress: number = 0;
  // The table moves loaded server details from its aux row into the row of the details: the content renders once
  private rendered: boolean = false;
  private timerId?: ReturnType<typeof setInterval>;

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    if (this.getAttribute('server') !== 'true') {
      this.render();

      return;
    }

    // Emulates the loading of the details: your server logic reports its progress from 0 to 1
    this.timerId = setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.2);

      if (this.progress === 1) {
        clearInterval(this.timerId);
        this.render();
      }

      this.emitProgress(this.progress);
    }, 400);
  }

  disconnectedCallback(): void {
    clearInterval(this.timerId);
  }

  private emitProgress(progress: number): void {
    this.dispatchEvent(new CustomEvent(events.detailsServerLoadedEvent, {detail: progress}));
  }

  private render(): void {
    this.textContent = \`Some details here: \${this.row?.description}\`;
    this.rendered = true;
  }
}

// Somewhere in your app, before the table:
customElements.define('bro-cell-details', BroCellDetailsComponent);
`},
      {file: 'details_server-determinate_emit-angular.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, EventEmitter, inject, Injector, Input, type OnDestroy, type OnInit, Output, signal} from '@angular/core';
import {createCustomElement}                                                                                                    from '@angular/elements';

import {TableBroNg}                                                                  from '@table-bro/angular';
import {type BroCol, type BroConfig, type BroRow, type BroRowDetailsElement, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'bro-cell-order-details',
  template: \`
    @if (loaded()) {
      <div>Some details here: {{ row.description }}</div>
    }\`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BroCellOrderDetailsComponent implements OnInit, OnDestroy, BroRowDetailsElement<Order> {
  @Input() row!: Order;
  @Input() server?: string;

  // The Custom Element of the component dispatches the output as the event of its name
  @Output(events.detailsServerLoadedEvent) progressChange = new EventEmitter<number>();

  loaded = signal(false);

  private progress: number = 0;
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit() {
    if (this.server !== 'true') {
      this.loaded.set(true);

      return;
    }

    // Emulates the loading of the details: your server logic reports its progress from 0 to 1
    this.timerId = setInterval(() => {
      this.progress = Math.min(1, this.progress + 0.2);

      if (this.progress < 1) {
        this.progressChange.emit(this.progress);

        return;
      }

      clearInterval(this.timerId);
      this.loaded.set(true);

      // The next turn of the event loop: the details render their content before the table measures them
      setTimeout(() => this.progressChange.emit(1));
    }, 400);
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"></table-bro-ng>\`,
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
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    rowDetailsComponent: 'bro-cell-details', // your Details-component as a Custom Element

    rowDetailsServer: true,
    rowDetailsProgressMode: 'determinate'
  });

  constructor() {
    // The table creates the details by their tag: the Custom Element is defined before it
    if (!customElements.get('bro-cell-details')) {
      customElements.define('bro-cell-details', createCustomElement(BroCellOrderDetailsComponent, {injector: inject(Injector)}));
    }
  }
}
`}

    ]
  },
  {
    path: 'filtering/toolbar-with-search',
    name: 'Toolbar with Search',
    text: `<!-- table-toolbar-with-search -->
The toolbar starts with the search in every skin. Next to it go your buttons and one menu from \`components.toolbarMain.buttons\`: a button sends its \`eventType\` as the action of the \`bro-action\` event, an item of the menu sends its \`value\`. The tables of this site have the **Filters** button and the menu **More**:

<!-- table-toolbar-with-search code -->
{{toolbar-buttons.ts}}

In the skin mat the menu is an optional element of the skin, which the application adds with \`withToolbarMenu()\`; the skins bs and nv always have it:

{{toolbar-buttons_app.config.ts}}

<!-- table-toolbar-with-search-server -->
#### Toolbar with Search _with server-side data loading_

<!-- toolbar-off -->
#### Without the toolbar or the header

\`toolbar: false\` renders the table without its toolbar, with its title, its search and its buttons. \`header: false\` hides the header of the table, the row of the titles of the columns: the header keeps its place in the DOM, and the widths and the sort of the columns stay as they are.

{{toolbar-off.ts}}`,
    files: [
      {file: 'toolbar-buttons.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroNg}                                                             from '@table-bro/angular';
import {type BroActionDetail, type BroCol, type BroConfig, type BroRow, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                  (action)="onAction($event)"></table-bro-ng>\`,
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
    }
  ]);

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    components: {
      toolbarMain: {
        buttons: [
          // A button sends its eventType; in the mat skin it is an icon with a tooltip
          {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list', buttonTooltip: 'Filters'},
          // A menu: an item sends its value
          {
            buttonTitle: 'More',
            mode: 'navbar-dropdown',
            buttonTooltip: 'Your custom menu',
            options: [
              {value: 'action-1', title: 'Action', iconHTML: 'filter_1'},
              {value: 'action-2', title: 'Another action', iconHTML: 'filter_2'},
              {divider: true},
              {value: 'action-3', title: 'Something else here', iconHTML: 'filter_3'}
            ]
          }
        ]
      }
    }
  });

  onAction({action}: BroActionDetail<Order>) {
    if (action === 'action-1') {
      // your action
    }
  }
}
`},
      {file: 'toolbar-buttons_app.config.ts', language: 'ts', code: `import type {ApplicationConfig} from '@angular/core';

import {provideTableBroMatSkin, withToolbarMenu} from '@table-bro/angular-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTableBroMatSkin(withToolbarMenu())
  ]
};
`},
      {file: 'toolbar-off.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

const config: BroConfig = {
  skin: 'mat',
  toolbar: false, // no toolbar
  header: false // no row of the titles of the columns
};
`}
    ]
  },
  {
    path: 'filtering/custom-user-filters',
    name: 'Custom user filters',
    text: `<!-- table-custom-user-filters code -->
Your controls outside of the table give it their filters, and your rule \`filtersTransform\` filters the rows by them. In Angular the filters go to the input \`filter\` of the table:

{{custom-user-filters.ts}}

In Vanilla JS the page dispatches them to the table:

{{custom-user-filters_vanilla.ts}}

<!-- table-custom-user-filters-server -->
#### Custom user filters _with server-side data loading_`,
    files: [
      {file: 'custom-user-filters.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {MatSlideToggle, type MatSlideToggleChange}  from '@angular/material/slide-toggle';
import {TableBroNg}                                 from '@table-bro/angular';
import type {BroCol, BroConfig, BroFilters, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  price50Plus?: boolean;
}>;

@Component({
  selector: 'app-orders',
  template: \`
    <mat-slide-toggle (change)="onTogglePrice50Plus($event)">Price $50+</mat-slide-toggle>

    <table-bro-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                  [filter]="filter()"></table-bro-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggle,
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

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    // Your rule for the rows by the filters of the input filter
    filtersTransform: (rows: Order[], filters: OrderFilters) => rows.filter(row => !filters.price50Plus || row.price >= 50)
  });

  filter = signal<OrderFilters | undefined>(undefined);

  onTogglePrice50Plus(event: MatSlideToggleChange) {
    this.filter.set({price50Plus: event.checked});
  }
}
`},
      {file: 'custom-user-filters_vanilla.ts', language: 'ts', code: `import {type BroFilters, type BroRow, dispatchAction, events} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  price50Plus?: boolean;
}>;

const table = document.querySelector('table-bro')!;
const price50Plus = document.querySelector<HTMLInputElement>('#price-50-plus')!;

price50Plus.addEventListener('change', () => {
  const filters: OrderFilters = {price50Plus: price50Plus.checked};

  dispatchAction(table, events.filtersFilterEvent, filters);
});
`}
    ]
  },
  {
    path: 'filtering/filter-drawer',
    name: 'Filter Drawer',
    text: `<!-- table-filter-drawer -->
A drawer with your filters slides out next to the table. The filters live outside of the table. With Angular Material, \`‹table-bro-filter-drawer-container-ng›\` renders the table with the inputs of \`‹table-bro-ng›\` and your filters, its content, in a \`mat-drawer\`; the **Filters** button, which you add to the toolbar, opens it. With Bootstrap, Native, and in Vanilla JS, put the table and your filters with \`slot="filters"\` into \`‹table-bro-filter-drawer-container skin="bs"›\`; the **Filters** button opens it too.

Any button of your page opens the drawer with its \`toggle()\`.

<!-- table-filter-drawer code -->
{{filter-drawer.ts}}

<!-- table-filter-drawer-server -->
#### Filter Drawer _with server-side data loading_

In the server mode the table adds the filters of the drawer to its query: the \`bro-filters-server-loaded\` event carries a \`BroQuery\` with them in \`filter\`, together with the search, and with the sort.`,
    files: [
      {file: 'filter-drawer.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

import {TableBroFilterDrawerContainerNg}                                                           from '@table-bro/angular-material';
import {type BroCol, type BroConfig, type BroFilters, type BroRow, events, matchesFilterCondition} from '@table-bro/core';

interface Order extends BroRow {
  description: string;
  price: number;
}

type OrderFilters = BroFilters<Order, {
  priceFrom?: number;
  priceTo?: number;
}>;

// The filters live outside of the table, in mat-drawer next to it. The component renders <table-bro-ng> with its inputs
// and outputs; the Filters button, which you add to the toolbar, opens the drawer; any other button calls its toggle().
// With the bs and nv skins and in Vanilla JS put the table and your filters with slot="filters" into <table-bro-filter-drawer-container skin="bs">
@Component({
  selector: 'app-orders',
  template: \`
    <table-bro-filter-drawer-container-ng [cols]="cols()" [rows]="rows()" [conf]="conf()"
                                          [filter]="filter()">
      <app-order-filters (changeFilter)="filter.set($event)"></app-order-filters>
    </table-bro-filter-drawer-container-ng>\`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableBroFilterDrawerContainerNg
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

  rows = signal<Order[] | undefined>(undefined);

  conf = signal<BroConfig>({
    skin: 'mat',
    components: {
      toolbarMain: {
        buttons: [
          // The button that opens the drawer; in the mat skin it is an icon with a tooltip
          {buttonTitle: 'Filters', eventType: events.filtersToggleEvent, iconHTML: 'filter_list', buttonTooltip: 'Filters'}
        ]
      }
    },
    // Local mode: your rule for the rows. In the server mode the filters come in \`query.filter\` of the load event
    filtersTransform: (rows: Order[], filters: OrderFilters) => rows.filter(row => {
      return matchesFilterCondition(row.price, {gte: filters.priceFrom, lte: filters.priceTo});
    })
  });

  // A cleared filter goes as an empty value: {priceFrom: undefined}
  filter = signal<OrderFilters | undefined>(undefined);
}
`}
    ]
  },
  {
    path: 'filtering/custom-sorting-rules',
    name: 'Custom sorting rules',
    text: `<!-- table-custom-sorting-rules -->
You can specify a \`sortKey\` for each column to control the sorting behavior.

For example, the "Date" column can display a formatted date (model's \`date\`), while sorting is performed based on the model's underlying \`timestamp\` field.

<!-- table-custom-sorting-rules code -->
{{custom-sorting-rules.ts}}

<!-- table-custom-sorting-rules-server -->
#### Custom sorting rules _with server-side data loading_`,
    files: [
      {file: 'custom-sorting-rules.ts', language: 'ts', code: `import type {BroCol, BroRow} from '@table-bro/core';

interface Order extends BroRow {
  date: string; // the formatted date that the column shows
  timestamp: number; // the date that the column sorts by
}

const cols: BroCol<Order>[] = [
  {
    title: 'Date',
    name: 'date',
    sortKey: 'timestamp'
  }
];
`}
    ]
  },
  {
    path: 'frameworks',
    name: 'Frameworks',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`: every framework that renders HTML elements renders it, without a wrapper package. A page gives the table its columns, rows and config by \`configure({cols, rows, conf})\`, listens to its \`bro-action\` events and sets its \`theme\` attribute; each framework does it in its own way. The pages of this section show it in Angular, whose package \`@table-bro/angular\` gives the component \`‹table-bro-ng›\` with inputs and outputs, in Preact, React, Solid, Svelte and Vue, each with a working page of its sample project in the repository and StackBlitz in the Bootstrap skin, and in Vanilla JS, without a framework; a skin of your own design system or UI components works in each of them the same way. How each framework passes data and events to Custom Elements is tested by [Custom Elements Everywhere](https://custom-elements-everywhere.com/).

<!-- polymer -->
#### Polymer and Lit

Polymer and Lit build Custom Elements themselves, so their templates render \`‹table-bro›\` as any HTML element, without a wrapper: the code of the element calls \`configure()\` of the table and listens to its \`bro-action\` events as of any element ([Polymer, Custom element concepts](https://polymer-library.polymer-project.org/3.0/docs/devguide/custom-elements), [Lit, What is Lit?](https://lit.dev/docs/)).`,
    files: []
  },
  {
    path: 'frameworks/angular',
    name: 'Angular data table',
    text: `<!-- intro -->
Table, Bro has its own package for Angular, \`@table-bro/angular\`: the component \`‹table-bro-ng›\` renders the Custom Element \`‹table-bro›\`, gives it the signal inputs \`cols\`, \`rows\` and \`conf\`, and turns its \`bro-action\` events into the outputs \`action\` and \`query\`. It works with the three skins: Angular Material, Vanilla Bootstrap and Vanilla HTML. The page below is the [working page](https://table-bro.com/samples/angular-material) of the sample project \`samples/angular-material\` of the repository, with Angular 22 and Angular Material; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/angular-material) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Angular?

${mcpSection('#####')}

##### Manual setup

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
  },
  {
    path: 'frameworks/preact',
    name: 'Preact data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Preact app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, the prop \`onbro-action\` listens to its events, and the \`theme\` prop sets its theme. The [working page](https://table-bro.com/samples/react-mui/preact) is the sample project \`samples/react-mui/preact\` of the repository, with Preact 11 and the React MUI skin through \`preact/compat\`; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/preact) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/preact\` and Native work in Preact the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Preact?

${mcpSection('#####', 'Preact')}

##### Manual setup

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/react-mui\`, MUI with Emotion, its styles, and Preact. MUI and the skin are components of React, which Preact runs through \`preact/compat\`. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Preact without it, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Run React through preact/compat**

   The aliases of Vite give MUI and the skin \`preact/compat\` in place of React. \`vite.config.ts\`, where \`samplePage\` is the config of the working page; a project of its own exports \`defineConfig()\` with the aliases alone:

   {{vite.config.ts}}

   \`paths\` of \`tsconfig.json\` give their types the ones of \`preact/compat\`, and \`"jsxImportSource": "preact"\` the JSX runtime of Preact:

   {{tsconfig.json}}

3. **Give the skin the theme of the application**

   The MUI theme of the application turns on its CSS variables, which the table reads, and the attribute of its color schemes, which a table with a theme of its own sets. Its light and dark schemes have the colors of the sample of Angular Material, the azure palette of Material 3, so that the table looks as the table of the skin \`mat\`. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`mui\`, and \`setMuiTheme()\` gives its elements the theme. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

4. **Load the fonts of MUI**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

5. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call; Preact renders the elements of the skin at once. Preact adds a listener for an event prop it does not know by the exact name after \`on\`, \`bro-action\` for \`onbro-action\` ([Preact, Web Components](https://preactjs.com/guide/v10/web-components/)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}


#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Preact, with the methods of \`TableBroHTMLElement\` and the prop \`onbro-action\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of MUI, which writes the CSS variables of the theme, with \`CssBaseline\`. \`defaultMode="light"\` keeps the page light, as the page of the sample of Angular Material; the table takes the color scheme of the system by its theme:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-mui-color-scheme\` of the MUI theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Preact need a wrapper for Custom Elements?

No. Preact passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Its package \`preact-custom-element\` also turns a Preact component into a Custom Element ([Preact, preact-custom-element](https://preactjs.com/guide/v10/preact-custom-element/)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does preact/compat change it?

\`‹table-bro›\` is an element of the DOM, the same in Preact and in React. \`preact/compat\` runs MUI and the skin, which are components of React.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
    files: [
      mcpInstall,
      {...muiInstall, code: muiInstall.code.replace('\n', ' preact\n')},
      {file: 'vite.config.ts', language: 'ts', code: `import {samplePage} from './sample-page.config.ts';

// MUI and the skin import React: preact/compat takes its place
export default {
  ...samplePage,
  resolve: {
    alias: {
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      react: 'preact/compat'
    }
  }
};
`},
      {file: 'tsconfig.json', language: 'json', code: `{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    /* The types of MUI and of the skin take the ones of React from preact/compat */
    "paths": {
      "react": ["./node_modules/preact/compat"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"],
      "react-dom": ["./node_modules/preact/compat"],
      "react-dom/client": ["./node_modules/preact/compat/client"]
    },

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`},
      muiTheme,
      muiSkin,
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Preact MUI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`},
      muiOrders,
      {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of Preact, with its attribute theme and its event bro-action
import type {HTMLAttributes} from 'preact';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'; 'onbro-action'?: (event: CustomEvent<BroActionDetail>) => void};
    }
  }
}
`},
      {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {useEffect, useRef} from 'preact/hooks';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    table.current!.configure({cols, rows, conf});
  }, []);

  return (
    <div class="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"
                 onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
      {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {render}        from 'preact';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

// The page is light, as the page of the sample of Angular Material; the table takes the scheme of the system by its
// theme
render(
  <ThemeProvider theme={theme} defaultMode="light">
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>,
  document.getElementById('app')!
);
`}
    ]
  },
  {
    path: 'frameworks/react',
    name: 'React data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a React 19 app renders it in JSX as it is, without a wrapper package. A ref gives the element its columns, rows and config by \`configure()\`, an effect adds the listener of its \`bro-action\` events, and the \`theme\` prop sets its theme. The [working page](https://table-bro.com/samples/react-mui/react) is the sample project \`samples/react-mui/react\` of the repository, with React 19.3 and the React MUI skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/react) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/react\` and Native work in React the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in React?

${mcpSection('#####', 'React')}

##### Manual setup

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/react-mui\`, and MUI with Emotion, its styles. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in React the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the theme of the application**

   The MUI theme of the application turns on its CSS variables, which the table reads, and the attribute of its color schemes, which a table with a theme of its own sets. Its light and dark schemes have the colors of the sample of Angular Material, the azure palette of Material 3, so that the table looks as the table of the skin \`mat\`. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`mui\`, and \`setMuiTheme()\` gives its elements the theme. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of MUI**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [Next.js](https://table-bro.com/docs/ssr/nextjs) come after these: a server component prerenders the table in its loading state in the markup of MUI.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call after the first render, through \`queueMicrotask()\`: the elements of the skin render by \`flushSync\` of React, which waits for the end of the effects, and the table measures them right after it renders them. The same effect adds the listener of \`bro-action\` and removes it at the end; the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

React 19 sets a prop of a custom element as a property when the element has a property of that name, and as an attribute otherwise ([React 19, Support for Custom Elements](https://react.dev/blog/2024/12/05/react-19)): \`theme\` is a property of \`‹table-bro›\`. \`"jsx": "react-jsx"\` in \`tsconfig.json\` of the sample gives the JSX runtime of React to TypeScript and to Vite.

#### How does TypeScript know the element?

JSX of React knows the HTML elements only; a declaration adds \`‹table-bro›\` with the methods of \`TableBroHTMLElement\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of MUI, which writes the CSS variables of the theme, with \`CssBaseline\`. \`defaultMode="light"\` keeps the page light, as the page of the sample of Angular Material; the table takes the color scheme of the system by its theme:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-mui-color-scheme\` of the MUI theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does React 19 need a wrapper for Custom Elements?

No. React 19 passes the props of a custom element as properties or attributes ([React, Custom HTML elements](https://react.dev/reference/react-dom/components#custom-html-elements)) and passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Table, Bro takes its data by \`configure()\` through a ref, which works in every version of React.

##### Can I listen to bro-action without a ref?

The sample uses \`addEventListener\` in an effect: it works in React 18 and 19 and removes the listener on unmount.

##### Does it work with Next.js?

Yes. The table renders in the browser, as \`configure()\` runs in an effect of a client component (\`'use client'\`), and the server render of Next.js prerenders it in its loading state in the markup of MUI: [Next.js](https://table-bro.com/docs/ssr/nextjs).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Next.js](https://table-bro.com/docs/ssr/nextjs), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
    files: [
      mcpInstall,
      muiInstall,
      muiTheme,
      muiSkin,
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + React MUI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`},
      muiOrders,
      {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of React, with its attribute theme
import type {DetailedHTMLProps, HTMLAttributes} from 'react';

import type {TableBroHTMLElement} from '@table-bro/core';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': DetailedHTMLProps<HTMLAttributes<TableBroHTMLElement>, TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }
  }
}
`},
      {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    // The elements of the skin render by flushSync of React, which waits for the end of the effects: the table
    // renders after them, and measures its elements rendered
    queueMicrotask(() => element.configure({cols, rows, conf}));
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"></table-bro>
    </div>
  );
}
`},
      {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {StrictMode}    from 'react';
import {createRoot}    from 'react-dom/client';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

// The page is light, as the page of the sample of Angular Material; the table takes the scheme of the system by its
// theme
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <OrdersTable />
    </ThemeProvider>
  </StrictMode>
);
`}
    ]
  },
  {
    path: 'frameworks/solid',
    name: 'Solid data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Solid app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, \`on:bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/solid-suid/solid) is the sample project \`samples/solid-suid/solid\` of the repository, with Solid 1.9 and the Solid SUID skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/solid-suid/solid) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/solid\` and Native work in Solid the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Solid?

${mcpSection('#####', 'Solid')}

##### Manual setup

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/solid-suid\`, and SUID, which supports Solid 1. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Solid the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the theme of the application**

   The SUID theme of the application takes the palette of the color scheme of the system, and follows it when it changes. Its palettes have the colors of the sample of Angular Material, the azure palette of Material 3, and the font Roboto, so that the table looks as the table of the skin \`mat\`; the page stays light, as the page of that sample. \`src/theme.ts\`:

   {{src/theme.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`suid\`, and \`setSuidTheme()\` gives its elements the theme and writes the CSS variables of the theme that the table reads. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of SUID**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [SolidStart](https://table-bro.com/docs/ssr/solidstart) come after these: the server entry prerenders the table in its loading state in the markup of SUID.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`ref\` gives the element ([Solid, ref](https://docs.solidjs.com/reference/jsx-attributes/ref)), \`onMount\` makes the call: Solid renders the elements of the skin at once, also inside its effects, so the table measures them rendered. \`on:bro-action\` adds the listener of the event by its exact name ([Solid, on:*](https://docs.solidjs.com/reference/jsx-attributes/on)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

\`vite-plugin-solid\` compiles the JSX of Solid and the components of SUID, which SUID publishes as JSX, and \`"jsx": "preserve"\` with \`"jsxImportSource": "solid-js"\` in \`tsconfig.json\` gives its types to TypeScript. \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Solid, with the methods of \`TableBroHTMLElement\`, and \`bro-action\` to its events of \`on:\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables, and renders them in \`ThemeProvider\` of SUID with \`CssBaseline\`:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Solid need a wrapper for Custom Elements?

No. Solid passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); \`on:\` listens to an event by its exact name, as \`bro-action\`. Its package \`solid-element\` also turns a Solid component into a Custom Element ([Solid, solid-element](https://www.npmjs.com/package/solid-element)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref, as in an effect of a signal of the rows.

##### Does it work with SolidStart?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMount\`, and the server render of SolidStart prerenders it in its loading state in the markup of SUID, with the server entry of the skin: [SolidStart](https://table-bro.com/docs/ssr/solidstart).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [SolidStart](https://table-bro.com/docs/ssr/solidstart), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
    files: [
      mcpInstall,
      suidInstall,
      {file: 'src/theme.ts', language: 'ts', code: `import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the azure
// palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the surface
// as the background of the table, the outline as the borders of the rows and the outline of the chips, and the font
// Roboto. The page stays light, as the page of that sample, and the table follows the color scheme of the system:
// the palette follows a change of the scheme, and the components of SUID and the table take it
const scheme = window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme.matches);

scheme.addEventListener('change', event => setDark(event.matches));

const lightPalette = {
  mode: 'light' as const,
  primary: {main: '#005cbb'},
  text: {primary: '#1a1b1f', secondary: '#44474e', disabled: 'rgba(26, 27, 31, 0.38)'},
  divider: '#74777f',
  background: {default: '#faf9fd', paper: '#faf9fd'},
  action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)', disabledOpacity: 0.38},
  grey: {400: '#74777f'}
};

// The dark scheme keeps the light background of the page, which CssBaseline gives the body
const darkPalette = {
  mode: 'dark' as const,
  primary: {main: '#abc7ff'},
  text: {primary: '#e3e2e6', secondary: '#e0e2ec', disabled: 'rgba(227, 226, 230, 0.38)'},
  divider: '#8e9099',
  background: {default: '#faf9fd', paper: '#121316'},
  action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)', disabledOpacity: 0.38},
  grey: {700: '#8e9099'}
};

const palette = createRoot(() => createMemo(() => createPalette(dark() ? darkPalette : lightPalette)));

export const theme = createTheme({palette, typography: {fontFamily: 'Roboto'}});
`},
      {file: 'src/skin.ts', language: 'ts', code: `// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin suid, and
// setSuidTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/solid-suid/dist/table-bro.solid-suid.min.css';
import {setSuidTheme} from '@table-bro/solid-suid';

import {theme} from './theme';

import './sample-page.css';

setSuidTheme(theme);
`},
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Solid SUID</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`},
      {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
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

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
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
];

export const conf: BroConfig = {
  skin: 'suid',
  toolbarTitle: 'Orders'
};
`},
      {file: 'vite.config.ts', language: 'ts', code: `import {defineConfig, mergeConfig} from 'vite';
import solid                       from 'vite-plugin-solid';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    solid()
  ]
}));
`},
      {file: 'src/elements.d.ts', language: 'ts', code: `// The element <table-bro> in the JSX of Solid, with its attribute theme and its event bro-action for on:bro-action
import type {JSX as SolidJSX} from 'solid-js';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'table-bro': SolidJSX.HTMLAttributes<TableBroHTMLElement> & {theme?: 'light' | 'dark' | 'auto'};
    }

    interface CustomEvents {
      'bro-action': CustomEvent<BroActionDetail>;
    }
  }
}
`},
      {file: 'src/OrdersTable.tsx', language: 'tsx', code: `import {onMount} from 'solid-js';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

export function OrdersTable() {
  let table!: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro id="orders" ref={table} theme="auto"
                 on:bro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
      {file: 'src/main.tsx', language: 'tsx', code: `// The skin is registered before the tables
import './skin';

import CssBaseline     from '@suid/material/CssBaseline';
import {ThemeProvider} from '@suid/material/styles';
import {render}        from 'solid-js/web';

import {OrdersTable} from './OrdersTable';
import {theme}       from './theme';

render(() => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <OrdersTable />
  </ThemeProvider>
), document.getElementById('app')!);
`}
    ]
  },
  {
    path: 'frameworks/svelte',
    name: 'Svelte data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Svelte 5 app renders it in markup as it is. \`bind:this\` gives the element its columns, rows and config by \`configure()\`, the attribute \`onbro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/svelte-m3/svelte) is the sample project \`samples/svelte-m3/svelte\` of the repository, with Svelte 5.58 and the Svelte M3 skin on the components of [M3 Svelte](https://github.com/KTibow/m3-svelte), Material 3 for Svelte; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/svelte-m3/svelte) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/svelte\` and Native work in Svelte the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Svelte?

${mcpSection('#####', 'Svelte')}

##### Manual setup

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/svelte-m3\`, M3 Svelte, and the plugin of Vite that compiles the CSS of its components. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Svelte the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Compile M3 Svelte**

   M3 Svelte publishes its components as their sources: Vite compiles them with the plugin of Svelte, and the CSS of their styles with \`vite-plugin-functions-mixins\`. \`vite.config.ts\`, where \`samplePage\` is the config of the working page; a project of its own exports \`defineConfig()\` with the plugins:

   {{vite.config.ts}}

   The plugin names Vite 7 as its peer dependency and works with Vite 8: the \`package.json\` of the sample lets npm install it by \`"overrides": {"vite-plugin-functions-mixins": {"vite": "$vite"}}\`.

3. **Give the skin the theme of the application**

   The table and the components of M3 Svelte read the colors of the M3 Svelte theme of the application, its CSS variables \`--m3c-*\`. The theme imports the styles of M3 Svelte and has the function \`--m3-density\` and the colors of the light and the dark scheme, as the theme page of M3 Svelte writes them; the sample takes the colors of the sample of Angular Material, the azure palette of Angular Material in the roles of M3 Svelte, with its font Roboto in a light page, so that both tables look the same. \`src/theme.css\`:

   {{src/theme.css}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`m3-svelte\`. The CSS of the theme, of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) takes. \`src/skin.ts\`:

   {{src/skin.ts}}

4. **Load the fonts**

   Roboto and the icons of Material Symbols, which the skin shows by their names, come from Google Fonts. \`index.html\`:

   {{index.html}}

5. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

With server-side rendering, the steps of [SvelteKit](https://table-bro.com/docs/ssr/sveltekit) come after these: the load of the page prerenders the table in its loading state in the markup of M3 Svelte.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`bind:this\` gives the element ([Svelte, bind:this](https://svelte.dev/docs/svelte/bind)), \`onMount\` makes the call ([Svelte, Lifecycle hooks](https://svelte.dev/docs/svelte/lifecycle-hooks)). The elements of the skin render at once there: \`mount()\` of Svelte renders a component synchronously, and an element renders a change by \`flushSync()\`, since the table measures them right after it renders them. An attribute that starts with \`on\` adds a listener of the event of its name, \`bro-action\` for \`onbro-action\` ([Svelte, Events](https://svelte.dev/docs/svelte/basic-markup)); the sample logs the name of each action. \`src/OrdersTable.svelte\`:

{{src/OrdersTable.svelte}}

#### How do I render it?

\`src/main.ts\` imports the skin before the tables:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, which gives it the dark or the light scheme of the colors of the M3 Svelte theme. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Svelte need a wrapper for Custom Elements?

No. Svelte passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Svelte also compiles its own components into Custom Elements ([Svelte, Custom elements](https://svelte.dev/docs/svelte/custom-elements)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same element.

##### Does it work with SvelteKit?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMount\`, and the server render of SvelteKit prerenders it in its loading state in the markup of M3 Svelte, with the server entry of the skin: [SvelteKit](https://table-bro.com/docs/ssr/sveltekit).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [SvelteKit](https://table-bro.com/docs/ssr/sveltekit), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
    files: [
      mcpInstall,
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/svelte-m3 m3-svelte
npm install -D vite-plugin-functions-mixins
`},
      {file: 'vite.config.ts', language: 'ts', code: `import {svelte}                    from '@sveltejs/vite-plugin-svelte';
import {defineConfig, mergeConfig} from 'vite';
import {functionsMixins}           from 'vite-plugin-functions-mixins';

import {samplePage} from './sample-page.config.ts';

// M3 Svelte publishes its components as their sources: Svelte compiles them, and the plugin of M3 Svelte the mixins and
// the functions of their CSS
export default mergeConfig(samplePage, defineConfig({
  plugins: [
    svelte(),
    functionsMixins({deps: ['m3-svelte']})
  ]
}));
`},
      {file: 'src/theme.css', language: 'css', code: `/*
 * The theme of M3 Svelte of the application in the colors, the type and the color scheme of the sample
 * samples/angular-material, so that the table looks as the table of that sample: the styles of M3 Svelte, the density
 * of its components, the color roles of the theme of Angular Material with the azure palette and the blue tertiary
 * palette, light and dark by light-dark(), in a light page, and the font Roboto. The roles of M3 Svelte that Material 3
 * has not, the dim, the subtle and the on-on-primary colors, are the ones that genCSS() of m3-svelte/etc/colors writes
 * for the Vibrant scheme of the azure primary color #005cbb. The components of M3 Svelte and the skin m3-svelte read
 * them.
 */
@import "m3-svelte/etc/styles.css";
@import "m3-svelte/etc/recommended-styles.css";

@function --m3-density(--size) {
  result: var(--size);
}

:root {
  @apply --m3-body-medium;
  color-scheme: light;
  background-color: var(--m3c-surface);
  color: var(--m3c-on-surface);
}

/*
 * The tables of the skin, the elements with the class m3-svelte, take the colors of their own color scheme, as the light
 * page has a table in the dark scheme of the system: the build lowers light-dark() into variables of the color scheme of
 * each element, which a color role reads where it is declared
 */
@layer tokens {
  :root,
  .m3-svelte {
    --m3-font: Roboto, sans-serif;

    --m3c-surface: light-dark(#faf9fd, #121316);
    --m3c-surface-dim: light-dark(#dbd9dd, #121316);
    --m3c-surface-bright: light-dark(#faf9fd, #38393c);
    --m3c-surface-container-lowest: light-dark(#ffffff, #0d0e11);
    --m3c-surface-container-low: light-dark(#f4f3f6, #1a1b1f);
    --m3c-surface-container: light-dark(#efedf0, #1f2022);
    --m3c-surface-container-high: light-dark(#e9e7eb, #292a2c);
    --m3c-surface-container-highest: light-dark(#e3e2e6, #343537);
    --m3c-on-surface: light-dark(#1a1b1f, #e3e2e6);
    --m3c-on-surface-variant: light-dark(#44474e, #e0e2ec);
    --m3c-outline: light-dark(#74777f, #8e9099);
    --m3c-outline-variant: light-dark(#c4c6d0, #44474e);
    --m3c-inverse-surface: light-dark(#2f3033, #e3e2e6);
    --m3c-inverse-on-surface: light-dark(#f2f0f4, #2f3033);
    --m3c-primary: light-dark(#005cbb, #abc7ff);
    --m3c-primary-dim: light-dark(#0050a5, #4490ff);
    --m3c-on-primary: light-dark(#ffffff, #002f65);
    --m3c-primary-container: light-dark(#d7e3ff, #00458f);
    --m3c-on-primary-container: light-dark(#00458f, #d7e3ff);
    --m3c-primary-fixed: #d7e3ff;
    --m3c-primary-fixed-dim: #abc7ff;
    --m3c-on-primary-fixed: #001b3f;
    --m3c-on-primary-fixed-variant: #00458f;
    --m3c-inverse-primary: light-dark(#abc7ff, #005cbb);
    --m3c-secondary: light-dark(#565e71, #bec6dc);
    --m3c-secondary-dim: light-dark(#4c5071, #d4d7ff);
    --m3c-on-secondary: light-dark(#ffffff, #283041);
    --m3c-secondary-container: light-dark(#dae2f9, #3e4759);
    --m3c-on-secondary-container: light-dark(#3e4759, #dae2f9);
    --m3c-secondary-fixed: #dae2f9;
    --m3c-secondary-fixed-dim: #bec6dc;
    --m3c-on-secondary-fixed: #131c2b;
    --m3c-on-secondary-fixed-variant: #3e4759;
    --m3c-tertiary: light-dark(#343dff, #bec2ff);
    --m3c-tertiary-dim: light-dark(#544c7d, #cdc2fb);
    --m3c-on-tertiary: light-dark(#ffffff, #0001ac);
    --m3c-tertiary-container: light-dark(#e0e0ff, #0000ef);
    --m3c-on-tertiary-container: light-dark(#0000ef, #e0e0ff);
    --m3c-tertiary-fixed: #e0e0ff;
    --m3c-tertiary-fixed-dim: #bec2ff;
    --m3c-on-tertiary-fixed: #00006e;
    --m3c-on-tertiary-fixed-variant: #0000ef;
    --m3c-error: light-dark(#ba1a1a, #ffb4ab);
    --m3c-error-dim: light-dark(#a80710, #ff554a);
    --m3c-on-error: light-dark(#ffffff, #690005);
    --m3c-error-container: light-dark(#ffdad6, #93000a);
    --m3c-on-error-container: light-dark(#93000a, #ffdad6);
    --m3c-shadow: #000000;
    --m3c-scrim: #000000;
    --m3c-on-on-primary: light-dark(#0060c2, #85b1ff);
    --m3c-primary-container-subtle: light-dark(#cadaff, #003876);
    --m3c-on-primary-container-subtle: light-dark(#004b9a, #9abdff);
    --m3c-secondary-container-subtle: light-dark(#d4d7ff, #323756);
    --m3c-on-secondary-container-subtle: light-dark(#464b6b, #b6bae0);
    --m3c-tertiary-container-subtle: light-dark(#ddd5ff, #3a3261);
    --m3c-on-tertiary-container-subtle: light-dark(#4e4676, #bfb5ed);
    --m3c-error-container-subtle: light-dark(#ffcfc9, #790006);
    --m3c-on-error-container-subtle: light-dark(#9e000b, #ffa49a);
  }
}
`},
      {file: 'src/skin.ts', language: 'ts', code: `// The theme of M3 Svelte, the CSS of the core and of the skin, then the skin: its import defines <table-bro> and
// registers the skin m3-svelte, whose elements render the components of M3 Svelte in the theme of the application
import './theme.css';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/svelte-m3/dist/table-bro.svelte-m3.min.css';
import '@table-bro/svelte-m3';

import './sample-page.css';
`},
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Svelte M3</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`},
      {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
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

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
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
];

export const conf: BroConfig = {
  skin: 'm3-svelte',
  toolbarTitle: 'Orders'
};
`},
      {file: 'src/OrdersTable.svelte', language: 'svelte', code: `<script lang="ts">
  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from './orders';

  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro id="orders" bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
</div>
`},
      {file: 'src/main.ts', language: 'ts', code: `// The skin is registered before the tables
import './skin';

import {mount} from 'svelte';

import OrdersTable from './OrdersTable.svelte';

mount(OrdersTable, {target: document.getElementById('app')!});
`}
    ]
  },
  {
    path: 'frameworks/vue',
    name: 'Vue 3 data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Vue 3 app renders it in a template once the compiler knows the tag: \`compilerOptions.isCustomElement\` of \`@vitejs/plugin-vue\`. A template ref gives the element its columns, rows and config by \`configure()\`, \`@bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The [working page](https://table-bro.com/samples/vue-vuetify/vue) is the sample project \`samples/vue-vuetify/vue\` of the repository, with Vue 3.5 and the Vue Vuetify skin; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/vue-vuetify/vue) opens it in the browser, and the setup below is its code. The Bootstrap skin of the sample project \`samples/frameworks/vue\` and Native work in Vue the same way, as a skin of your own UI components does.

<!-- setup -->
#### How do I install Table, Bro in Vue?

${mcpSection('#####', 'Vue')}

##### Manual setup

1. **Install the packages**

   The table engine \`@table-bro/core\`, the skin \`@table-bro/vue-vuetify\`, and Vuetify. The skins \`@table-bro/bootstrap\` and \`@table-bro/native\` work in Vue the same way, as [Getting started](https://table-bro.com/docs/getting-started) shows:

   {{install.sh}}

2. **Give the skin the Vuetify of the application**

   The Vuetify of the application, with the blueprint of Material 3: its themes, in the azure palette of Material 3 of the sample of Angular Material, give the colors to the table, light or dark as the system, so that the table looks as the table of the skin \`mat\` on the light page of that sample, and the icon set \`md\` of Vuetify gives its components the ligatures of Material Icons, which the skin shows too. \`src/vuetify.ts\`:

   {{src/vuetify.ts}}

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`vuetify\`, and \`setVuetify()\` gives its elements the instance of Vuetify. The CSS of Vuetify, of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Load the fonts of Material**

   Roboto and the ligature icons of Material, which the skin shows, come from Google Fonts. \`index.html\`:

   {{index.html}}

4. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I tell Vue that table-bro is a Custom Element?

Without it, Vue resolves \`‹table-bro›\` as a component of the app and warns that it fails. \`isCustomElement\` of the template compiler skips the tags of Table, Bro ([Vue, Using Custom Elements in Vue](https://vuejs.org/guide/extras/web-components.html)). \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

With server-side rendering, the steps of [Nuxt](https://table-bro.com/docs/ssr/nuxt) come after these: a component prerenders the table in its loading state in the markup of Vuetify.

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`useTemplateRef\` gives the element, \`onMounted\` makes the call. The elements of the skin render by \`render()\` of Vue, which patches them before it returns, so the table measures them rendered. \`@bro-action\` adds the listener of the event, which logs the name of each action, and \`theme\` sets the theme; a binding \`:theme\` goes to the property \`theme\` of the element, since Vue sets a binding of a custom element as a property when the element has it. \`src/OrdersTable.vue\`:

{{src/OrdersTable.vue}}

#### How do I render it?

\`src/App.vue\` renders the table in \`VApp\` of Vuetify, which gives the page the background of the theme:

{{src/App.vue}}

\`src/main.ts\` imports the skin before the tables, and installs Vuetify in the app:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and the attribute \`data-vuetify-theme\`, which gives it the theme of Vuetify of that name. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Vue need a wrapper for Custom Elements?

No. Vue passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); it only needs \`isCustomElement\` for the tags of Table, Bro.

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does it work with Nuxt?

Yes. The table renders in the browser, as \`configure()\` runs in \`onMounted()\`, and the server render of Nuxt prerenders it in its loading state in the markup of Vuetify: [Nuxt](https://table-bro.com/docs/ssr/nuxt).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Nuxt](https://table-bro.com/docs/ssr/nuxt), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla).`,
    files: [
      mcpInstall,
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/vue-vuetify vuetify
`},
      {file: 'src/vuetify.ts', language: 'ts', code: `import {createVuetify, type ThemeDefinition} from 'vuetify';
import {md3}                                 from 'vuetify/blueprints';
import {aliases, md}                         from 'vuetify/iconsets/md';

// The light theme of the sample of Angular Material, its azure palette, in the colors of Vuetify: the system tokens of
// mat of the same roles. The light surface of Vuetify is the surface variant of Material, the surface variant of
// Vuetify its inverse surface, the background of the tooltips. The text of the high emphasis is the on-surface of mat,
// opaque, and the medium emphasis gives its on-surface-variant on the surface; the border is the outline of the rows of
// mat, and the state layers have the opacities of mat
const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAF9FD',
    'on-background': '#1A1B1F',
    primary: '#005CBB',
    'on-primary': '#FFFFFF',
    secondary: '#565E71',
    'on-secondary': '#FFFFFF',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    surface: '#FAF9FD',
    'on-surface': '#1A1B1F',
    'surface-light': '#E0E2EC',
    'surface-variant': '#2F3033',
    'on-surface-variant': '#F2F0F4'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.8,
    'disabled-opacity': 0.38,
    'border-color': '#74777F',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The dark theme of the same palette, which the table takes in a dark system by its theme auto, as the table of the
// sample of Angular Material takes the dark tokens of mat there
const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121316',
    'on-background': '#E3E2E6',
    primary: '#ABC7FF',
    'on-primary': '#002F65',
    secondary: '#BEC6DC',
    'on-secondary': '#283041',
    error: '#FFB4AB',
    'on-error': '#690005',
    surface: '#121316',
    'on-surface': '#E3E2E6',
    'surface-light': '#44474E',
    'surface-variant': '#E3E2E6',
    'on-surface-variant': '#2F3033'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 1,
    'disabled-opacity': 0.38,
    'border-color': '#8E9099',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The Vuetify of the application, with the blueprint of Material 3: its themes give the colors to the table, on the
// light page of the sample of Angular Material, and its defaults the look of the components in it. Its icons are the
// ligatures of Material Icons, the font of the page, as the arrow of the select of the page size
export const vuetify = createVuetify({
  blueprint: md3,
  icons: {defaultSet: 'md', aliases, sets: {md}},
  theme: {defaultTheme: 'light', themes: {light, dark}}
});
`},
      {file: 'src/skin.ts', language: 'ts', code: `// The CSS of Vuetify, of the core and of the skin, then the skin: its import defines <table-bro> and registers the
// skin vuetify, and setVuetify() gives its elements the Vuetify of the application
import 'vuetify/styles';
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css';
import {setVuetify} from '@table-bro/vue-vuetify';

import {vuetify} from './vuetify';

import './sample-page.css';

setVuetify(vuetify);
`},
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Vue Vuetify</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`},
      {file: 'src/orders.ts', language: 'ts', code: `import type {BroCol, BroConfig, BroRow} from '@table-bro/core';

export interface Order extends BroRow {
  description: string;
  price: number;
}

export const cols: BroCol<Order>[] = [
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

// The orders of the demos of Docs on table-bro.com
export const rows: Order[] = [
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
];

export const conf: BroConfig = {
  skin: 'vuetify',
  toolbarTitle: 'Orders'
};
`},
      {file: 'vite.config.ts', language: 'ts', code: `import vue                         from '@vitejs/plugin-vue';
import {defineConfig, mergeConfig} from 'vite';

import {samplePage} from './sample-page.config.ts';

export default mergeConfig(samplePage, defineConfig({
  plugins: [
    // Vue compiles <table-bro> of its templates as a Custom Element, not as a component of Vue
    vue({template: {compilerOptions: {isCustomElement: tag => tag.startsWith('table-bro')}}})
  ]
}));
`},
      {file: 'src/OrdersTable.vue', language: 'vue', code: `<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

const table = useTemplateRef<TableBroHTMLElement>('table');

// The elements of the skin render by render() of Vue, which patches them at once: the table measures them rendered
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro id="orders" ref="table" theme="auto" @bro-action="onAction"></table-bro>
  </div>
</template>
`},
      {file: 'src/App.vue', language: 'vue', code: `<script setup lang="ts">
import {VApp} from 'vuetify/components/VApp';

import OrdersTable from './OrdersTable.vue';
</script>

<template>
  <VApp>
    <OrdersTable />
  </VApp>
</template>
`},
      {file: 'src/main.ts', language: 'ts', code: `// The skin is registered before the tables
import './skin';

import {createApp} from 'vue';

import App       from './App.vue';
import {vuetify} from './vuetify';

createApp(App).use(vuetify).mount('#app');
`}
    ]
  },
  {
    path: 'frameworks/vanilla',
    name: 'Vanilla JS data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a page without a framework creates it as any HTML element: \`configure()\` gives it its columns, rows and config, \`addEventListener()\` listens to its \`bro-action\` events, and the \`theme\` attribute sets its theme. Two skins need no framework: Vanilla Bootstrap, the table on the classes and the components of Bootstrap 5, and Vanilla HTML, plain HTML elements, the reference skin to start your own from. The [working page](https://table-bro.com/samples/bootstrap) is the sample project \`samples/bootstrap\` of the repository, built by Vite, and the [working page of Vanilla HTML](https://table-bro.com/samples/native) is \`samples/native\`; a page without a build takes the same packages from a CDN.

<!-- setup -->
#### How do I install Table, Bro in Vanilla JS?

${mcpSection('#####')}

##### Manual setup

The steps of each skin; the code of the table is the same in both.

###### Vanilla Bootstrap

[See a working page](https://table-bro.com/samples/bootstrap)

${setupBs.text}

###### Vanilla HTML

[See a working page](https://table-bro.com/samples/native)

${setupNv.text}

With server-side rendering, the steps of [Prerender function](https://table-bro.com/docs/ssr/prerendering) come after these: \`prerenderTableBro()\` renders the table in its loading state into a server DOM.

##### Without a build

[See a working page](https://table-bro.com/samples/no-build), [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/no-build)

A page without a bundler takes the same packages from [jsDelivr](https://www.jsdelivr.com/), the CDN of npm, at an exact version: the CSS by \`‹link›\`, the modules by an import map, which gives \`@table-bro/core\` to the skin and \`@popperjs/core\` to Bootstrap ([MDN, importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)). \`index.html\`:

{{index.html}}

\`app.js\` imports the skin, gives it the \`Dropdown\` and the \`Tooltip\` of Bootstrap, and gives the table its columns, rows and config:

{{app.js}}

${skinsSection}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`. New rows go by \`replaceRows(rows)\`, and \`conf.skin\` names the registered skin. \`src/main.ts\` of the sample imports the skin before the table, and \`src/orders.ts\` renders the table:

{{src/orders.ts}}

#### How do I listen to bro-action?

\`bro-action\` is a \`CustomEvent\` of the table, whose \`detail\` is a \`BroActionDetail\`: custom cells, the toolbar, the paginator. \`table.addEventListener('bro-action', event => console.log(event.detail.action))\` logs the name of each action ([MDN, CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)).

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`, \`'auto'\` by default. \`table.setAttribute('theme', 'dark')\` switches it, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself, and \`data-bs-theme\` of Bootstrap in the skin \`bs\`. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does it need a framework?

No. \`‹table-bro›\` is a Custom Element, a part of the HTML standard that every browser supports ([MDN, Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)); the pages of [Frameworks](https://table-bro.com/docs/frameworks) render the same element in their templates.

##### Does it work with server-side rendering?

Yes. The table renders in the browser, and \`prerenderTableBro()\` renders it on the server in its loading state into a server DOM, with the elements of the skins \`bs\` and \`nv\`: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      mcpInstall,
      ...setupBs.files,
      ...setupNv.files,
      noBuildIndex,
      noBuildApp,
      vanillaOrders
    ]
  },
  {
    path: 'ssr',
    name: 'Server-side rendering',
    text: `<!-- intro -->
A page that a server renders shows the table before any script runs: the prerender renders the table in its loading state, with the toolbar, the column headers, the loading row and the paginator in the markup of its skin, and the table takes its place on the page at once, without a layout shift. In the browser the table renders with its rows in the same element. The pages of this section show it in Angular SSR, where \`‹table-bro-ng›\` prerenders the table itself, and in Next.js, SolidStart, SvelteKit and Nuxt, where \`prerenderTableBro()\` renders it into a server DOM with the elements of the skin of the framework, each with the steps of its sample project in the repository and a working page. Prerender function shows \`prerenderTableBro()\` on any server with a DOM, and the limits of the prerender.`,
    files: []
  },
  {
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
  },
  {
    path: 'ssr/nextjs',
    name: 'Next.js',
    text: `<!-- intro -->
Next.js renders a page on the server, or at the build of a static export: a server component prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and a client component renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in an effect. The skin \`mui\` renders the components of MUI there with its server entry, \`@table-bro/react-mui/server\`, and the styles of Emotion in their markup. The steps are the ones of the sample project \`samples/react-mui/next\` of the repository, a static export with Next.js 16: its [working page](https://table-bro.com/samples/react-mui/next/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/react-mui/next) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Next.js?

1. **Install the packages**

   The table and the skin, MUI with Emotion and its adapter for the App Router of Next.js, the server DOM, and \`server-only\`, which keeps the prerender out of the bundle of the browser:

   {{install.sh}}

2. **Keep the packages of the table out of the server bundle**

   The server entry of the skin renders by \`react-dom/server\`, which the server components of Next.js do not bundle: \`serverExternalPackages\` lets Node take the packages of the table as they are. The sample also exports static pages into \`dist\` under the base path of its working page. \`next.config.ts\`:

   {{next.config.ts}}

3. **Prerender the table**

   The server DOM gives its \`HTMLElement\` to the global scope before the import of the skin, as its elements extend it. The prerender takes the columns and the config of \`configure()\` and the theme of the application; the rows wait for the browser. \`src/prerender-table.ts\`:

   {{src/prerender-table.ts}}

4. **Render the table in the page**

   The page, a server component, prerenders the table and gives it to the client component of the table. \`src/app/page.tsx\`:

   {{src/app/page.tsx}}

   The client component renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of React keeps, and \`configure()\` renders the table with its rows in its place. \`src/OrdersTable.tsx\`:

   {{src/OrdersTable.tsx}}

5. **Give the application its theme and the CSS of the table**

   \`InitColorSchemeScript\` sets the color scheme before the page shows, light as the page of the sample of Angular Material, and the provider of MUI for the App Router gives the styles of Emotion of the server render to the page. \`src/app/layout.tsx\`:

   {{src/app/layout.tsx}}

   \`src/app/Providers.tsx\`, whose \`defaultMode="light"\` keeps the page light; the table takes the color scheme of the system by its theme:

   {{src/app/Providers.tsx}}

   The CSS of the core and of the skin come by \`src/app/globals.css\`:

   {{src/app/globals.css}}

\`src/theme.ts\`, \`src/skin.ts\`, \`src/orders.ts\` and \`src/elements.d.ts\` are the ones of [React data table](https://table-bro.com/docs/frameworks/react).

#### Related

[React data table](https://table-bro.com/docs/frameworks/react), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
    files: [
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/react-mui @mui/material @mui/material-nextjs @emotion/react @emotion/styled @emotion/cache linkedom server-only
`},
      {file: 'next.config.ts', language: 'ts', code: `import type {NextConfig} from 'next';

// A static export: the build renders the page with its prerendered table. The server entry of the skin renders the
// components of MUI by react-dom/server, so Node takes it and its libraries as they are, not the bundle of Next.js
const config: NextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: process.env.BASE_PATH ?? '',
  trailingSlash: true,
  serverExternalPackages: ['@table-bro/core', '@table-bro/react-mui', 'linkedom']
};

export default config;
`},
      {file: 'src/prerender-table.ts', language: 'ts', code: `import 'server-only';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of MUI: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export async function prerenderOrders(): Promise<PrerenderedTable> {
  const {parseHTML} = await import('linkedom');
  const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

  // The elements of the skin extend the HTMLElement of the server DOM: it is global before the import of the skin
  globalThis.HTMLElement ??= window.HTMLElement;

  const {prerenderTableBro} = await import('@table-bro/core');
  const {setMuiTheme} = await import('@table-bro/react-mui/server');

  setMuiTheme(theme);

  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
      {file: 'src/app/page.tsx', language: 'tsx', code: `import {OrdersTable}     from '../OrdersTable';
import {prerenderOrders} from '../prerender-table';

export default async function Page() {
  return <OrdersTable prerendered={await prerenderOrders()} />;
}
`},
      {file: 'src/OrdersTable.tsx', language: 'tsx', code: `'use client';

import './skin';

import {useEffect, useRef} from 'react';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows}           from './orders';
import type {PrerenderedTable} from './prerender-table';

/**
 * The table of the orders: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place.
 * @param props - the prerendered table
 * @param props.prerendered - its attributes and its markup
 */
export function OrdersTable({prerendered}: {prerendered: PrerenderedTable}) {
  const table = useRef<TableBroHTMLElement>(null);

  useEffect(() => {
    const element = table.current!;
    const onAction = (event: CustomEvent<BroActionDetail>) => console.log(event.detail.action);

    queueMicrotask(() => element.configure({cols, rows, conf}));
    element.addEventListener('bro-action', onAction);

    return () => element.removeEventListener('bro-action', onAction);
  }, []);

  return (
    <div className="bro-table-shadow-container">
      <table-bro {...prerendered.attributes} ref={table} theme="auto" dangerouslySetInnerHTML={{__html: prerendered.html}}></table-bro>
    </div>
  );
}
`},
      {file: 'src/app/layout.tsx', language: 'tsx', code: `import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
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
        <InitColorSchemeScript attribute="data-mui-color-scheme" defaultMode="light" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
`},
      {file: 'src/app/Providers.tsx', language: 'tsx', code: `'use client';

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
`},
      {file: 'src/app/globals.css', language: 'css', code: `/* The CSS of the core and of the skin */
@import '@table-bro/core/dist/table-bro.min.css';
@import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
`}
    ]
  },
  {
    path: 'ssr/solidstart',
    name: 'SolidStart',
    text: `<!-- intro -->
SolidStart renders a page on the server, or at the build of a static site: its server entry prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and the component of the table renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in \`onMount()\`. The skin \`suid\` renders the components of SUID there with its server entry, \`@table-bro/solid-suid/server\`, by \`renderToString\` of Solid, with the styles of SUID and the CSS variables of the theme in their markup. The steps are the ones of the sample project \`samples/solid-suid/start\` of the repository, a static site of SolidStart 2 with Nitro, whose [working page](https://table-bro.com/samples/solid-suid/start) shows the prerendered table before its scripts run. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in SolidStart?

1. **Install the packages**

   The table and the skin, SUID, SolidStart with Nitro, which prerenders the page at the build, and the server DOM:

   {{install.sh}}

2. **Bundle SUID, the skin and the core for the server**

   SUID publishes its components as JSX, which the plugin of Solid compiles for the server only when the server bundle carries it: \`ssr.noExternal\` names SUID, the skin and the core. The sample builds a static site into \`dist\` with the page \`/\` prerendered. \`vite.config.ts\`:

   {{vite.config.ts}}

3. **Prerender the table**

   The elements of the core and of the skin extend the \`HTMLElement\` of the server DOM, which a module of its own gives to the global scope before they load. \`src/server-dom.ts\`:

   {{src/server-dom.ts}}

   The prerender takes the columns and the config of \`configure()\` and the theme of the application; the rows wait for the browser. \`src/prerender-orders.ts\`:

   {{src/prerender-orders.ts}}

   The server entry imports the server DOM first, and gives the prerendered table to the page by the locals of the request. \`src/entry-server.tsx\`:

   {{src/entry-server.tsx}}

   \`src/locals.d.ts\`:

   {{src/locals.d.ts}}

4. **Render the table in the page**

   The component of the table renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of Solid keeps, and \`configure()\` renders the table with its rows in its place. \`src/PrerenderedOrdersTable.tsx\`:

   {{src/PrerenderedOrdersTable.tsx}}

   The application renders it in the theme of SUID. \`src/app.tsx\`:

   {{src/app.tsx}}

5. **Give the server the light theme**

   The server does not know the color scheme of the system of the user: it renders the light palette, and the browser takes the scheme of the system. The palettes are the ones of [Solid data table](https://table-bro.com/docs/frameworks/solid). \`src/theme.ts\`:

   {{src/theme.ts}}

\`src/skin.ts\`, \`src/orders.ts\` and \`src/elements.d.ts\` are the ones of [Solid data table](https://table-bro.com/docs/frameworks/solid). The select of the page sizes renders as the native select of SUID on the server, since the select of the menu of SUID 0.19 fails in the server render of Solid; the browser renders the select of the menu.

#### Related

[Solid data table](https://table-bro.com/docs/frameworks/solid), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
    files: [
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/solid-suid @suid/material @solidjs/start nitro linkedom
`},
      {file: 'vite.config.ts', language: 'ts', code: `import {solidStart}   from '@solidjs/start/config';
import {nitro}        from 'nitro/vite';
import {defineConfig} from 'vite';

// A static site: the build prerenders the page with its prerendered table into dist. The plugin of Solid compiles the
// components of SUID, published as JSX, for the browser and for the server, so the server bundle carries SUID and the
// skin; it carries the core too, which loads after the server DOM gives it its HTMLElement (src/server-dom.ts)
export default defineConfig({
  ssr: {noExternal: [/^@suid\\//, '@table-bro/core', '@table-bro/solid-suid']},
  plugins: [
    solidStart(),
    nitro({
      preset: 'static',
      prerender: {routes: ['/']},
      output: {dir: 'dist', publicDir: 'dist'}
    })
  ]
});
`},
      {file: 'src/server-dom.ts', language: 'ts', code: `import {parseHTML} from 'linkedom';

// The elements of the core and of the skin extend the HTMLElement of a server DOM: this module gives it to the global
// scope, and the modules that import it before the core and the skin load after it
const {window} = parseHTML('<!doctype html><html><body></body></html>');

globalThis.HTMLElement ??= window.HTMLElement;
`},
      {file: 'src/prerender-orders.ts', language: 'ts', code: `// The server DOM first: the core and the skin take its HTMLElement
import './server-dom';

import {prerenderTableBro} from '@table-bro/core';
import {setSuidTheme}      from '@table-bro/solid-suid/server';

import {parseHTML} from 'linkedom';

import {cols, conf} from './orders';
import {theme}      from './theme';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of SUID: the page
 * shows it before any script runs, and configure() renders the table with its rows in its place in the browser. The
 * server entry of the skin renders its elements in the theme of the application.
 */
export function prerenderOrders(): PrerenderedTable {
  setSuidTheme(theme);

  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
      {file: 'src/entry-server.tsx', language: 'tsx', code: `// @refresh reload
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
`},
      {file: 'src/locals.d.ts', language: 'ts', code: `// The prerendered table of the page in the locals of a request of the server
import type {PrerenderedTable} from './prerender-orders';

declare global {
  namespace App {
    interface RequestEventLocals {
      orders?: PrerenderedTable;
    }
  }
}
`},
      {file: 'src/PrerenderedOrdersTable.tsx', language: 'tsx', code: `import {onMount}                   from 'solid-js';
import {getRequestEvent, isServer} from 'solid-js/web';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from './orders';

/**
 * The table of the orders with its prerender: the page of the server has it prerendered, and configure() renders it with its rows in the
 * browser, in its place. The hydration of Solid keeps the markup of the server, which the browser has no copy of.
 */
export function PrerenderedOrdersTable() {
  let table!: TableBroHTMLElement;
  const prerendered = isServer ? getRequestEvent()?.locals.orders : undefined;
  // The attributes of the prerender as they are, but the id, which the element has: the spread of Solid writes the class
  // of a property with a space after it
  const attributes = Object.fromEntries(Object.entries(prerendered?.attributes ?? {})
    .filter(([name]) => name !== 'id')
    .map(([name, value]) => [\`attr:\${name}\`, value]));

  onMount(() => table.configure({cols, rows, conf}));

  return (
    <div class="bro-table-shadow-container">
      <table-bro {...attributes} id="orders" ref={table} theme="auto" innerHTML={prerendered?.html}
                 on:bro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}></table-bro>
    </div>
  );
}
`},
      {file: 'src/app.tsx', language: 'tsx', code: `// The skin is registered before the tables
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
`},
      {file: 'src/theme.ts', language: 'ts', code: `import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';
import {isServer}                             from 'solid-js/web';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the azure
// palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the surface
// as the background of the table, the outline as the borders of the rows and the outline of the chips, and the font
// Roboto. The page stays light, as the page of that sample, and the table follows the color scheme of the system:
// the server renders the light one, and the browser follows a change of the scheme
const scheme = isServer ? undefined : window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme?.matches ?? false);

scheme?.addEventListener('change', event => setDark(event.matches));

const lightPalette = {
  mode: 'light' as const,
  primary: {main: '#005cbb'},
  text: {primary: '#1a1b1f', secondary: '#44474e', disabled: 'rgba(26, 27, 31, 0.38)'},
  divider: '#74777f',
  background: {default: '#faf9fd', paper: '#faf9fd'},
  action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)', disabledOpacity: 0.38},
  grey: {400: '#74777f'}
};

// The dark scheme keeps the light background of the page, which CssBaseline gives the body
const darkPalette = {
  mode: 'dark' as const,
  primary: {main: '#abc7ff'},
  text: {primary: '#e3e2e6', secondary: '#e0e2ec', disabled: 'rgba(227, 226, 230, 0.38)'},
  divider: '#8e9099',
  background: {default: '#faf9fd', paper: '#121316'},
  action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)', disabledOpacity: 0.38},
  grey: {700: '#8e9099'}
};

const palette = createRoot(() => createMemo(() => createPalette(dark() ? darkPalette : lightPalette)));

export const theme = createTheme({palette, typography: {fontFamily: 'Roboto'}});
`}
    ]
  },
  {
    path: 'ssr/sveltekit',
    name: 'SvelteKit',
    text: `<!-- intro -->
SvelteKit renders a page on the server, or at its build: the load of the page on the server prerenders the table with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), and the page renders the element \`‹table-bro›\` with that markup and calls \`configure()\` in \`onMount()\`. The skin \`m3-svelte\` renders the components of M3 Svelte there with its server entry, \`@table-bro/svelte-m3/server\`, by \`render()\` of \`svelte/server\`. The steps are the ones of the sample project \`samples/svelte-m3/sveltekit\` of the repository, static pages of SvelteKit 3: its [working page](https://table-bro.com/samples/svelte-m3/sveltekit/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/svelte-m3/sveltekit) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in SvelteKit?

1. **Install the packages**

   The table and the skin, M3 Svelte and the plugin of its CSS, the server DOM, and SvelteKit with its adapter of static pages:

   {{install.sh}}

2. **Compile M3 Svelte and prerender the pages**

   SvelteKit compiles the components of M3 Svelte for the browser and for the server, and the plugin of M3 Svelte the CSS of their styles; the condition \`svelte\` of the exports of the skin lets SvelteKit bundle the skin with them on the server. The plugin names Vite 7 as its peer dependency and works with Vite 8, by \`"overrides": {"vite-plugin-functions-mixins": {"vite": "$vite"}}\` in \`package.json\`. The sample writes static pages into \`dist\` under the base path of its working page. \`vite.config.ts\`:

   {{vite.config.ts}}

   \`src/routes/+layout.ts\` prerenders the pages at the build:

   {{src/routes/+layout.ts}}

3. **Give the server DOM to the elements**

   The elements of the skin extend the \`HTMLElement\` of the server DOM: the hooks of the server make it global, before the server imports the core and the skin with the modules of the pages. \`src/hooks.server.ts\`:

   {{src/hooks.server.ts}}

4. **Prerender the table**

   The prerender takes the columns and the config of \`configure()\`; the rows wait for the browser. The folder \`server\` of \`#lib\` keeps it out of the bundle of the browser. \`src/lib/server/prerender-table.ts\`:

   {{src/lib/server/prerender-table.ts}}

   The load of the page on the server gives the prerendered table to the page. \`src/routes/+page.server.ts\`:

   {{src/routes/+page.server.ts}}

5. **Render the table in the page**

   The page renders \`‹table-bro›\` with the attributes and the markup of the prerender, which the hydration of Svelte keeps, and \`configure()\` renders the table with its rows in its place. \`src/routes/+page.svelte\`:

   {{src/routes/+page.svelte}}

\`src/lib/skin.ts\`, \`src/lib/theme.css\` and \`src/lib/orders.ts\` are the ones of \`src/skin.ts\`, \`src/theme.css\` and \`src/orders.ts\` of [Svelte data table](https://table-bro.com/docs/frameworks/svelte).

#### Related

[Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
    files: [
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/svelte-m3 m3-svelte linkedom
npm install -D @sveltejs/kit @sveltejs/adapter-static vite-plugin-functions-mixins
`},
      {file: 'vite.config.ts', language: 'ts', code: `import adapter           from '@sveltejs/adapter-static';
import {sveltekit}       from '@sveltejs/kit/vite';
import {defineConfig}    from 'vite';
import {functionsMixins} from 'vite-plugin-functions-mixins';

// M3 Svelte publishes its components as their sources: SvelteKit compiles them for the browser and for the server, and
// the plugin of M3 Svelte the mixins and the functions of their CSS. The pages are prerendered at the build into dist,
// under the base path of the variable BASE_PATH, as the working page of table-bro.com has it; a project of its own
// leaves it out
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({pages: 'dist', assets: 'dist'}),
      paths: {base: process.env.BASE_PATH ?? ''}
    }),
    functionsMixins({deps: ['m3-svelte']})
  ]
});
`},
      {file: 'src/routes/+layout.ts', language: 'ts', code: `// The page is prerendered at the build, with the table in its loading state
export const prerender = true;
`},
      {file: 'src/hooks.server.ts', language: 'ts', code: `import {parseHTML} from 'linkedom';

// The elements of the skin extend the HTMLElement of the server DOM of the prerender, linkedom: it is global before the
// server imports the core and the skin, which SvelteKit does after the hooks, with the modules of the pages
globalThis.HTMLElement ??= parseHTML('<!doctype html><html><body></body></html>').window.HTMLElement;
`},
      {file: 'src/lib/server/prerender-table.ts', language: 'ts', code: `import {prerenderTableBro} from '@table-bro/core';
import '@table-bro/svelte-m3/server';

import {parseHTML} from 'linkedom';

import {cols, conf} from '../orders';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of M3 Svelte: the
 * page shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 */
export function prerenderOrders(): PrerenderedTable {
  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
      {file: 'src/routes/+page.server.ts', language: 'ts', code: `import type {PageServerLoad} from './$types';
import {prerenderOrders}     from '#lib/server/prerender-table';

export const load: PageServerLoad = () => ({prerendered: prerenderOrders()});
`},
      {file: 'src/routes/+page.svelte', language: 'svelte', code: `<script lang="ts">
  // The skin is registered before the tables
  import '#lib/skin';

  import {onMount} from 'svelte';

  import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

  import {cols, conf, rows} from '#lib/orders';

  import type {PageProps} from './$types';

  // The page of the server has the table prerendered, and configure() renders it with its rows in the browser, in its
  // place
  let {data}: PageProps = $props();
  let table: TableBroHTMLElement;

  onMount(() => table.configure({cols, rows, conf}));
</script>

<div class="bro-table-shadow-container">
  <table-bro {...data.prerendered.attributes} bind:this={table} theme="auto"
             onbro-action={(event: CustomEvent<BroActionDetail>) => console.log(event.detail.action)}>{@html data.prerendered.html}</table-bro>
</div>
`}
    ]
  },
  {
    path: 'ssr/nuxt',
    name: 'Nuxt',
    text: `<!-- intro -->
Nuxt renders a page on the server, or at the build of a static site: a component prerenders the table on the server with \`prerenderTableBro()\` in the server DOM of [linkedom](https://github.com/WebReflection/linkedom), \`useAsyncData()\` carries the markup to the browser, and \`configure()\` renders the table with its rows in \`onMounted()\`. The skin \`vuetify\` renders the components of Vuetify there with its server entry, \`@table-bro/vue-vuetify/server\`, by the synchronous part of the server render of Vue. The steps are the ones of the sample project \`samples/vue-vuetify/nuxt\` of the repository, a static site with Nuxt 4: its [working page](https://table-bro.com/samples/vue-vuetify/nuxt/) shows the prerendered table before its scripts run, and [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/vue-vuetify/nuxt) opens it in the browser. What the prerender renders, and its limits: [Prerender function](https://table-bro.com/docs/ssr/prerendering).

<!-- setup -->
#### How do I prerender a table in Nuxt?

1. **Install the packages**

   The table and the skin, Vuetify and the server DOM:

   {{install.sh}}

2. **Take Vuetify and the skin through the build**

   The components of Vuetify import their styles, so the build of Nuxt takes Vuetify and the skin through Vite (\`build.transpile\`); the template compiler knows \`‹table-bro›\` as a Custom Element, and the CSS of Vuetify, of the core and of the skin come by \`css\`. The sample also generates its static pages into \`dist\` under the base path of its working page. \`nuxt.config.ts\`:

   {{nuxt.config.ts}}

3. **Give the application its Vuetify**

   A plugin installs a Vuetify for each render of the server and in the browser, with \`ssr: true\` and the themes of [Vue 3 data table](https://table-bro.com/docs/frameworks/vue), and provides it. \`app/plugins/vuetify.ts\`:

   {{app/plugins/vuetify.ts}}

   In the browser, the import of the skin defines \`‹table-bro›\` and registers the skin, and \`setVuetify()\` gives its elements the Vuetify of the application. \`app/plugins/table-bro.client.ts\`:

   {{app/plugins/table-bro.client.ts}}

4. **Prerender the table**

   The server DOM gives its \`HTMLElement\` to the global scope before the import of the skin, as its elements extend it, and the server entry takes the Vuetify of the render. The prerender takes the columns and the config of \`configure()\`; the rows wait for the browser. \`app/prerender-table.ts\`:

   {{app/prerender-table.ts}}

5. **Render the table in the page**

   The component prerenders the table on the server in \`useAsyncData()\`, renders \`‹table-bro›\` with its attributes and its markup, which the hydration of Vue keeps, and \`configure()\` renders the table with its rows in its place. \`app/components/OrdersTable.vue\`:

   {{app/components/OrdersTable.vue}}

   \`app/app.vue\` renders it in \`VApp\` of Vuetify:

   {{app/app.vue}}

\`app/orders.ts\` is \`src/orders.ts\` of [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).

#### Related

[Vue 3 data table](https://table-bro.com/docs/frameworks/vue), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
    files: [
      {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/vue-vuetify vuetify linkedom nuxt
`},
      {file: 'nuxt.config.ts', language: 'ts', code: `// A static site: the build prerenders the page with its table in the markup of Vuetify, into dist under the base path
// of BASE_PATH. Vue compiles <table-bro> of its templates as a Custom Element, and the build takes Vuetify and the skin
// through Vite, with the styles that their components import
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  app: {
    baseURL: \`\${process.env.BASE_PATH ?? ''}/\`,
    head: {
      title: 'Table, Bro + Nuxt + Vue Vuetify',
      link: [
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: ''},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'},
        {rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons'}
      ]
    }
  },
  css: ['vuetify/styles', '@table-bro/core/dist/table-bro.min.css', '@table-bro/vue-vuetify/dist/table-bro.vue-vuetify.min.css', '~/assets/sample-page.css'],
  build: {
    transpile: ['vuetify', '@table-bro/vue-vuetify']
  },
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('table-bro')
    }
  },
  nitro: {
    output: {
      publicDir: 'dist'
    }
  }
});
`},
      {file: 'app/plugins/vuetify.ts', language: 'ts', code: `import {createVuetify, type ThemeDefinition} from 'vuetify';
import {md3}                                 from 'vuetify/blueprints';
import {aliases, md}                         from 'vuetify/iconsets/md';

// The light theme of the sample of Angular Material, its azure palette, in the colors of Vuetify: the system tokens of
// mat of the same roles. The light surface of Vuetify is the surface variant of Material, the surface variant of
// Vuetify its inverse surface, the background of the tooltips. The text of the high emphasis is the on-surface of mat,
// opaque, and the medium emphasis gives its on-surface-variant on the surface; the border is the outline of the rows of
// mat, and the state layers have the opacities of mat
const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAF9FD',
    'on-background': '#1A1B1F',
    primary: '#005CBB',
    'on-primary': '#FFFFFF',
    secondary: '#565E71',
    'on-secondary': '#FFFFFF',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    surface: '#FAF9FD',
    'on-surface': '#1A1B1F',
    'surface-light': '#E0E2EC',
    'surface-variant': '#2F3033',
    'on-surface-variant': '#F2F0F4'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.8,
    'disabled-opacity': 0.38,
    'border-color': '#74777F',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The dark theme of the same palette, which the table takes in a dark system by its theme auto, as the table of the
// sample of Angular Material takes the dark tokens of mat there
const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121316',
    'on-background': '#E3E2E6',
    primary: '#ABC7FF',
    'on-primary': '#002F65',
    secondary: '#BEC6DC',
    'on-secondary': '#283041',
    error: '#FFB4AB',
    'on-error': '#690005',
    surface: '#121316',
    'on-surface': '#E3E2E6',
    'surface-light': '#44474E',
    'surface-variant': '#E3E2E6',
    'on-surface-variant': '#2F3033'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 1,
    'disabled-opacity': 0.38,
    'border-color': '#8E9099',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The Vuetify of the application, with the blueprint of Material 3, for each render of the server and in the browser:
// its themes give the colors to the table, on the light page of the sample of Angular Material, and its icons are the
// ligatures of Material Icons, the font of the page
export default defineNuxtPlugin({
  name: 'vuetify',
  setup: nuxtApp => {
    const vuetify = createVuetify({
      ssr: true,
      blueprint: md3,
      icons: {defaultSet: 'md', aliases, sets: {md}},
      theme: {defaultTheme: 'light', themes: {light, dark}}
    });

    nuxtApp.vueApp.use(vuetify);

    return {provide: {vuetify}};
  }
});
`},
      {file: 'app/plugins/table-bro.client.ts', language: 'ts', code: `// The skin in the browser: its import defines <table-bro> and registers the skin vuetify, and setVuetify() gives its
// elements the Vuetify of the application. The server renders the table with the server entry of the skin
// (prerender-table.ts)
import {setVuetify} from '@table-bro/vue-vuetify';

export default defineNuxtPlugin({
  dependsOn: ['vuetify'],
  setup: nuxtApp => setVuetify(nuxtApp.$vuetify)
});
`},
      {file: 'app/prerender-table.ts', language: 'ts', code: `import type {BroVuetifyInstance} from '@table-bro/vue-vuetify';

import {cols, conf} from './orders';

/** The prerendered table: the attributes of the element <table-bro> and its markup. */
export interface PrerenderedTable {
  attributes: Record<string, string>;
  html: string;
}

/**
 * Renders the table of the orders in its loading state on the server, in the markup of the components of Vuetify: the
 * page shows it before any script runs, and configure() renders the table with its rows in its place in the browser.
 * @param vuetify - the Vuetify of the render of the server
 */
export async function prerenderOrders(vuetify: BroVuetifyInstance): Promise<PrerenderedTable> {
  const {parseHTML} = await import('linkedom');
  const {document, window} = parseHTML('<!doctype html><html><body></body></html>');

  // The elements of the skin extend the HTMLElement of the server DOM: it is global before the import of the skin
  globalThis.HTMLElement ??= window.HTMLElement;

  const {prerenderTableBro} = await import('@table-bro/core');
  const {setVuetify} = await import('@table-bro/vue-vuetify/server');

  setVuetify(vuetify);

  const table = document.createElement('table-bro');

  table.id = 'orders';
  document.body.append(table);
  prerenderTableBro(table, {cols, conf});

  return {attributes: Object.fromEntries([...table.attributes].map(({name, value}) => [name, value])), html: table.innerHTML};
}
`},
      {file: 'app/components/OrdersTable.vue', language: 'vue', code: `<script setup lang="ts">
import {onMounted, useTemplateRef} from 'vue';

import type {BroActionDetail, TableBroHTMLElement} from '@table-bro/core';

import {cols, conf, rows} from '../orders';

const {$vuetify} = useNuxtApp();
const table = useTemplateRef<TableBroHTMLElement>('table');

// The server prerenders the table in its loading state, and the page carries its markup to the browser
const {data: prerendered} = await useAsyncData('orders', async () => import.meta.server
  ? (await import('../prerender-table')).prerenderOrders($vuetify)
  : null);

// configure() renders the table with its rows in the place of the prerender
onMounted(() => table.value!.configure({cols, rows, conf}));

function onAction(event: CustomEvent<BroActionDetail>) {
  console.log(event.detail.action);
}
</script>

<template>
  <div class="bro-table-shadow-container">
    <table-bro v-bind="prerendered?.attributes" id="orders" ref="table" theme="auto" @bro-action="onAction" v-html="prerendered?.html"></table-bro>
  </div>
</template>
`},
      {file: 'app/app.vue', language: 'vue', code: `<script setup lang="ts">
import {VApp} from 'vuetify/components/VApp';
</script>

<template>
  <VApp>
    <OrdersTable />
  </VApp>
</template>
`}
    ]
  },
  {
    path: 'ssr/prerendering',
    name: 'Prerender function',
    text: `<!-- intro -->
A page that a server renders shows the table before any script runs. The prerender renders the table in its loading state: the toolbar, the column headers, the loading row and the paginator, in the markup of its skin. The CSS of the skin sizes it, so the table takes its place on the page at once, and the page has no layout shift when the table renders in the browser. There the table renders with its rows in the same element, and the loading animation goes on instead of starting over. The pages of this section show the prerender in Angular SSR, Next.js, SolidStart, SvelteKit and Nuxt, each with its sample project; this page shows the function that renders the table on any server with a DOM, and the limits of the prerender.

<!-- setup -->
#### prerenderTableBro() _since 1.2.0_

Without Angular, \`prerenderTableBro(element, {cols, conf})\` of \`@table-bro/core\` renders the table into a \`‹table-bro›\` element of a server DOM, a DOM without a browser. It takes the columns and the config of \`configure()\`; the rows wait for the browser. The table creates its nodes in the document of the element, so the server needs no global \`document\`, and the imports of the core and of the skins \`bs\` and \`nv\` work without a DOM. The element goes into its document before the call, so that the elements of the skin render their markup as they connect:

{{src/prerender.ts}}

In the browser, \`configure()\` on the same element renders the table with its rows in place of the prerender:

{{src/browser.ts}}

The columns, the rows and the config come from \`src/orders.ts\`:

{{src/orders.ts}}

#### Limits

1. **The loading state only**

   The prerender renders the table without rows, in its loading state: the rows, the sort and the pages come with the table of the browser.

2. **The theme auto**

   The server does not know the color scheme of the system of the user. With the theme \`auto\` the prerendered table takes no class of a theme and shows the theme of the page; the table of the browser then follows the system. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

3. **The elements of the skin**

   The elements of a skin render on the server only when the skin defines them in a registry of custom elements, \`BroSkinConfig.defineElements(registry)\`, as \`bs\` and \`nv\` do and \`mui\`, \`suid\`, \`m3-svelte\` and \`vuetify\` do with their server entries, and the window of the server DOM has that registry, \`customElements\`. Without them the toolbar, the column headers and the paginator stay the empty tags of the skin with their attributes until the browser renders the table. \`‹table-bro-ng›\` gives the server DOM of Angular a registry for the time of the prerender, and renders the elements of \`mat\` with its Angular components.

4. **Critical CSS**

   A production build of Angular inlines the critical CSS of a page with Beasties and loads the whole stylesheet after the page shows (\`optimization.styles.inlineCritical\`). The scripts of the page may run before the stylesheet loads: the table then measures its parts without the styles of the components of its skin, and keeps that geometry, with its body collapsed. Turn the inlining off, as the samples of Angular do, so that the stylesheet loads before the page shows. To \`"production"\` of the configurations of the build in \`angular.json\`:

   {{angular-optimization.json}}

   The CSS of the core and of the skins keeps the layout of a prerendered table with the critical CSS too, which drops the selectors that start with a pseudo-class: the sizes of a skin come also by \`table-bro:where([data-bro-prerender].<skin>)\`, so the prerendered table keeps its size before the stylesheets of the page load.

#### Related

[Vanilla JS data table](https://table-bro.com/docs/frameworks/vanilla), [Animated table states](https://table-bro.com/docs/basics/table-states), [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode), [Fixed row height](https://table-bro.com/docs/basics/fixed-row-height).`,
    files: [
      {file: 'src/prerender.ts', language: 'ts', code: `import {prerenderTableBro} from '@table-bro/core';
// The import registers the skin nv; without a DOM it defines no elements
import '@table-bro/native';

import {cols, conf} from './orders';

/**
 * Renders the table of the orders in its loading state into a page of a server DOM. The element is in the document
 * first, so the elements of the skin connect and render their markup.
 * @param page - the document of the page in the server DOM
 */
export function prerenderOrders(page: Document): void {
  const table = page.createElement('table-bro');

  page.body.append(table);
  prerenderTableBro(table, {cols, conf});
}
`},
      {file: 'src/browser.ts', language: 'ts', code: `import '@table-bro/native';

import {cols, conf, rows} from './orders';

// The prerendered table of the page: configure() renders the table with its rows in its place
document.querySelector('table-bro')!.configure({cols, rows, conf});
`},
      frameworkOrders,
      {file: 'angular-optimization.json', language: 'json', code: `"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": false
  },
  "fonts": true
}
`}
    ]
  },
  {
    path: 'accessibility/localization',
    name: 'Texts and localization',
    text: `<!-- table-localization -->
\`config.texts\` gives the words of the table in the language of your application: the toolbar, its search line, the filter drawer, the paginator, the progress bar, the messages of the states and the column of the row numbers. A text that the config does not set keeps its English default. The code under the table gives every text with its default value, as the table below shows them: change the words for the language of your application.

<!-- table-localization code -->
{{texts.ts}}

<!-- fields -->
#### Texts by the part of the table _since 1.2.0_

The texts of the parts that the core renders come first, flat and named as the options of the config: \`rowCounterTitle\`, \`rowCounterLabel\` and \`rowDetailsLoadingMessage\`. The texts of a component of the skin go into the group named as the component, in the order of the components of the skin: \`filterDrawer\`, \`paginator\`, \`progressBar\`, \`state\`, \`toolbarMain\` and \`toolbarSearch\`. The labels of \`paginator\` have the names and the order of \`MatPaginatorIntl\` of Angular Material, from \`itemsPerPageLabel\` to \`getRangeLabel\`.

| Field | Default | Skins | Since |
| --- | --- | --- | --- |
| \`rowCounterTitle\` | No | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`rowCounterLabel\` | Row number | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`rowDetailsLoadingMessage\` | Loading details | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`filterDrawer.title\` | Filters | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`filterDrawer.close\` | Close | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.itemsPerPageLabel\` | Items per page: | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.nextPageLabel\` | Next page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.previousPageLabel\` | Previous page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.firstPageLabel\` | First page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.lastPageLabel\` | Last page | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.getRangeLabel(page, pageSize, length)\` | 1 – 5 of 20 | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.label\` | Pagination | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`paginator.navigationLabel\` | Table page navigation | suid, bs, nv | 1.2.0 |
| \`paginator.firstText\` | First | bs, nv | 1.2.0 |
| \`paginator.previousText\` | Previous | bs, nv | 1.2.0 |
| \`paginator.nextText\` | Next | bs, nv | 1.2.0 |
| \`paginator.lastText\` | Last | bs, nv | 1.2.0 |
| \`progressBar.label\` | Loading progress | mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state.loading\` | Loading | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state['no-data']\` | No data | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state['not-found']\` | No records found | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`state.fail\` | Failed | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarMain.search\` | Search | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarMain.searchRole(title)\` | for Orders, by the title of the toolbar; for rows without a title | bs, nv | 1.2.0 |
| \`toolbarMain.buttonRole\` | button | bs, nv | 1.2.0 |
| \`toolbarMain.menuRole\` | menu | bs | 1.2.0 |
| \`toolbarMain.menuItemRole\` | menu item | bs | 1.2.0 |
| \`toolbarSearch.field\` | Search in table | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarSearch.back\` | Back | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |
| \`toolbarSearch.clear\` | Clear | mat, mui, suid, m3-svelte, vuetify, bs, nv | 1.2.0 |

The flat fields of 1.1.0, as \`texts.itemsPerPage\` for \`texts.paginator.itemsPerPageLabel\` and \`texts.rowCounter\` for \`texts.rowCounterTitle\`, still work and are deprecated: the editor marks them, and 2.0 removes them. A field in a group and a text of the core win over their flat field.

A field that is \`undefined\`, as \`{toolbarMain: {search: undefined}}\`, changes nothing: the text stays the default one, or the flat field of 1.1.0 below it.

<!-- states -->
#### Messages of the states

The group \`state\` gives the messages of the states by their names, \`loading\`, \`no-data\`, \`not-found\` and \`fail\`; the icons stay the ones of the skin. The states, their icons and their Lottie animations are on the page [Animated table states](https://table-bro.com/docs/basics/table-states).

<!-- drawer -->
#### Filter drawer

The filter drawer of every skin takes its title and the name of its close button from \`texts.filterDrawer\` of the config of its table, \`title\` and \`close\`. The container of Bootstrap and Native reads them when it connects and when it opens, so a new \`configure()\` of the table shows at the next opening. The property \`texts\` of \`‹table-bro-filter-drawer-container›\` of 1.1.0 still works and wins over the config of the table; it is deprecated and removed in 2.0.

<!-- tags -->
#### Tags without items _since 1.2.0_

A cell of tags without items shows No data. The text belongs to the tags of the skin: \`withTags({texts: {empty: 'No data'}})\` gives it, and later the signal \`empty\` of the service \`TableBroMatTagsTexts\` of \`@table-bro/angular-material\`, or \`setTagsTexts({empty})\` of \`@table-bro/bootstrap\` and \`@table-bro/native\`, changes it at any time: the tags on the page take it at once. The deprecated \`texts.noItems\` of a config still works below them.

{{tags.ts}}

<!-- paginator -->
#### Paginator of Angular Material

The skin \`mat\` renders the paginator of Angular Material, which takes its texts from \`MatPaginatorIntl\` of the application, as every \`mat-paginator\` does. Of the group \`paginator\`, the skin \`mat\` reads only \`label\`, the name of the paginator. Provide your \`MatPaginatorIntl\` once, in the config of the application:

{{paginator-intl.ts}}

{{app.config.ts}}

<!-- language -->
#### Change of the language

The table takes its texts with its config. A new language is a new config: \`configure({cols, rows, conf})\` with the new \`texts\`, or a new value of the input \`conf\` of \`‹table-bro-ng›\`, renders the table anew. The paginator of Angular Material takes the new labels of \`MatPaginatorIntl\` after its \`changes.next()\`, the filter drawer takes the new texts of its table, with Bootstrap and Native at its next opening, and the tags take their new text from \`TableBroMatTagsTexts\` or \`setTagsTexts()\`.

{{language.ts}}`,
    files: [
      {file: 'texts.ts', language: 'ts', code: `import type {BroConfig, BroTextsConfig} from '@table-bro/core';

/** The numbers of the range of the paginator, as 1,234. */
const rangeNumber = new Intl.NumberFormat('en-US');

// Every text of the table with its default value: change the words for the language of your application
export const texts: BroTextsConfig = {
  // Core texts
  rowCounterTitle: 'No',
  rowCounterLabel: 'Row number',
  rowDetailsLoadingMessage: 'Loading details',

  // Skin component texts
  filterDrawer: {
    title: 'Filters',
    close: 'Close'
  },
  paginator: {
    itemsPerPageLabel: 'Items per page:',
    nextPageLabel: 'Next page',
    previousPageLabel: 'Previous page',
    firstPageLabel: 'First page',
    lastPageLabel: 'Last page',
    getRangeLabel: (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return \`0 of \${rangeNumber.format(length)}\`;
      }

      length = Math.max(length, 0);

      const start = page * pageSize;
      // A start after the end of the list keeps the end of its page
      const end = (start < length) ? Math.min(start + pageSize, length) : start + pageSize;

      return \`\${rangeNumber.format(start + 1)} – \${rangeNumber.format(end)} of \${rangeNumber.format(length)}\`;
    },
    label: 'Pagination',
    navigationLabel: 'Table page navigation',
    firstText: 'First',
    previousText: 'Previous',
    nextText: 'Next',
    lastText: 'Last'
  },
  progressBar: {
    label: 'Loading progress'
  },
  state: {
    loading: 'Loading',
    'no-data': 'No data',
    'not-found': 'No records found',
    fail: 'Failed'
  },
  toolbarMain: {
    search: 'Search',
    searchRole: (title: string) => \`for \${title || 'rows'}\`,
    buttonRole: 'button',
    menuRole: 'menu',
    menuItemRole: 'menu item'
  },
  toolbarSearch: {
    field: 'Search in table',
    back: 'Back',
    clear: 'Clear'
  }
};

export const conf: BroConfig = {
  skin: 'bs',
  texts,
  toolbarTitle: 'Orders'
};
`},
      {file: 'tags.ts', language: 'ts', code: `import {withTags} from '@table-bro/bootstrap';

// The tags of the skin bs, with the text of a cell without items
withTags({texts: {empty: 'No data'}});
`},
      {file: 'paginator-intl.ts', language: 'ts', code: `import {Injectable} from '@angular/core';

import {MatPaginatorIntl} from '@angular/material/paginator';

/** The texts of the paginators of Angular Material with their default values: change the words for the language of your application. */
@Injectable()
export class AppPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Items per page:';
  override nextPageLabel = 'Next page';
  override previousPageLabel = 'Previous page';
  override firstPageLabel = 'First page';
  override lastPageLabel = 'Last page';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return \`0 of \${length}\`;
    }

    length = Math.max(length, 0);

    const start = page * pageSize;
    // A start after the end of the list keeps the end of its page
    const end = (start < length) ? Math.min(start + pageSize, length) : start + pageSize;

    return \`\${start + 1} – \${end} of \${length}\`;
  };
}
`},
      {file: 'app.config.ts', language: 'ts', code: `import type {ApplicationConfig} from '@angular/core';

import {MatPaginatorIntl}                 from '@angular/material/paginator';
import {provideTableBroMatSkin, withTags} from '@table-bro/angular-material';

import {AppPaginatorIntl} from './paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTableBroMatSkin(withTags({texts: {empty: 'No data'}})),
    {provide: MatPaginatorIntl, useClass: AppPaginatorIntl}
  ]
};
`},
      {file: 'language.ts', language: 'ts', code: `import {setTagsTexts}                                   from '@table-bro/bootstrap';
import type {BroCol, BroConfig, BroRow, BroTextsConfig} from '@table-bro/core';

/**
 * Shows the table in another language: the new config renders the table anew, with the same columns and rows.
 * @param cols - the columns of the table
 * @param rows - the rows of the table
 * @param conf - the config of the table in its language before
 * @param texts - the texts of the table in the new language
 * @param empty - the text of a cell of tags without items in the new language
 */
export function setLanguage(cols: BroCol[], rows: BroRow[], conf: BroConfig, texts: BroTextsConfig, empty: string): void {
  document.querySelector('table-bro')!.configure({cols, rows, conf: {...conf, texts}});
  setTagsTexts({empty});
}
`}
    ]
  },
  {
    path: 'accessibility/keyboard-and-focus',
    name: 'Keyboard and focus',
    text: `<!-- order -->
The table is HTML of the page, so Tab goes through its controls in the order of the DOM: the toolbar, the column headers, the rows of the current page and the paginator.

| Part | Angular Material | Bootstrap | Native |
| --- | --- | --- | --- |
| Toolbar | The search button, the buttons of the config and the menu: buttons of Material | The search link, the buttons of the config and the menu: links with the role \`button\` | The search link and the buttons of the config: links with the role \`button\`; the menu is a \`‹select›\` |
| Search line | Back, the field, Clear: buttons of Material | Back, the field, Clear: Back and Clear are links with the role \`button\` | Back, the field, Clear: Back and Clear are links with the role \`button\` |
| Column headers | The sort headers of Material | A header with a title: \`role="button"\` and \`tabindex="0"\` | A header with a title: \`role="button"\` and \`tabindex="0"\` |
| Rows | The controls of the cells and the details button, a button of Material | The controls of the cells and the details button, a \`‹button›\` | The controls of the cells and the details button, a link with the role \`button\` |
| Paginator | The paginator of Material | The page size dropdown, then the links First, Previous, Next and Last | The page size \`‹select›\`, then the links First, Previous, Next and Last |

All loaded rows are in the DOM, but only the rows of the current page take the focus: the controls of the other pages get \`tabindex="-1"\` and take their own \`tabindex\` back on their page. The tags that do not fit their cell take no focus either, until they show. A row or a paginator that the table renders anew, as for new rows, keeps the focus of the keyboard on its control.

<!-- keys -->
#### Keys

1. **Links with the role button**

   The toolbar links of Bootstrap and Native, Back and Clear of their search line and the details link of Native take Enter, as every link does, and Space, as a button does, instead of scrolling the page.

2. **Sort headers**

   Enter and Space on a column header sort the column, as a click does: with Angular Material the header is the sort header of Material, with Bootstrap and Native a control of the skin.

3. **Row details**

   Enter and Space on the details button open and close the details of its row, and the focus stays on the button.

4. **Search line**

   The search button opens the search line and puts the focus into its field. Escape in the field closes the search line, as Back does, and the focus returns to the search button; Escape stays in the table, so a dialog around the table stays open. Clear empties the field and keeps the focus in it; Clear in an empty field closes the search line.

5. **Filter Drawer**

   Escape in the drawer closes it, with Angular Material as in the drawer of Material. With Bootstrap and Native, the opened drawer takes the focus into your filters, or to its close button when the filters have no control. With every skin the closed drawer gives the focus back to the button that opened it, when the focus was in the drawer; after a click of the pointer the button shows no focus ring.

<!-- rings -->
#### Focus rings

Each skin shows the focus of the keyboard in the look of its library:

1. **Bootstrap**: the focus ring of Bootstrap, from its variables \`--bs-focus-ring-*\`, also on the sort headers, which Bootstrap does not have.

2. **Native**: the outline of the browser; the skin keeps it one rectangle around the sort headers, the details link and the toolbar links, also in Safari.

3. **Angular Material**: the focus indication of the components of Material.

A control in a cell shows its whole focus ring: the cell, which cuts its content at its edges, lets the ring of a control in focus out.

<!-- safari -->
#### Safari

By default Tab in Safari skips links. The toolbar links of Bootstrap and Native, Back and Clear of their search line, the links of their paginator and the details link of Native take the focus by Option+Tab, or by Tab once **Press Tab to highlight each item on a webpage** is on in the settings of Safari, Advanced.`,
    files: []
  },
  {
    path: 'accessibility/screen-readers',
    name: 'Screen readers',
    text: `<!-- table -->
The table renders its header and its body as two HTML tables; for screen readers they are one table: the element with \`role="table"\` holds them, its name is \`toolbarTitle\`, its rows have \`role="row"\`, and the header cells with a title are column headers. The table tells the number of all its rows by \`aria-rowcount\`, also of the rows of the server that are not loaded, the place of a row by \`aria-rowindex\`, the sort of a column by \`aria-sort\` on its header, and its loading and refreshing by \`aria-busy\`. Screen readers meet only the rows of the current page: the rows of the other pages are \`aria-hidden\`.

<!-- toolbar -->
#### Roles and names of the toolbar

With Bootstrap and Native the controls of the toolbar are links with the role \`button\`, as Bootstrap gives it to a link that goes nowhere. A link says what it is with visually hidden words after its title, in the class \`bro-visually-hidden\` of the core, for screen readers and search engines, which read the text of a link:

| Field | Words | Text of the link | Skins |
| --- | --- | --- | --- |
| \`texts.toolbarMain.searchRole(title)\` | for Orders, by \`toolbarTitle\`; for rows without a title | Search for Orders | bs, nv |
| \`texts.toolbarMain.buttonRole\` | button | Filters button | bs, nv |
| \`texts.toolbarMain.menuRole\` | menu | More menu | bs |
| \`texts.toolbarMain.menuItemRole\` | menu item | Print menu item | bs |

The word \`button\` is for search engines only: it is \`aria-hidden\`, since a screen reader says the role of the link itself. The items of the menu of Bootstrap stay links, as in the markup of Bootstrap; the menu of Native is a \`‹select›\` named by its title. An empty string adds no words:

{{texts-roles.ts}}

With Angular Material the controls of the toolbar are icon buttons of Material, named by \`aria-label\`: the search button by \`texts.toolbarMain.search\`, a button of the config and the menu by their \`buttonTitle\`.

<!-- live -->
#### Live region

After the table the host has its live region, \`‹div class="bro-live-status bro-visually-hidden" role="status" aria-atomic="true"›\`, whose text screen readers say:

1. **The message of a state** when the table shows it: Loading, No data, No records found or Failed, from \`texts.state\` or from the skin. The icon of a state is \`aria-hidden\`: the state is named by its message. Once rows replace the state, the live region is empty.

2. **\`texts.rowDetailsLoadingMessage\`**, Loading details, while row details load from the server, until the details of every row load or leave.

The range of the paginator of Bootstrap and Native, as 6 – 10 of 20, is \`aria-live="polite"\`. The messages of the states are on the page [Animated table states](https://table-bro.com/docs/basics/table-states), and every text of the table on the page [Texts and localization](https://table-bro.com/docs/accessibility/localization).

<!-- names -->
#### Names of the paginator, the row numbers and the details

1. **Paginator**

   The paginator of every skin is a group named by \`texts.paginator.label\`, Pagination. The paginator of Angular Material takes its names from \`MatPaginatorIntl\` of the application. With Bootstrap and Native its links are in a \`‹nav›\` named by \`texts.paginator.navigationLabel\`, Table page navigation; the links are named First page, Previous page, Next page and Last page, a disabled link has \`aria-disabled="true"\`, and the page sizes are named Items per page:.

2. **Column of the row numbers**

   The title of the column is short, No, and a screen reader would read it as a word: its header is named by \`texts.rowCounterLabel\`, Row number.

3. **Row details**

   The details button says whether the details of its row are open by \`aria-expanded\` and points at them by \`aria-controls\`.

4. **Filter Drawer and progress bar**

   With Bootstrap and Native, the filters of the drawer are a region named by \`texts.filterDrawer.title\`, Filters, unless they have a name of their own, and the button that opens the drawer tells its state by \`aria-expanded\` and \`aria-controls\`. The progress bar of Bootstrap and Native is named by \`texts.progressBar.label\`, Loading progress.`,
    files: [
      {file: 'texts-roles.ts', language: 'ts', code: `import type {BroConfig} from '@table-bro/core';

export const conf: BroConfig = {
  skin: 'bs',
  toolbarTitle: 'Orders',
  texts: {
    toolbarMain: {
      // Search for Orders stays; the links of the buttons get no word after their titles
      buttonRole: ''
    }
  }
};
`}
    ]
  }
];

/** The text of a page as Markdown: without the marks of its parts, with its files of code in code blocks. */
export function docPageMarkdown(page: BroDocPage): string {
  return page.text
    .replace(/^<!-- .+ -->\n(\n)?/gm, '')
    .replace(/^( *)\{\{(.+)\}\}$/gm, (line: string, indent: string, file: string) => {
      const code = page.files.find(item => item.file === file)!;

      return `${indent}${file}:\n\n${indent}\`\`\`${code.language}\n${code.code.trimEnd().replace(/^(?=.)/gm, indent)}\n${indent}\`\`\``;
    });
}

import {type BroTarget, setupSteps} from '../generate/setup.js';
import type {BroSpecSkin}           from '../spec/spec.js';

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
 * Markdown of a few forms: paragraphs, headings ###, #### and #####, ordered lists whose items continue with blocks
 * indented by three spaces, `code`, **strong**, _emphasis_ and [links](url). A line {{file}} shows a file of code, and a line
 * <!-- name --> starts the part of the page that the site shows at that name, next to its tables.
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

const setupMat = setup('angular', 'mat');
const setupBs = setup('vanilla', 'bs');
const setupNv = setup('vanilla', 'nv');
const setupNgBs = setup('angular', 'bs');
const setupNgNv = setup('angular', 'nv');

/** The files of the setup that every page of Frameworks shows, as each project of samples/frameworks has them. */
const frameworkInstall: BroDocFile = {file: 'install.sh', language: 'bash', code: `npm install @table-bro/core @table-bro/native
`};
const frameworkSkin: BroDocFile = {file: 'src/skin.ts', language: 'ts', code: `// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin nv
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/native/dist/table-bro.native.min.css';
import '@table-bro/native';

import './sample-page.css';
`};
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

export const rows: Order[] = [
  {
    description: 'Modern Cotton Chair',
    price: 100
  }, {
    description: 'Awesome Concrete Ball',
    price: 200
  }
];

export const conf: BroConfig = {
  skin: 'nv',
  toolbarTitle: 'Orders'
};
`};

/** The pages of Docs, in the order of reading. Island Details have their own pages on the site, apart from this package. */
export const docPages: BroDocPage[] = [
  {
    path: 'getting-started',
    name: 'Getting started',
    text: `<!-- steps -->
Table, Bro is the Custom Element \`‹table-bro›\`: it takes the columns, the rows and a config with the name of its skin, and renders the table with its toolbar and its paginator.

### Angular

{{orders.component.ts}}

### Vanilla JS

{{orders.ts}}

<!-- setup -->
### Table, Bro + Angular Material

[See a working page](https://table-bro.com/samples/angular-material)

${setupMat.text}

### Table, Bro + Vanilla Bootstrap

[See a working page](https://table-bro.com/samples/bootstrap)

${setupBs.text}

### Table, Bro + Vanilla HTML

[See a working page](https://table-bro.com/samples/native)

${setupNv.text}

#### Without a build

[See a working page](https://table-bro.com/samples/no-build), [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/no-build)

A page without a bundler takes the same packages from [jsDelivr](https://www.jsdelivr.com/), the CDN of npm, at an exact version: the CSS by \`‹link›\`, the modules by an import map, which gives \`@table-bro/core\` to the skin ([MDN, importmap](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)). \`index.html\`:

{{index.html}}

\`app.js\` imports the skin and gives the table its columns, rows and config:

{{app.js}}`,
    files: [
      {file: 'index.html', language: 'html', code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Table, Bro + Vanilla HTML without a build</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@table-bro/core@1.1.0/dist/table-bro.min.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@table-bro/native@1.1.0/dist/table-bro.native.min.css" />
    <!-- The page around the table, as on table-bro.com -->
    <link rel="stylesheet" href="sample-page.css" />
    <script type="importmap">
      {
        "imports": {
          "@table-bro/core": "https://cdn.jsdelivr.net/npm/@table-bro/core@1.1.0/dist/table-bro.esm.js",
          "@table-bro/native": "https://cdn.jsdelivr.net/npm/@table-bro/native@1.1.0/dist/table-bro.native.esm.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module" src="app.js"></script>
  </body>
</html>
`},
      {file: 'app.js', language: 'js', code: `// The import of the skin defines <table-bro> and registers the skin nv
import '@table-bro/native';

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

const rows = [
  {
    description: 'Modern Cotton Chair',
    price: 100
  }, {
    description: 'Awesome Concrete Ball',
    price: 200
  }
];

const conf = {
  skin: 'nv',
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
`},
      {file: 'orders.component.ts', language: 'ts', code: `import {ChangeDetectionStrategy, Component, signal} from '@angular/core';

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

  rows = signal<Order[]>([
    {
      description: 'Modern Cotton Chair',
      price: 100
    }, {
      description: 'Awesome Concrete Ball',
      price: 200
    }
  ]);

  conf = signal<BroConfig>({
    skin: 'mat',
    toolbarTitle: 'Orders'
  });
}
`},
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
`},
      ...setupMat.files,
      ...setupBs.files,
      ...setupNv.files
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
Angular Material skin of Table, Bro supports 100% of Google Material Design [data tables](https://m2.material.io/components/data-tables#specs) specs and integrates all the Angular Material components it depends on.

It supports Material 3 (M3) and Angular Material 22: the skin takes the theme of your application, as the components of Angular Material do, and a table in the dark theme takes the dark scheme of the theme.`,
    files: []
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
Table, Bro is the Custom Element \`‹table-bro›\`: every framework that renders HTML elements renders it, without a wrapper package. A page gives the table its columns, rows and config by \`configure({cols, rows, conf})\`, listens to its \`bro-action\` events and sets its \`theme\` attribute; each framework does it in its own way. The pages of this section show it in Angular, whose package \`@table-bro/angular\` gives the component \`‹table-bro-ng›\` with inputs and outputs, and in Preact, React, Solid, Svelte and Vue, each with a working page of its sample project in the repository and StackBlitz. How each framework passes data and events to Custom Elements is tested by [Custom Elements Everywhere](https://custom-elements-everywhere.com/).

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

The steps of each skin; the component of the table is the same in all three.

##### Angular Material

${setupMat.text}

##### Vanilla Bootstrap

${setupNgBs.text}

##### Vanilla HTML

${setupNgNv.text}

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

Yes. The server render of Angular renders the table in its loading state, and the browser renders the table with its rows in the same element: the page shows the table before the application starts.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
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

  rows = signal<Order[]>([
    {
      description: 'Modern Cotton Chair',
      price: 100
    }, {
      description: 'Awesome Concrete Ball',
      price: 200
    }
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
Table, Bro is the Custom Element \`‹table-bro›\`, so a Preact app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, the prop \`onbro-action\` listens to its events, and the \`theme\` prop sets its theme. The page below is the [working page](https://table-bro.com/samples/frameworks/preact) of the sample project \`samples/frameworks/preact\` of the repository, with Preact 11; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/frameworks/preact) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Preact?

1. **Install the packages**

   The table engine \`@table-bro/core\` and a skin, \`@table-bro/native\` of plain HTML elements; \`@table-bro/bootstrap\` with \`bootstrap\` gives the skin of Bootstrap 5:

   {{install.sh}}

2. **Register the element and the skin**

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`nv\`. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call. Preact adds a listener for an event prop it does not know by the exact name after \`on\`, \`bro-action\` for \`onbro-action\` ([Preact, Web Components](https://preactjs.com/guide/v10/web-components/)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

\`"jsxImportSource": "preact"\` in \`tsconfig.json\` of the sample gives the JSX runtime of Preact to TypeScript and to Vite, without a plugin.

#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Preact, with the methods of \`TableBroHTMLElement\` and the prop \`onbro-action\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Preact need a wrapper for Custom Elements?

No. Preact passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Its package \`preact-custom-element\` also turns a Preact component into a Custom Element ([Preact, preact-custom-element](https://preactjs.com/guide/v10/preact-custom-element/)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does preact/compat change it?

No: \`‹table-bro›\` is an element of the DOM, the same in Preact and in React through \`preact/compat\`.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      frameworkInstall,
      frameworkSkin,
      frameworkOrders,
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

import {render} from 'preact';

import {OrdersTable} from './OrdersTable';

render(<OrdersTable />, document.getElementById('app')!);
`}
    ]
  },
  {
    path: 'frameworks/react',
    name: 'React data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a React 19 app renders it in JSX as it is, without a wrapper package. A ref gives the element its columns, rows and config by \`configure()\`, an effect adds the listener of its \`bro-action\` events, and the \`theme\` prop sets its theme. The page below is the [working page](https://table-bro.com/samples/frameworks/react) of the sample project \`samples/frameworks/react\` of the repository, with React 19.3; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/frameworks/react) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in React?

1. **Install the packages**

   The table engine \`@table-bro/core\` and a skin, \`@table-bro/native\` of plain HTML elements; \`@table-bro/bootstrap\` with \`bootstrap\` gives the skin of Bootstrap 5:

   {{install.sh}}

2. **Register the element and the skin**

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`nv\`. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is in the document: a ref gives the element, \`useEffect\` makes the call after the first render. The same effect adds the listener of \`bro-action\` and removes it at the end; the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

React 19 sets a prop of a custom element as a property when the element has a property of that name, and as an attribute otherwise ([React 19, Support for Custom Elements](https://react.dev/blog/2024/12/05/react-19)): \`theme\` is a property of \`‹table-bro›\`. \`"jsx": "react-jsx"\` in \`tsconfig.json\` of the sample gives the JSX runtime of React to TypeScript and to Vite.

#### How does TypeScript know the element?

JSX of React knows the HTML elements only; a declaration adds \`‹table-bro›\` with the methods of \`TableBroHTMLElement\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does React 19 need a wrapper for Custom Elements?

No. React 19 passes the props of a custom element as properties or attributes ([React, Custom HTML elements](https://react.dev/reference/react-dom/components#custom-html-elements)) and passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Table, Bro takes its data by \`configure()\` through a ref, which works in every version of React.

##### Can I listen to bro-action without a ref?

The sample uses \`addEventListener\` in an effect: it works in React 18 and 19 and removes the listener on unmount.

##### Does it work with Next.js?

The table renders in the browser: \`configure()\` runs in an effect, so a client component (\`'use client'\`) works, and the server render leaves the element empty.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      frameworkInstall,
      frameworkSkin,
      frameworkOrders,
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

    element.configure({cols, rows, conf});
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

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {OrdersTable} from './OrdersTable';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <OrdersTable />
  </StrictMode>
);
`}
    ]
  },
  {
    path: 'frameworks/solid',
    name: 'Solid data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Solid app renders it in JSX as it is. A ref gives the element its columns, rows and config by \`configure()\`, \`on:bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The page below is the [working page](https://table-bro.com/samples/frameworks/solid) of the sample project \`samples/frameworks/solid\` of the repository, with Solid 1.9; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/frameworks/solid) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Solid?

1. **Install the packages**

   The table engine \`@table-bro/core\` and a skin, \`@table-bro/native\` of plain HTML elements; \`@table-bro/bootstrap\` with \`bootstrap\` gives the skin of Bootstrap 5:

   {{install.sh}}

2. **Register the element and the skin**

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`nv\`. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`ref\` gives the element ([Solid, ref](https://docs.solidjs.com/reference/jsx-attributes/ref)), \`onMount\` makes the call. \`on:bro-action\` adds the listener of the event by its exact name ([Solid, on:*](https://docs.solidjs.com/reference/jsx-attributes/on)); the sample logs the name of each action. \`src/OrdersTable.tsx\`:

{{src/OrdersTable.tsx}}

\`vite-plugin-solid\` compiles the JSX of Solid, and \`"jsx": "preserve"\` with \`"jsxImportSource": "solid-js"\` in \`tsconfig.json\` gives its types to TypeScript. \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

#### How does TypeScript know the element?

A declaration adds \`‹table-bro›\` to the JSX of Solid, with the methods of \`TableBroHTMLElement\`, and \`bro-action\` to its events of \`on:\`. \`src/elements.d.ts\`:

{{src/elements.d.ts}}

#### How do I render it?

\`src/main.tsx\` imports the skin before the tables:

{{src/main.tsx}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Solid need a wrapper for Custom Elements?

No. Solid passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); \`on:\` listens to an event by its exact name, as \`bro-action\`. Its package \`solid-element\` also turns a Solid component into a Custom Element ([Solid, solid-element](https://www.npmjs.com/package/solid-element)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref, as in an effect of a signal of the rows.

##### Does it work with SolidStart?

The element needs the browser: \`onMount\` runs only there, so the server render leaves the element empty and the browser fills it.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      frameworkInstall,
      frameworkSkin,
      frameworkOrders,
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

import {render} from 'solid-js/web';

import {OrdersTable} from './OrdersTable';

render(() => <OrdersTable />, document.getElementById('app')!);
`}
    ]
  },
  {
    path: 'frameworks/svelte',
    name: 'Svelte data table',
    text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a Svelte 5 app renders it in markup as it is. \`bind:this\` gives the element its columns, rows and config by \`configure()\`, the attribute \`onbro-action\` listens to its events, and the \`theme\` attribute sets its theme. The page below is the [working page](https://table-bro.com/samples/frameworks/svelte) of the sample project \`samples/frameworks/svelte\` of the repository, with Svelte 5.57; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/frameworks/svelte) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Svelte?

1. **Install the packages**

   The table engine \`@table-bro/core\` and a skin, \`@table-bro/native\` of plain HTML elements; \`@table-bro/bootstrap\` with \`bootstrap\` gives the skin of Bootstrap 5:

   {{install.sh}}

2. **Register the element and the skin**

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`nv\`. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`bind:this\` gives the element ([Svelte, bind:this](https://svelte.dev/docs/svelte/bind)), \`onMount\` makes the call ([Svelte, Lifecycle hooks](https://svelte.dev/docs/svelte/lifecycle-hooks)). An attribute that starts with \`on\` adds a listener of the event of its name, \`bro-action\` for \`onbro-action\` ([Svelte, Events](https://svelte.dev/docs/svelte/basic-markup)); the sample logs the name of each action. \`src/OrdersTable.svelte\`:

{{src/OrdersTable.svelte}}

#### How do I render it?

\`src/main.ts\` imports the skin before the tables. A project of \`npm create vite@latest\` with the Svelte template needs no other setup for \`‹table-bro›\`:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Svelte need a wrapper for Custom Elements?

No. Svelte passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/). Svelte also compiles its own components into Custom Elements ([Svelte, Custom elements](https://svelte.dev/docs/svelte/custom-elements)).

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same element.

##### Does it work with SvelteKit?

The element needs the browser: \`onMount\` runs only there, so the server render of SvelteKit leaves the element empty and the browser fills it.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
    files: [
      frameworkInstall,
      frameworkSkin,
      frameworkOrders,
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
Table, Bro is the Custom Element \`‹table-bro›\`, so a Vue 3 app renders it in a template once the compiler knows the tag: \`compilerOptions.isCustomElement\` of \`@vitejs/plugin-vue\`. A template ref gives the element its columns, rows and config by \`configure()\`, \`@bro-action\` listens to its events, and the \`theme\` attribute sets its theme. The page below is the [working page](https://table-bro.com/samples/frameworks/vue) of the sample project \`samples/frameworks/vue\` of the repository, with Vue 3.5; [StackBlitz](https://stackblitz.com/github/table-bro/table-bro/tree/main/samples/frameworks/vue) opens it in the browser.

<!-- setup -->
#### How do I install Table, Bro in Vue?

1. **Install the packages**

   The table engine \`@table-bro/core\` and a skin, \`@table-bro/native\` of plain HTML elements; \`@table-bro/bootstrap\` with \`bootstrap\` gives the skin of Bootstrap 5:

   {{install.sh}}

2. **Register the element and the skin**

   Once, before the tables: the import of the skin defines \`‹table-bro›\` and registers the skin \`nv\`. The CSS of the core and of the skin come as imports, which [Vite](https://vite.dev/guide/features) and the other bundlers take. \`src/skin.ts\`:

   {{src/skin.ts}}

3. **Describe the columns, the rows and the config**

   \`conf.skin\` names the registered skin. \`src/orders.ts\`:

   {{src/orders.ts}}

#### How do I tell Vue that table-bro is a Custom Element?

Without it, Vue resolves \`‹table-bro›\` as a component of the app and warns that it fails. \`isCustomElement\` of the template compiler skips the tags of Table, Bro ([Vue, Using Custom Elements in Vue](https://vuejs.org/guide/extras/web-components.html)). \`vite.config.ts\`:

{{vite.config.ts}}

\`mergeConfig\` adds \`sample-page.config.ts\` of the sample, the source maps and the readable code of its working page; a project of its own exports \`defineConfig()\` with the plugins alone.

#### How do I pass cols, rows and conf?

The columns, the rows and the config go to the table in one call, \`configure({cols, rows, conf})\`, once the element is mounted: \`useTemplateRef\` gives the element, \`onMounted\` makes the call. \`@bro-action\` adds the listener of the event, which logs the name of each action, and \`theme\` sets the theme; a binding \`:theme\` goes to the property \`theme\` of the element, since Vue sets a binding of a custom element as a property when the element has it. \`src/OrdersTable.vue\`:

{{src/OrdersTable.vue}}

#### How do I render it?

\`src/main.ts\` imports the skin before the tables:

{{src/main.ts}}

#### How do I switch the theme?

The \`theme\` attribute or property of the table is \`'light'\`, \`'dark'\` or \`'auto'\`, which follows the color scheme of the system; the attribute wins over \`config.theme\`. The sample sets \`'auto'\`, as a table without the attribute does; a variable of the state bound to it switches the theme, and the table puts the class \`bro-dark-theme\` or \`bro-light-theme\` on itself. More in [Dark/Light mode](https://table-bro.com/docs/design/dark-light-mode).

#### Questions

##### Does Vue need a wrapper for Custom Elements?

No. Vue passes all 32 tests of [Custom Elements Everywhere](https://custom-elements-everywhere.com/); it only needs \`isCustomElement\` for the tags of Table, Bro.

##### Can I bind cols and rows as props?

The table takes its data by \`configure()\`, one call for the columns, the rows and the config. New rows go by \`replaceRows(rows)\` on the same ref.

##### Does it work with Nuxt?

The element needs the browser: render the component on the client, as \`‹ClientOnly›\` does; \`isCustomElement\` goes to \`vue.compilerOptions\` of \`nuxt.config.ts\`.

#### Related

[Getting started](https://table-bro.com/docs/getting-started), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte).`,
    files: [
      frameworkInstall,
      frameworkSkin,
      frameworkOrders,
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
      {file: 'src/main.ts', language: 'ts', code: `// The skin is registered before the tables
import './skin';

import {createApp} from 'vue';

import OrdersTable from './OrdersTable.vue';

createApp(OrdersTable).mount('#app');
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

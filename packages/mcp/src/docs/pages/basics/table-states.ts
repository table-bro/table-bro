import type {BroDocPage} from '../../pages.js';

/** The page basics/table-states of Docs. */
export const tableStatesPage: BroDocPage = {
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
};

import type {BroDocPage} from '../../pages.js';

/** The page design/material-design of Docs. */
export const materialDesignPage: BroDocPage = {
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
};

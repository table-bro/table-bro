import type {BroDocPage} from '../../pages.js';

/** The page design/your-own-skin of Docs. */
export const yourOwnSkinPage: BroDocPage = {
  path: 'design/your-own-skin',
  name: 'Your own skin',
  text: `<!-- intro -->
A skin gives the table the look and the controls of a UI library: the classes of the parts of the table, the Custom Elements of its controls and its CSS. The skins of Table, Bro are built this way, and a skin of your design system, or of the component library of your framework, is built the same way. Start from Vanilla HTML, \`nv\`: plain HTML elements without a UI library, the reference of the parts of a skin.

<!-- setup -->
#### What a skin defines

1. **The config**

   \`BroSkinConfig\` holds the classes of the parts of the table in \`css\`, as the rows and the cells, and the Custom Elements of its controls in \`components\`, each by its \`selector\`: the toolbar, the search line, the sort header, the paginator, the progress bar, the buttons and the dropdowns. \`themeAttribute\` names the attribute of the color mode of your UI library, as \`data-bs-theme\` of Bootstrap, which the table sets on its host to \`light\` or \`dark\`. \`defineElements(registry)\` defines the elements of the skin in a registry of custom elements.

2. **The elements**

   The elements extend \`BroHTMLElement\` of \`@table-bro/core\`, so their module loads without a DOM. The table creates each element by its selector, sets its attributes and properties, and measures it at once: an element renders its markup when it connects. The attributes, the properties and the events of each element are in the skill \`create-skin\` below.

3. **The styles**

   The table puts the name of the skin on its host as a class, and the CSS of the skin applies under that class. The CSS also declares the sizes and the timings of the table as CSS variables, as \`--bro-row-height\`: the table reads them at render and has no defaults of its own, so a table needs the CSS of its skin. The SCSS of Vanilla HTML writes its rules under \`$bro-skin\`, the class of the skin, set in its \`_variables.scss\`: a copy of it with the class of your skin is a start.

#### Register the skin

This skin takes the config \`nativeSkinConfig\` of \`@table-bro/native\`, with the elements of Vanilla HTML, and gives the parts of the table the classes of a design system. \`registerSkin(name, config)\` of \`@table-bro/core\` registers it once, before the tables, and \`conf: {skin: 'brand'}\` of a table names it:

{{brand-skin.ts}}

To change a part of a shipped skin for one table, \`config.components\` and \`config.css\` of that table are enough: they change any value or function of the config of the skin.

#### Server-side rendering

\`prerenderTableBro()\` defines the elements of the skin in the server DOM by \`defineElements(registry)\` of its config, and the elements render their markup there without the scripts of the browser. In the browser an element keeps that markup while \`isPrerendered(this)\`, until the table renders in its place. Vanilla HTML gives \`defineElements()\` in its package, so a skin on its elements prerenders as it does. A skin on the components of a framework gives it in a server entry of its own, \`@table-bro/<package>/server\`, which renders the components with the server render of the framework, as \`@table-bro/react-mui/server\` does with \`react-dom/server\`. More in [Prerender function](https://table-bro.com/docs/ssr/prerendering).

#### With an AI coding agent

The repository holds the skill \`create-skin\`, [.agents/skills/create-skin/SKILL.md](https://github.com/table-bro/table-bro/blob/main/.agents/skills/create-skin/SKILL.md): with it an AI coding agent in a clone of the repository builds a skin on the components of your library, with its package, its elements and their contract with the table, its theme, its styles, a sample and the checks. React MUI, \`mui\`, is its reference.

#### Related

[Create your own skin](https://github.com/table-bro/table-bro#create-your-own-skin) in the README of the repository, the README of [Vanilla HTML](https://github.com/table-bro/table-bro/tree/main/packages/skins/native), [Material design](https://table-bro.com/docs/design/material-design), [Bootstrap design](https://table-bro.com/docs/design/bootstrap-design), [Frameworks](https://table-bro.com/docs/frameworks).`,
  files: [
    {file: 'brand-skin.ts', language: 'ts', code: `// The import of @table-bro/native registers the skin nv and defines its elements, which the skin brand takes
import {registerSkin}     from '@table-bro/core';
import {nativeSkinConfig} from '@table-bro/native';

// The elements of Vanilla HTML with the classes of the design system on the parts of the table
registerSkin('brand', {
  ...nativeSkinConfig,
  css: {
    ...nativeSkinConfig.css,
    table: {
      thead: {tr: {className: 'bro-header-row brand-header-row', th: {className: 'bro-header-cell brand-header-cell'}}},
      tbody: {tr: {className: 'bro-row brand-row', td: {className: 'bro-cell brand-cell'}}}
    },
    shadow: {className: 'brand-shadow'}
  }
});
`}
  ]
};

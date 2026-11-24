import type {BroDocPage}                                                                                 from '../../pages.js';
import {mcpInstall, mcpSection, noBuildApp, noBuildIndex, setupBs, setupNv, skinsSection, vanillaOrders} from '../shared.js';

/** The page frameworks/vanilla of Docs. */
export const vanillaPage: BroDocPage = {
  path: 'frameworks/vanilla',
  name: 'Vanilla JS data table',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`, so a page without a framework creates it as any HTML element: \`configure()\` gives it its columns, rows and config, \`addEventListener()\` listens to its \`bro-action\` events, and the \`theme\` attribute sets its theme. Two skins need no framework: Vanilla Bootstrap, the table on the classes and the components of Bootstrap 5, and Vanilla HTML, plain HTML elements, the reference skin to start your own from. The [working page](https://table-bro.com/samples/bootstrap) is the sample project \`samples/bootstrap\` of the repository, built by Vite, and the [working page of Vanilla HTML](https://table-bro.com/samples/native) is \`samples/native\`; a page without a build takes the same packages from a CDN.

<!-- setup -->
#### How do I install Table, Bro in Vanilla JS?

${mcpSection('#####')}

##### Install manually

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

#### How do I start a skin of my own?

From Vanilla HTML: its plain HTML elements are the parts of a skin with no UI library around them. A skin of your design system takes its config \`nativeSkinConfig\` of \`@table-bro/native\`, gives the parts of the table your classes or replaces its elements with Custom Elements of your components, and registers it under a name of its own, as \`registerSkin('brand', brandSkinConfig)\`; on this page \`conf: {skin: 'brand'}\` then takes the place of \`'nv'\`. [Your own skin](https://table-bro.com/docs/design/your-own-skin) describes the config, the elements, the styles and the server render of a skin.

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

[Getting started](https://table-bro.com/docs/getting-started), [Your own skin](https://table-bro.com/docs/design/your-own-skin), [Custom content in tables using Custom Elements](https://table-bro.com/docs/design/custom-content), [MCP server for AI coding agents](https://table-bro.com/docs/ai/mcp-server), [Prerender function](https://table-bro.com/docs/ssr/prerendering), [Angular data table](https://table-bro.com/docs/frameworks/angular), [Preact data table](https://table-bro.com/docs/frameworks/preact), [React data table](https://table-bro.com/docs/frameworks/react), [Solid data table](https://table-bro.com/docs/frameworks/solid), [Svelte data table](https://table-bro.com/docs/frameworks/svelte), [Vue 3 data table](https://table-bro.com/docs/frameworks/vue).`,
  files: [
    mcpInstall,
    ...setupBs.files,
    ...setupNv.files,
    noBuildIndex,
    noBuildApp,
    vanillaOrders
  ]
};

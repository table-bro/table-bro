import type {BroDocPage} from '../../pages.js';
import {angularPage}     from './angular.js';
import {preactPage}      from './preact.js';
import {reactPage}       from './react.js';
import {solidPage}       from './solid.js';
import {sveltePage}      from './svelte.js';
import {vanillaPage}     from './vanilla.js';
import {vuePage}         from './vue.js';

/** The page frameworks of Docs. */
export const frameworksPage: BroDocPage = {
  path: 'frameworks',
  name: 'Frameworks',
  text: `<!-- intro -->
Table, Bro is the Custom Element \`‹table-bro›\`: every framework that renders HTML elements renders it, without a wrapper package. A page gives the table its columns, rows and config by \`configure({cols, rows, conf})\`, listens to its \`bro-action\` events and sets its \`theme\` attribute; each framework does it in its own way. The pages of this section show it in Angular, whose package \`@table-bro/angular\` gives the component \`‹table-bro-ng›\` with inputs and outputs, in Preact, React, Solid, Svelte and Vue, each with a working page of its sample project in the repository and StackBlitz in the Bootstrap skin, and in Vanilla JS, without a framework; [a skin of your own](https://table-bro.com/docs/design/your-own-skin) design system or UI components works in each of them the same way. How each framework passes data and events to Custom Elements is tested by [Custom Elements Everywhere](https://custom-elements-everywhere.com/).

<!-- polymer -->
#### Polymer and Lit

Polymer and Lit build Custom Elements themselves, so their templates render \`‹table-bro›\` as any HTML element, without a wrapper: the code of the element calls \`configure()\` of the table and listens to its \`bro-action\` events as of any element ([Polymer, Custom element concepts](https://polymer-library.polymer-project.org/3.0/docs/devguide/custom-elements), [Lit, What is Lit?](https://lit.dev/docs/)).`,
  files: []
};

/** The pages of the section Frameworks of Docs, in the order of the menu of Docs. */
export const frameworksPages: BroDocPage[] = [frameworksPage, angularPage, preactPage, reactPage, solidPage, sveltePage, vuePage, vanillaPage];

import {BroSwitchComponent}       from './bootstrap-based/bro-switch';
import {BroToolbarComponent}      from './bootstrap-based/toolbar/bro-toolbar';
import {BroToolbarMainComponent}  from './bootstrap-based/toolbar/bro-toolbar-main';
import {BroButtonComponent}       from './bro-button';
import {BroTextEllipsisComponent} from './bro-text-ellipsis';
import {BroSortHeaderComponent}   from './material-based/bro-sort-header';
import {BroPaginatorComponent}    from './material-based/paginator/bro-paginator';

/** The elements that the bs and nv skins share. */
const sharedElements: Record<string, CustomElementConstructor> = {
  'bro-button': BroButtonComponent,
  'bro-paginator': BroPaginatorComponent,
  'bro-sort-header': BroSortHeaderComponent,
  'bro-text-ellipsis': BroTextEllipsisComponent,
  'bro-toolbar': BroToolbarComponent,
  'bro-toolbar-main': BroToolbarMainComponent
};

/**
 * Defines the optional element bro-switch, a boolean of a column as a switch, unless it is defined; without a DOM, as
 * in the server render, it does nothing.
 */
export function withSwitch(): void {
  defineElement('bro-switch', BroSwitchComponent);
}

/** Defines an element of a skin unless it is defined: a second load of the bundle of the skin finds it defined. */
export function defineElement(name: string, element: CustomElementConstructor): void {
  if (typeof customElements !== 'undefined' && !customElements.get(name)) {
    customElements.define(name, element);
  }
}

/**
 * Defines the shared elements of a vanilla skin. Each skin bundle carries its own copy of them, so with two bundles
 * on one page the bundle loaded first defines them and the other skin works with its classes. Two vanilla skin
 * bundles on one page are not supported, so the skin loaded second warns about it.
 */
export function defineSharedElements(skinPackage: string): void {
  const definedElsewhere: string[] = [];

  Object.entries(sharedElements).forEach(([name, element]) => {
    const defined = customElements.get(name);

    if (!defined) {
      customElements.define(name, element);
    } else if (defined !== element) {
      definedElsewhere.push(name);
    }
  });

  if (definedElsewhere.length) {
    console.warn(`${skinPackage}: ${definedElsewhere.join(', ')} are already defined by another vanilla skin bundle, `
      + 'so this skin uses its elements. Load one vanilla skin bundle per page.');
  }
}

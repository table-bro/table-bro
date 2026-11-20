import {registerSkin} from '@table-bro/core';

import {type JSX, sharedConfig}                         from 'solid-js';
import {getAssets, renderToString, resolveSSRNode, ssr} from 'solid-js/web';

import {BroSuidButtonComponent}                                                              from './bro-button.solid-suid';
import {BroSuidDropdownComponent}                                                            from './bro-dropdown.solid-suid';
import {BroSuidProgressBarComponent}                                                         from './bro-progress-bar.solid-suid';
import {setServerRender}                                                                     from './bro-suid-element';
import {BroSuidSwitchComponent}                                                              from './bro-switch.solid-suid';
import {BroSuidTagsComponent}                                                                from './bro-tags.solid-suid';
import {BroSuidPaginatorComponent, BroSuidSortHeaderComponent, BroSuidTextEllipsisComponent} from './bro-vanilla-based.solid-suid';
import {suidSkinConfig}                                                                      from './table-bro.solid-suid.config';
import {BroSuidToolbarMainComponent}                                                         from './toolbar/bro-toolbar-main.solid-suid';
import {BroSuidToolbarComponent}                                                             from './toolbar/bro-toolbar.solid-suid';

// The server entry of the skin: the prerender of a table on the server (prerenderTableBro of @table-bro/core) defines
// the elements of the skin in its server DOM, and they render the components of SUID to markup by renderToString of
// Solid, with the styles of SUID in it. A server bundle resolves solid-js to the server build of Solid and compiles the
// JSX of SUID for the server, as the plugin of Solid does with its option ssr. The server DOM gives its HTMLElement to
// the global scope before the import, as the elements extend it. Only the server imports this entry

/** The elements of the skin, the optional ones too: a table of the server uses the ones its columns name. */
const elements: Record<string, CustomElementConstructor> = {
  'bro-suid-button': BroSuidButtonComponent,
  'bro-suid-dropdown': BroSuidDropdownComponent,
  'bro-suid-paginator': BroSuidPaginatorComponent,
  'bro-suid-progress-bar': BroSuidProgressBarComponent,
  'bro-suid-sort-header': BroSuidSortHeaderComponent,
  'bro-suid-switch': BroSuidSwitchComponent,
  'bro-suid-tags': BroSuidTagsComponent,
  'bro-suid-text-ellipsis': BroSuidTextEllipsisComponent,
  'bro-suid-toolbar': BroSuidToolbarComponent,
  'bro-suid-toolbar-main': BroSuidToolbarMainComponent
};

/**
 * The next id of the components of SUID in the renders of the server: SUID names the class of each style by the id of
 * its component, so the ids go on from render to render, and they are numbers, which SUID turns into the names.
 */
let nextId: number = 1e8;

// Each render of an element carries the styles of SUID it uses, which SUID gives as the assets of the render. They go
// without their ids: SUID in the browser takes a style element of its id for its own components, and the prerendered
// element goes with its styles. The render has a context of its own without hydration, whose ids of components go on
// from the previous render, and gives back the context of a render of the application around the prerender, as of the
// page of a SolidStart route
setServerRender((tree: () => JSX.Element): string => {
  const outer = sharedConfig.context;
  const contextId = sharedConfig.getNextContextId;

  sharedConfig.getNextContextId = () => String(nextId++);

  try {
    return renderToString(() => {
      // The context of the server build has the switch of hydration that NoHydration sets, which the types of the
      // browser build do not name
      (<{noHydrate?: boolean}><unknown>sharedConfig.context).noHydrate = true;

      const markup = resolveSSRNode(tree());

      return ssr([getAssets().replace(/(<style\b[^>]*?) id="[^"]*"/g, '$1') + markup]);
    });
  } finally {
    sharedConfig.context = outer;
    sharedConfig.getNextContextId = contextId;
  }
});

registerSkin('suid', {
  ...suidSkinConfig,
  defineElements: (registry: CustomElementRegistry): void => {
    Object.entries(elements).forEach(([name, element]) => {
      if (!registry.get(name)) {
        registry.define(name, element);
      }
    });
  }
});

export * from './table-bro.solid-suid';

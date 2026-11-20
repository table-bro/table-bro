import {registerSkin} from '@table-bro/core';

import {type AppContext, type ComponentInternalInstance, ssrContextKey, type VNode} from 'vue';
import {type SSRContext, ssrRenderVNode}                                            from 'vue/server-renderer';

import {BroVuetifyButtonComponent}       from './bro-button.vue-vuetify';
import {BroVuetifyPaginatorComponent}    from './bro-paginator.vue-vuetify';
import {BroVuetifyProgressBarComponent}  from './bro-progress-bar.vue-vuetify';
import {BroVuetifySortHeaderComponent}   from './bro-sort-header.vue-vuetify';
import {BroVuetifySwitchComponent}       from './bro-switch.vue-vuetify';
import {BroVuetifyTagsComponent}         from './bro-tags.vue-vuetify';
import {BroVuetifyTextEllipsisComponent} from './bro-text-ellipsis.vue-vuetify';
import {setServerRender}                 from './bro-vuetify-element';
import {vuetifySkinConfig}               from './table-bro.vue-vuetify.config';
import {BroVuetifyToolbarMainComponent}  from './toolbar/bro-toolbar-main.vue-vuetify';
import {BroVuetifyToolbarComponent}      from './toolbar/bro-toolbar.vue-vuetify';

// The server entry of the skin: the prerender of a table on the server (prerenderTableBro of @table-bro/core) defines
// the elements of the skin in its server DOM, and they render the components of Vuetify to markup by the server render
// of Vue. The server DOM gives its HTMLElement to the global scope before the import, as the elements extend it. The
// bundle of the browser does not carry the server render of Vue: only the server imports this entry

/** The elements of the skin, the optional ones too: a table of the server uses the ones its columns name. */
const elements: Record<string, CustomElementConstructor> = {
  'bro-vuetify-button': BroVuetifyButtonComponent,
  'bro-vuetify-paginator': BroVuetifyPaginatorComponent,
  'bro-vuetify-progress-bar': BroVuetifyProgressBarComponent,
  'bro-vuetify-sort-header': BroVuetifySortHeaderComponent,
  'bro-vuetify-switch': BroVuetifySwitchComponent,
  'bro-vuetify-tags': BroVuetifyTagsComponent,
  'bro-vuetify-text-ellipsis': BroVuetifyTextEllipsisComponent,
  'bro-vuetify-toolbar': BroVuetifyToolbarComponent,
  'bro-vuetify-toolbar-main': BroVuetifyToolbarMainComponent
};

/** A part of the markup of the server render of Vue: a string, a nested buffer, or a promise of an asynchronous part. */
type BroSsrItem = string | BroSsrItem[] | Promise<unknown>;

/**
 * Joins the markup of a buffer of the server render of Vue. The prerender of the table renders its elements at once,
 * and the components of the skin render synchronously, so the buffer has no promise: a promise, as of an asynchronous
 * setup, fails the render.
 * @param items - the parts of the markup
 */
function markup(items: BroSsrItem[]): string {
  return items.map(item => {
    if (typeof item === 'string') {
      return item;
    }

    if (Array.isArray(item)) {
      return markup(item);
    }

    throw new Error('Table, Bro: the server render of the skin vuetify takes components that render synchronously');
  }).join('');
}

// The server render of Vue that renderToString runs, without its promise: ssrRenderVNode renders the root of an element
// in the context of the app of the skin into a buffer, which the components of Vuetify fill synchronously. Each render
// has a context of the server render of its own, as renderToString gives it, and stops the watchers of its components
setServerRender((root: VNode): string => {
  const context: SSRContext = {};
  const appContext = root.appContext!;
  const items: BroSsrItem[] = [];

  root.appContext = <AppContext>{...appContext, provides: {...appContext.provides, [ssrContextKey]: context}};
  ssrRenderVNode(item => items.push(<BroSsrItem>item), root, <ComponentInternalInstance><unknown>null);
  (<{__watcherHandles?: (() => void)[]}>context).__watcherHandles?.forEach(stop => stop());

  return markup(items);
});

registerSkin('vuetify', {
  ...vuetifySkinConfig,
  defineElements: (registry: CustomElementRegistry): void => {
    Object.entries(elements).forEach(([name, element]) => {
      if (!registry.get(name)) {
        registry.define(name, element);
      }
    });
  }
});

export * from './table-bro.vue-vuetify';

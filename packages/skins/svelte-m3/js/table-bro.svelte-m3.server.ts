import {registerSkin} from '@table-bro/core';

import type {Component} from 'svelte';
import {render}         from 'svelte/server';

import {BroM3SvelteButtonComponent}             from './bro-button.svelte-m3';
import {type BroM3SvelteProps, setServerRender} from './bro-m3-svelte-element';
import {BroM3SveltePaginatorComponent}          from './bro-paginator.svelte-m3';
import {BroM3SvelteProgressBarComponent}        from './bro-progress-bar.svelte-m3';
import {BroM3SvelteSortHeaderComponent}         from './bro-sort-header.svelte-m3';
import {BroM3SvelteSwitchComponent}             from './bro-switch.svelte-m3';
import {BroM3SvelteTagsComponent}               from './bro-tags.svelte-m3';
import {BroM3SvelteTextEllipsisComponent}       from './bro-text-ellipsis.svelte-m3';
import {m3SvelteSkinConfig}                     from './table-bro.svelte-m3.config';
import {BroM3SvelteToolbarMainComponent}        from './toolbar/bro-toolbar-main.svelte-m3';
import {BroM3SvelteToolbarComponent}            from './toolbar/bro-toolbar.svelte-m3';

// The server entry of the skin: the prerender of a table on the server (prerenderTableBro of @table-bro/core) defines
// the elements of the skin in its server DOM, and they render the components of M3 Svelte to markup by render() of
// svelte/server, which is synchronous. The server DOM gives its HTMLElement to the global scope before the import, as the
// elements extend it. The bundle of the browser does not carry svelte/server: only the server imports this entry. The
// bundler of the server compiles the components of M3 Svelte for the server, as it compiles the ones of the application

/** The elements of the skin, the optional ones too: a table of the server uses the ones its columns name. */
const elements: Record<string, CustomElementConstructor> = {
  'bro-m3-svelte-button': BroM3SvelteButtonComponent,
  'bro-m3-svelte-paginator': BroM3SveltePaginatorComponent,
  'bro-m3-svelte-progress-bar': BroM3SvelteProgressBarComponent,
  'bro-m3-svelte-sort-header': BroM3SvelteSortHeaderComponent,
  'bro-m3-svelte-switch': BroM3SvelteSwitchComponent,
  'bro-m3-svelte-tags': BroM3SvelteTagsComponent,
  'bro-m3-svelte-text-ellipsis': BroM3SvelteTextEllipsisComponent,
  'bro-m3-svelte-toolbar': BroM3SvelteToolbarComponent,
  'bro-m3-svelte-toolbar-main': BroM3SvelteToolbarMainComponent
};

setServerRender((component: Component<never>, props: BroM3SvelteProps): string => render(<Component<BroM3SvelteProps>><unknown>component, {props}).body);

registerSkin('m3-svelte', {
  ...m3SvelteSkinConfig,
  defineElements: (registry: CustomElementRegistry): void => {
    Object.entries(elements).forEach(([name, element]) => {
      if (!registry.get(name)) {
        registry.define(name, element);
      }
    });
  }
});

export * from './table-bro.svelte-m3';

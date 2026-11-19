import {registerSkin} from '@table-bro/core';

import createCache                     from '@emotion/cache';
import {CacheProvider}                 from '@emotion/react';
import {createElement, type ReactNode} from 'react';
import {renderToString}                from 'react-dom/server';

import {BroMuiButtonComponent}       from './bro-button.react-mui';
import {setServerRender}             from './bro-mui-element';
import {BroMuiPaginatorComponent}    from './bro-paginator.react-mui';
import {BroMuiProgressBarComponent}  from './bro-progress-bar.react-mui';
import {BroMuiSortHeaderComponent}   from './bro-sort-header.react-mui';
import {BroMuiSwitchComponent}       from './bro-switch.react-mui';
import {BroMuiTagsComponent}         from './bro-tags.react-mui';
import {BroMuiTextEllipsisComponent} from './bro-text-ellipsis.react-mui';
import {muiSkinConfig}               from './table-bro.react-mui.config';
import {BroMuiToolbarMainComponent}  from './toolbar/bro-toolbar-main.react-mui';
import {BroMuiToolbarComponent}      from './toolbar/bro-toolbar.react-mui';

// The server entry of the skin: the prerender of a table on the server (prerenderTableBro of @table-bro/core) defines
// the elements of the skin in its server DOM, and they render the components of MUI to markup by renderToString, with
// the styles of Emotion in it. The server DOM gives its HTMLElement to the global scope before the import, as the
// elements extend it. The bundle of the browser does not carry react-dom/server: only the server imports this entry

/** The elements of the skin, the optional ones too: a table of the server uses the ones its columns name. */
const elements: Record<string, CustomElementConstructor> = {
  'bro-mui-button': BroMuiButtonComponent,
  'bro-mui-paginator': BroMuiPaginatorComponent,
  'bro-mui-progress-bar': BroMuiProgressBarComponent,
  'bro-mui-sort-header': BroMuiSortHeaderComponent,
  'bro-mui-switch': BroMuiSwitchComponent,
  'bro-mui-tags': BroMuiTagsComponent,
  'bro-mui-text-ellipsis': BroMuiTextEllipsisComponent,
  'bro-mui-toolbar': BroMuiToolbarComponent,
  'bro-mui-toolbar-main': BroMuiToolbarMainComponent
};

// Each render of an element carries the styles of MUI it uses: a cache of Emotion of its own leaves out no style that
// an earlier render, as of the next request of the server or of the element before its inputs, has carried
setServerRender((tree: ReactNode): string => renderToString(createElement(CacheProvider, {value: createCache({key: 'css'})}, tree)));

registerSkin('mui', {
  ...muiSkinConfig,
  defineElements: (registry: CustomElementRegistry): void => {
    Object.entries(elements).forEach(([name, element]) => {
      if (!registry.get(name)) {
        registry.define(name, element);
      }
    });
  }
});

export * from './table-bro.react-mui';

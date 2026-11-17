import {registerSkin} from '@table-bro/core';

import {BroMuiButtonComponent}                                from './bro-button.react-mui';
import {defineElement}                                        from './bro-mui-element';
import {BroMuiPaginatorComponent}                             from './bro-paginator.react-mui';
import {BroMuiProgressBarComponent}                           from './bro-progress-bar.react-mui';
import {BroMuiSortHeaderComponent}                            from './bro-sort-header.react-mui';
import {BroMuiSwitchComponent}                                from './bro-switch.react-mui';
import {BroMuiTagsComponent, type BroTagsTexts, setTagsTexts} from './bro-tags.react-mui';
import {BroMuiTextEllipsisComponent}                          from './bro-text-ellipsis.react-mui';
import {muiSkinConfig}                                        from './table-bro.react-mui.config';
import {BroMuiToolbarMainComponent}                           from './toolbar/bro-toolbar-main.react-mui';
import {BroMuiToolbarComponent}                               from './toolbar/bro-toolbar.react-mui';

// The elements render React roots, so they are defined only in the browser: imported without a DOM, as in the server
// render, the skin only registers its config, and a prerender leaves its elements empty. The optional elements, tags
// and switch, come with withTags() and withSwitch()
defineElement('bro-mui-button', BroMuiButtonComponent);
defineElement('bro-mui-paginator', BroMuiPaginatorComponent);
defineElement('bro-mui-progress-bar', BroMuiProgressBarComponent);
defineElement('bro-mui-sort-header', BroMuiSortHeaderComponent);
defineElement('bro-mui-text-ellipsis', BroMuiTextEllipsisComponent);
defineElement('bro-mui-toolbar', BroMuiToolbarComponent);
defineElement('bro-mui-toolbar-main', BroMuiToolbarMainComponent);

registerSkin('mui', muiSkinConfig);

/**
 * Defines the optional element bro-mui-tags, the items of a column as the chips of MUI, unless it is defined; without
 * a DOM, as in the server render, it does nothing. A page without the call does not carry the code of the chips.
 * @param options - the texts of the tags, as {texts: {empty: 'No tags'}}; setTagsTexts() changes them later
 * @param options.texts - the texts of the tags
 */
export function withTags(options: {texts?: Partial<BroTagsTexts>} = {}): void {
  setTagsTexts(options.texts ?? {});
  defineElement('bro-mui-tags', BroMuiTagsComponent);
}

/**
 * Defines the optional element bro-mui-switch, a boolean of a column as the switch of MUI, unless it is defined;
 * without a DOM, as in the server render, it does nothing.
 */
export function withSwitch(): void {
  defineElement('bro-mui-switch', BroMuiSwitchComponent);
}

export *                   from './table-bro.react-mui.config';
export {setMuiTheme}       from './bro-mui-element';
export {setTagsTexts}      from './bro-tags.react-mui';
export type {BroTagsTexts} from './bro-tags.react-mui';

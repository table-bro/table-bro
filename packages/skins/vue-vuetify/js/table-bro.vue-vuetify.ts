import {registerSkin} from '@table-bro/core';

import {BroVuetifyButtonComponent}                                from './bro-button.vue-vuetify';
import {BroVuetifyPaginatorComponent}                             from './bro-paginator.vue-vuetify';
import {BroVuetifyProgressBarComponent}                           from './bro-progress-bar.vue-vuetify';
import {BroVuetifySortHeaderComponent}                            from './bro-sort-header.vue-vuetify';
import {BroVuetifySwitchComponent}                                from './bro-switch.vue-vuetify';
import {type BroTagsTexts, BroVuetifyTagsComponent, setTagsTexts} from './bro-tags.vue-vuetify';
import {BroVuetifyTextEllipsisComponent}                          from './bro-text-ellipsis.vue-vuetify';
import {defineElement}                                            from './bro-vuetify-element';
import {vuetifySkinConfig}                                        from './table-bro.vue-vuetify.config';
import {BroVuetifyToolbarMainComponent}                           from './toolbar/bro-toolbar-main.vue-vuetify';
import {BroVuetifyToolbarComponent}                               from './toolbar/bro-toolbar.vue-vuetify';

// The elements render Vue roots, so they are defined only in the browser: imported without a DOM, as in the server
// render, the skin only registers its config. The optional elements, tags and switch, come with withTags() and
// withSwitch()
defineElement('bro-vuetify-button', BroVuetifyButtonComponent);
defineElement('bro-vuetify-paginator', BroVuetifyPaginatorComponent);
defineElement('bro-vuetify-progress-bar', BroVuetifyProgressBarComponent);
defineElement('bro-vuetify-sort-header', BroVuetifySortHeaderComponent);
defineElement('bro-vuetify-text-ellipsis', BroVuetifyTextEllipsisComponent);
defineElement('bro-vuetify-toolbar', BroVuetifyToolbarComponent);
defineElement('bro-vuetify-toolbar-main', BroVuetifyToolbarMainComponent);

registerSkin('vuetify', vuetifySkinConfig);

/**
 * Defines the optional element bro-vuetify-tags, the items of a column as the chips of Vuetify, unless it is defined;
 * without a DOM, as in the server render, it does nothing. A page without the call does not carry the code of the
 * chips.
 * @param options - the texts of the tags, as {texts: {empty: 'No tags'}}; setTagsTexts() changes them later
 * @param options.texts - the texts of the tags
 */
export function withTags(options: {texts?: Partial<BroTagsTexts>} = {}): void {
  setTagsTexts(options.texts ?? {});
  defineElement('bro-vuetify-tags', BroVuetifyTagsComponent);
}

/**
 * Defines the optional element bro-vuetify-switch, a boolean of a column as the switch of Vuetify, unless it is
 * defined; without a DOM, as in the server render, it does nothing.
 */
export function withSwitch(): void {
  defineElement('bro-vuetify-switch', BroVuetifySwitchComponent);
}

export *                                            from './table-bro.vue-vuetify.config';
export {setVuetify}                                 from './bro-vuetify-element';
export type {BroVuetifyInstance, BroVuetifyOptions} from './bro-vuetify-element';
export {setTagsTexts}                               from './bro-tags.vue-vuetify';
export type {BroTagsTexts}                          from './bro-tags.vue-vuetify';

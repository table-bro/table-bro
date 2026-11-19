import {registerSkin} from '@table-bro/core';

import {BroM3SvelteButtonComponent}                                from './bro-button.svelte-m3';
import {defineElement}                                             from './bro-m3-svelte-element';
import {BroM3SveltePaginatorComponent}                             from './bro-paginator.svelte-m3';
import {BroM3SvelteProgressBarComponent}                           from './bro-progress-bar.svelte-m3';
import {BroM3SvelteSortHeaderComponent}                            from './bro-sort-header.svelte-m3';
import {BroM3SvelteSwitchComponent}                                from './bro-switch.svelte-m3';
import {BroM3SvelteTagsComponent, type BroTagsTexts, setTagsTexts} from './bro-tags.svelte-m3';
import {BroM3SvelteTextEllipsisComponent}                          from './bro-text-ellipsis.svelte-m3';
import {m3SvelteSkinConfig}                                        from './table-bro.svelte-m3.config';
import {BroM3SvelteToolbarMainComponent}                           from './toolbar/bro-toolbar-main.svelte-m3';
import {BroM3SvelteToolbarComponent}                               from './toolbar/bro-toolbar.svelte-m3';

// The elements are defined only in the browser: imported without a DOM, as in the server render, the skin only
// registers its config. The optional elements, tags and switch, come with withTags() and withSwitch()
defineElement('bro-m3-svelte-button', BroM3SvelteButtonComponent);
defineElement('bro-m3-svelte-paginator', BroM3SveltePaginatorComponent);
defineElement('bro-m3-svelte-progress-bar', BroM3SvelteProgressBarComponent);
defineElement('bro-m3-svelte-sort-header', BroM3SvelteSortHeaderComponent);
defineElement('bro-m3-svelte-text-ellipsis', BroM3SvelteTextEllipsisComponent);
defineElement('bro-m3-svelte-toolbar', BroM3SvelteToolbarComponent);
defineElement('bro-m3-svelte-toolbar-main', BroM3SvelteToolbarMainComponent);

registerSkin('m3-svelte', m3SvelteSkinConfig);

/**
 * Defines the optional element bro-m3-svelte-tags, the items of a column as the chips of M3 Svelte, unless it is defined;
 * without a DOM, as in the server render, it does nothing. A page without the call does not carry the code of the chips.
 * @param options - the texts of the tags, as {texts: {empty: 'No tags'}}; setTagsTexts() changes them later
 * @param options.texts - the texts of the tags
 */
export function withTags(options: {texts?: Partial<BroTagsTexts>} = {}): void {
  setTagsTexts(options.texts ?? {});
  defineElement('bro-m3-svelte-tags', BroM3SvelteTagsComponent);
}

/**
 * Defines the optional element bro-m3-svelte-switch, a boolean of a column as the switch of M3 Svelte, unless it is defined;
 * without a DOM, as in the server render, it does nothing.
 */
export function withSwitch(): void {
  defineElement('bro-m3-svelte-switch', BroM3SvelteSwitchComponent);
}

export *                                                            from './table-bro.svelte-m3.config';
export {setTagsTexts}                                               from './bro-tags.svelte-m3';
export type {BroTagsTexts}                                          from './bro-tags.svelte-m3';
export {attachM3SvelteTooltip}                                      from './m3-tooltip';
export type {BroM3SvelteTooltipOptions, BroM3SvelteTooltipPosition} from './m3-tooltip';

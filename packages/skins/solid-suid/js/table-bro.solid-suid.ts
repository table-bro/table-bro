import {type BroSkinConfig, registerSkin} from '@table-bro/core';

import {BroSuidButtonComponent}                                                              from './bro-button.solid-suid';
import {BroSuidDropdownComponent}                                                            from './bro-dropdown.solid-suid';
import {BroSuidProgressBarComponent}                                                         from './bro-progress-bar.solid-suid';
import {defineElement}                                                                       from './bro-suid-element';
import {attachSuidTooltip}                                                                   from './bro-suid-tooltip';
import {BroSuidSwitchComponent}                                                              from './bro-switch.solid-suid';
import {BroSuidTagsComponent, type BroTagsTexts, setTagsTexts}                               from './bro-tags.solid-suid';
import {BroSuidPaginatorComponent, BroSuidSortHeaderComponent, BroSuidTextEllipsisComponent} from './bro-vanilla-based.solid-suid';
import {suidSkinConfig}                                                                      from './table-bro.solid-suid.config';
import {BroSuidToolbarMainComponent}                                                         from './toolbar/bro-toolbar-main.solid-suid';
import {BroSuidToolbarComponent}                                                             from './toolbar/bro-toolbar.solid-suid';

// The elements render Solid roots, so they are defined only in the browser: imported without a DOM, as in the server
// render, the skin only registers its config. The optional elements, tags and switch, come with withTags() and
// withSwitch()
defineElement('bro-suid-button', BroSuidButtonComponent);
defineElement('bro-suid-dropdown', BroSuidDropdownComponent);
defineElement('bro-suid-paginator', BroSuidPaginatorComponent);
defineElement('bro-suid-progress-bar', BroSuidProgressBarComponent);
defineElement('bro-suid-sort-header', BroSuidSortHeaderComponent);
defineElement('bro-suid-text-ellipsis', BroSuidTextEllipsisComponent);
defineElement('bro-suid-toolbar', BroSuidToolbarComponent);
defineElement('bro-suid-toolbar-main', BroSuidToolbarMainComponent);

/**
 * The config of the skin with the tooltips of the sort headers and of the values of the cells, which the elements of the
 * vanilla skins show by the callbacks of the config: the config of the package has none, so it loads without Solid and
 * SUID, as in a prerender that takes the config alone.
 * @param config - the config of the skin
 */
function withTooltips(config: typeof suidSkinConfig): BroSkinConfig {
  return {
    ...config,
    components: {
      ...config.components,
      // The positions of the tooltips of the skin mat: right of a sort header, above a value
      sortHeader: {...config.components.sortHeader, afterRender: (element: Element, value: string) => attachSuidTooltip(element, value, {placement: 'right'})},
      textEllipsis: {...config.components.textEllipsis, afterRender: (element: Element, value: string) => attachSuidTooltip(element, value)}
    }
  };
}

registerSkin('suid', withTooltips(suidSkinConfig));

/**
 * Defines the optional element bro-suid-tags, the items of a column as the chips of SUID, unless it is defined;
 * without a DOM, as in the server render, it does nothing. A page without the call does not carry the code of the
 * chips.
 * @param options - the texts of the tags, as {texts: {empty: 'No tags'}}; setTagsTexts() changes them later
 * @param options.texts - the texts of the tags
 */
export function withTags(options: {texts?: Partial<BroTagsTexts>} = {}): void {
  setTagsTexts(options.texts ?? {});
  defineElement('bro-suid-tags', BroSuidTagsComponent);
}

/**
 * Defines the optional element bro-suid-switch, a boolean of a column as the switch of SUID, unless it is defined;
 * without a DOM, as in the server render, it does nothing.
 */
export function withSwitch(): void {
  defineElement('bro-suid-switch', BroSuidSwitchComponent);
}

export *                                                     from './table-bro.solid-suid.config';
export {setSuidTheme, suidThemeVariables}                    from './bro-suid-element';
export {attachSuidTooltip}                                   from './bro-suid-tooltip';
export type {BroSuidTooltipOptions, BroSuidTooltipPlacement} from './bro-suid-tooltip';
export {setTagsTexts}                                        from './bro-tags.solid-suid';
export type {BroTagsTexts}                                   from './bro-tags.solid-suid';

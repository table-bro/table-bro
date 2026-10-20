import {registerSkin} from '@table-bro/core';

import {defineElement}          from '../../shared/js/define-shared-elements';
import {BroNativeTagsComponent} from './bro-tags.native';
import {nativeSkinConfig}       from './table-bro.native.config';

// The elements are defined only in the browser: imported without a DOM, as in the server render, the skin only
// registers its config, and a prerender defines them in its server DOM (defineElements). The optional elements, tags
// and switch, come with withTags() and withSwitch()
if (typeof customElements !== 'undefined') {
  nativeSkinConfig.defineElements(customElements);
}

registerSkin('nv', nativeSkinConfig);

/**
 * Defines the optional element bro-nv-tags, the items of a column as tags, unless it is defined; without a DOM, as in
 * the server render, it does nothing. A page without the call does not carry the code of the tags.
 */
export function withTags(): void {
  defineElement('bro-nv-tags', BroNativeTagsComponent);
}

export *                        from './table-bro.native.config';
export {BroNativeTagsComponent} from './bro-tags.native';
export {BroSwitchComponent}     from '../../shared/js/bootstrap-based/bro-switch';
export {withSwitch}             from '../../shared/js/define-shared-elements';

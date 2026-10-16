import {registerSkin} from '@table-bro/core';

import {defineElement, defineSharedElements} from '../../shared/js/define-shared-elements';
import {BroNativeDropdownComponent}          from './bro-dropdown.native';
import {BroNativeProgressBarComponent}       from './bro-progress-bar.native';
import {BroNativeTagsComponent}              from './bro-tags.native';
import {nativeSkinConfig}                    from './table-bro.native.config';

// The elements are defined only in the browser: imported without a DOM, as in the server render, the skin only
// registers its config. The optional elements, tags and switch, come with withTags() and withSwitch()
if (typeof customElements !== 'undefined') {
  /* Skin - Shared */
  defineSharedElements('@table-bro/native');

  /* Skin - Native */
  defineElement('bro-nv-dropdown', BroNativeDropdownComponent);
  defineElement('bro-nv-progress-bar', BroNativeProgressBarComponent);
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

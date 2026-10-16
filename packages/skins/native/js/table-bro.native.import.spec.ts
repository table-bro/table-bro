import {registerSkin} from '@table-bro/core';

import {describe, expect, it, vi} from 'vitest';

import {BroNativeTagsComponent, BroSwitchComponent, withSwitch, withTags} from './table-bro.native';
import {nativeSkinConfig}                                                 from './table-bro.native.config';

// The real registry of the skins, with the calls of the skin seen
vi.mock('@table-bro/core', async importOriginal => {
  const core = await importOriginal<typeof import('@table-bro/core')>();

  return {...core, registerSkin: vi.fn(core.registerSkin)};
});

// The calls of the import, before the hooks of the test runner clear the mocks
const registered = [...vi.mocked(registerSkin).mock.calls];

describe('the import of @table-bro/native', () => {
  it('registers the skin and the elements of every table; withTags() and withSwitch() define the optional ones, once', () => {
    expect(registered).toEqual([['nv', nativeSkinConfig]]);
    expect(['bro-button', 'bro-paginator', 'bro-sort-header', 'bro-text-ellipsis', 'bro-toolbar', 'bro-toolbar-main', 'bro-nv-dropdown', 'bro-nv-progress-bar'].filter(name => !customElements.get(name))).toEqual([]);
    expect(['bro-nv-tags', 'bro-switch'].filter(name => customElements.get(name))).toEqual([]);

    withTags();
    withSwitch();
    withTags();

    // The classes are exported: a page may define the elements itself
    expect([customElements.get('bro-nv-tags'), customElements.get('bro-switch')]).toEqual([BroNativeTagsComponent, BroSwitchComponent]);
  });
});

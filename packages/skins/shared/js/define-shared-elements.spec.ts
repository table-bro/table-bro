import {describe, expect, it, vi} from 'vitest';

import {BroSwitchComponent}               from './bootstrap-based/bro-switch';
import {defineSharedElements, withSwitch} from './define-shared-elements';

describe('defineSharedElements', () => {
  it('defines the shared elements that are free, and warns about the ones another vanilla skin bundle defined', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // The bundle of the other vanilla skin has its own copy of the class
    customElements.define('bro-toolbar', class extends HTMLElement {});

    defineSharedElements('@table-bro/native', customElements);

    expect(['bro-button', 'bro-paginator', 'bro-sort-header', 'bro-text-ellipsis', 'bro-toolbar', 'bro-toolbar-main'].filter(name => !customElements.get(name))).toEqual([]);
    // The switch is an optional element: only its feature defines it
    expect(customElements.get('bro-switch')).toBeUndefined();
    expect(warn.mock.calls).toEqual([['@table-bro/native: bro-toolbar are already defined by another vanilla skin bundle, so this skin uses its elements. Load one vanilla skin bundle per page.']]);
    warn.mockRestore();
  });
});

describe('withSwitch', () => {
  it('defines the switch, and a second call finds it defined', () => {
    withSwitch();
    withSwitch();

    expect(customElements.get('bro-switch')).toBe(BroSwitchComponent);
  });
});

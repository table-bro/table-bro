import {describe, expect, it} from 'vitest';

import type {BroBodyLayoutExtension} from '../../../shared/island';
import type {BroResolvedConfig}      from '../../../types/table-bro';
import {BroBodyLayout}               from './body-layout';

describe('heightsOnce', () => {
  /** A layout with an extension that counts its calls of heightsChanged. */
  function setup(): {layout: BroBodyLayout; calls: () => number} {
    const layout = new BroBodyLayout(<BroResolvedConfig>{});
    let calls = 0;

    layout.extend(<BroBodyLayoutExtension><unknown>{heightsChanged: () => calls++});

    return {layout, calls: () => calls};
  }

  it('tells the extension the heights of several rows once, after them', () => {
    const {layout, calls} = setup();

    layout.heightsOnce(() => [1, 2, 3].forEach(() => layout.heightsChanged()));

    expect(calls()).toBe(1);

    layout.heightsChanged();

    expect(calls()).toBe(2);
  });

  it('tells nothing when no row changed its height', () => {
    const {layout, calls} = setup();

    layout.heightsOnce(() => undefined);

    expect(calls()).toBe(0);
  });
});

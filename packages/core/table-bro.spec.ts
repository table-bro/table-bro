import {describe, expect, it} from 'vitest';

import './index';

describe('<table-bro>', () => {
  it('carries the methods of its API and no helpers of the config', () => {
    const el = document.createElement('table-bro');

    expect(['configure', 'replaceRows', 'appendRows', 'setState', 'theme'].filter(name => !(name in el))).toEqual([]);
    expect(['deepCopy', 'merge', 'isObject', 'init', 'setRows', 'toggleRefreshProgress'].filter(name => name in el)).toEqual([]);
  });
});

import {afterEach, describe, expect, it} from 'vitest';

import type {BroUpdate}            from '../shared/frame';
import type {BroContext}           from '../types/context';
import type {BroBodyController}    from './body.controller';
import type {BroColumnsController} from './columns.controller';
import {BroHostWidthController}    from './host-width.controller';

/** The fonts of the document as the first render of a table leaves them: loading, until the test loads them. */
function fakeFonts(status: FontFaceSetLoadStatus): () => void {
  let load: () => void = () => undefined;
  const ready = new Promise<void>(resolve => load = resolve);

  Object.defineProperty(document, 'fonts', {configurable: true, value: {status, ready}});

  return load;
}

/** A controller of the width of a measured table: its updates run at once and count the remounts of the body. */
function setup(model: Partial<BroContext['model']>, config: Partial<BroContext['config']> = {}): {ctrl: BroHostWidthController; remounts: () => number; abort: () => void} {
  let remounts = 0;
  const abort = new AbortController();
  const ctx = <BroContext><unknown>{config, model, signal: abort.signal};
  const body = <BroBodyController><unknown>{remount: () => remounts++};
  const update = (reason: string, phases: BroUpdate) => phases.render?.(<never>{});

  return {ctrl: new BroHostWidthController(ctx, update, <BroColumnsController>{}, body), remounts: () => remounts, abort: () => abort.abort()};
}

describe('BroHostWidthController.remeasureAfterFonts', () => {
  afterEach(() => {
    delete (<{fonts?: unknown}>document).fonts;
  });

  it('measures the columns again once the fonts that the first render made the document load are loaded', async () => {
    const load = fakeFonts('loading');
    const {ctrl, remounts} = setup({columnsWidth: 600});

    ctrl.remeasureAfterFonts();
    expect(remounts()).toBe(0);

    load();
    await document.fonts.ready;
    expect(remounts()).toBe(1);
  });

  it('keeps the columns when the fonts were loaded at the first render', async () => {
    const load = fakeFonts('loaded');
    const {ctrl, remounts} = setup({columnsWidth: 600});

    ctrl.remeasureAfterFonts();
    load();
    await document.fonts.ready;
    expect(remounts()).toBe(0);
  });

  it('leaves a hidden table, a removed table and autoColumnWidth: false to themselves', async () => {
    const load = fakeFonts('loading');
    const hidden = setup({});
    const removed = setup({columnsWidth: 600});
    const free = setup({columnsWidth: 600}, {autoColumnWidth: false});

    hidden.ctrl.remeasureAfterFonts();
    removed.ctrl.remeasureAfterFonts();
    removed.abort();
    free.ctrl.remeasureAfterFonts();
    load();
    await document.fonts.ready;
    expect([hidden.remounts(), removed.remounts(), free.remounts()]).toEqual([0, 0, 0]);
  });
});

import {describe, expect, it} from 'vitest';

import {BroRowHeights}                from '../../../../model/row-heights';
import {type BroRowSlot, BroRowSlots} from '../../../../model/row-slots';
import type {BroBodyLayoutExtension}  from '../../../../shared/island';
import type {BroContext}              from '../../../../types/context';
import type {BroResolvedConfig}       from '../../../../types/table-bro';
import {BroBodyLayout}                from '../../../features/body-layout/body-layout';
import {removeDetails, resizeDetails} from './row-layers';

const rowHeight: number = 10;

/** A body of three displayed rows; the second one has open details. The extension of the layout counts the calls of the table. */
function setup(): {ctx: BroContext; slot: BroRowSlot; calls: string[]} {
  const calls: string[] = [];
  const layout: BroBodyLayout = new BroBodyLayout(<BroResolvedConfig>{});

  layout.extend(<BroBodyLayoutExtension><unknown>{
    rowResized: () => calls.push('rowResized'),
    heightsChanged: () => calls.push('heightsChanged'),
    detailsRemoved: () => calls.push('detailsRemoved')
  });

  const ctx = <BroContext><unknown>{layout, styles: {rowHeight}, state: {sourceRows: null}, model: {}};

  ctx.model.slots = new BroRowSlots(ctx, [{id: 1}, {id: 2}, {id: 3}]);
  ctx.model.rowHeights = new BroRowHeights(ctx, 3, () => 0);
  ctx.model.rowHeights.init();

  const slot = <BroRowSlot>ctx.model.slots.get(2);
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  const element = document.createElement('div');

  document.body.append(tr);
  slot.details = {tr, td, element};

  return {ctx, slot, calls};
}

describe('resizeDetails', () => {
  it('writes the height to the layers, the geometry and the layout of the body', () => {
    const {ctx, slot, calls} = setup();

    resizeDetails(ctx, slot, 40, 1);

    expect(slot.details?.tr.style.height).toBe('40px');
    expect(slot.drawnDetailsHeight).toBe(41);
    expect(ctx.model.rowHeights.heights[1]).toBe(rowHeight + 41);
    expect(calls).toEqual(['rowResized', 'heightsChanged']);
  });
});

describe('removeDetails', () => {
  it('takes the details out of the tables, and the row takes its own height again', () => {
    const {ctx, slot, calls} = setup();
    const tr = <HTMLElement>slot.details?.tr;

    resizeDetails(ctx, slot, 40, 1);
    removeDetails(ctx, slot);

    expect(tr.isConnected).toBe(false);
    expect(slot.details).toBe(null);
    expect(ctx.model.rowHeights.heights[1]).toBe(rowHeight);
    expect(calls).toEqual(['rowResized', 'heightsChanged', 'heightsChanged', 'detailsRemoved']);
  });
});

import {describe, expect, it} from 'vitest';

import type {BroBodyLayoutExtension}    from '../../../../../shared/island';
import type {BroContext}                from '../../../../../types/context';
import type {BroResolvedConfig}         from '../../../../../types/table-bro';
import {BroBodyLayout}                  from '../../../../features/body-layout/body-layout';
import {BroTableBodyScrollingContainer} from './table-body-scrolling-container.view';

/**
 * A scrolling container of the rows with the layout of the body. The extension of the layout of the spec counts the
 * calls of the table.
 * @param extended - the layout has an extension
 */
function setup(extended: boolean = true): {container: BroTableBodyScrollingContainer; calls: string[]} {
  const calls: string[] = [];
  const layout: BroBodyLayout = new BroBodyLayout(<BroResolvedConfig>{});

  if (extended) {
    layout.extend(<BroBodyLayoutExtension><unknown>{
      windowReset: () => calls.push('windowReset'),
      windowMoved: () => calls.push('windowMoved')
    });
  }

  const container = new BroTableBodyScrollingContainer(<BroContext><unknown>{layout}, []);

  container.el = document.createElement('div');

  return {container, calls};
}

describe('BroTableBodyScrollingContainer.scrollFrame', () => {
  it('moves the rows, and the layout follows the window after them', () => {
    const {container, calls} = setup();

    container.scrollFrame(0.5, -100, -150);

    expect(container.top).toBe(-125);
    expect(calls).toEqual(['windowMoved']);
  });

  it('only moves the rows of a layout without an extension', () => {
    const {container} = setup(false);

    container.scrollFrame(0.5, -50, -100);

    expect(container.top).toBe(-75);
    expect(container.el.style.transform).toBe('translate3d(0px, -75px, 0px)');
  });

  it('draws nothing at the start of the scroll', () => {
    const {container, calls} = setup();

    container.scrollFrame(0, -50, -100);

    expect(container.top).toBe(0);
    expect(calls).toEqual([]);
  });
});

describe('BroTableBodyScrollingContainer.placeRows', () => {
  it('resets the window before the layout follows it at the rows of the current page', () => {
    const {container, calls} = setup();

    container.placeRows(-50);

    expect(container.top).toBe(-50);
    expect(calls).toEqual(['windowReset', 'windowMoved']);
  });
});

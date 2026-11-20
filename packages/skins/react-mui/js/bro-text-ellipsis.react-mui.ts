import {type BroCellElement, broCellSelectors, type BroCol, BroHTML} from '@table-bro/core';

import Tooltip              from '@mui/material/Tooltip';
import {createElement as h} from 'react';

import {BroMuiElement, tooltipSlotProps} from './bro-mui-element';

/**
 * A value wider than its column, with the whole value in a tooltip: the element bro-mui-text-ellipsis of
 * BroTextEllipsis.
 */
export class BroMuiTextEllipsisComponent extends BroMuiElement implements BroCellElement {
  /** The column of the cell: with html: true the value is markup. */
  col?: BroCol;

  protected content() {
    const value = this.getAttribute('value') ?? '';
    const containerClass = this.getAttribute('container-class');
    const text = this.col?.html
      ? h('span', {className: broCellSelectors.ellipsis, dangerouslySetInnerHTML: {'__html': value}})
      : h('span', {className: broCellSelectors.ellipsis}, value);
    const className = containerClass ? `${broCellSelectors.ellipsisContainer} ${containerClass}` : broCellSelectors.ellipsisContainer;
    const container = h('span', {className}, text);

    return h(Tooltip, {title: this.col?.html ? BroHTML.text(value) : value, placement: 'top', slotProps: tooltipSlotProps, children: container});
  }
}

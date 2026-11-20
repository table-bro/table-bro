import {type BroCellElement, broCellSelectors, type BroCol, BroHTML} from '@table-bro/core';

import {h, mergeProps} from 'vue';
import {VTooltip}      from 'vuetify/components/VTooltip';

import {BroVuetifyElement} from './bro-vuetify-element';

/**
 * A value wider than its column, with the whole value in a tooltip: the element bro-vuetify-text-ellipsis of
 * BroTextEllipsis.
 */
export class BroVuetifyTextEllipsisComponent extends BroVuetifyElement implements BroCellElement {
  /** The column of the cell: with html: true the value is markup. */
  col?: BroCol;

  protected content() {
    const value = this.getAttribute('value') ?? '';
    const containerClass = this.getAttribute('container-class');
    const text = this.col?.html
      ? h('span', {class: broCellSelectors.ellipsis, innerHTML: value})
      : h('span', {class: broCellSelectors.ellipsis}, value);
    const className = containerClass ? `${broCellSelectors.ellipsisContainer} ${containerClass}` : broCellSelectors.ellipsisContainer;

    return h(VTooltip, {text: this.col?.html ? BroHTML.text(value) : value, location: 'top', contentClass: 'bro-vuetify-tooltip'}, {
      activator: ({props}: {props: Record<string, unknown>}) => h('span', mergeProps(props, {class: className}), [text])
    });
  }
}

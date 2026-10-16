import {type BroRowDetailsElement, events} from '@table-bro/core';

import type {StandFeature} from './features';

/**
 * The row details of the Features table: the name of the feature. With the attribute server the details emulate a load
 * from the server and report its end after 1-1.75 s by the bro-details-server-loaded event.
 */
export class FeatureDetailsElement extends HTMLElement implements BroRowDetailsElement<StandFeature> {
  row?: StandFeature;
  server?: string;

  connectedCallback() {
    const content = document.createElement('div');

    content.style.minHeight = '120px';
    content.style.padding = '1rem 3rem 1rem 4rem';
    content.innerHTML = this.row?.featureName ?? '';

    this.replaceChildren(content);

    if (this.server ?? this.getAttribute('server')) {
      setTimeout(() => this.dispatchEvent(new CustomEvent(events.detailsServerLoadedEvent, {detail: 1})), 1000 + Math.floor(Math.random() * 751));
    }
  }
}

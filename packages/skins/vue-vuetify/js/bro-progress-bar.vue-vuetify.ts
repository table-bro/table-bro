import type {BroConfiguredElement, BroResolvedConfig} from '@table-bro/core';

import {h}               from 'vue';
import {VProgressLinear} from 'vuetify/components/VProgressLinear';

import {BroVuetifyElement} from './bro-vuetify-element';

/** The progress bar of the skin, the element bro-vuetify-progress-bar with the attributes of BroProgressBar. */
export class BroVuetifyProgressBarComponent extends BroVuetifyElement implements BroConfiguredElement {
  static get observedAttributes(): string[] {
    return ['value'];
  }

  config?: BroResolvedConfig;

  attributeChangedCallback(): void {
    this.update();
  }

  protected content() {
    const determinate = (this.getAttribute('mode') === 'determinate');

    // The bar fills the height that the table gives it, in the primary color of the theme
    return h(VProgressLinear, {
      'aria-label': this.config?.texts.loadingProgress,
      color: 'primary',
      height: '100%',
      indeterminate: !determinate,
      modelValue: determinate ? Number(this.getAttribute('value')) : undefined
    });
  }
}

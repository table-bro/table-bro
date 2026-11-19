import type {BroConfiguredElement, BroResolvedConfig} from '@table-bro/core';

import LinearProgress from '@suid/material/LinearProgress';

import {BroSuidElement, suid} from './bro-suid-element';

/** The progress bar of the skin, the element bro-suid-progress-bar with the attributes of BroProgressBar. */
export class BroSuidProgressBarComponent extends BroSuidElement implements BroConfiguredElement {
  static get observedAttributes(): string[] {
    return ['value'];
  }

  config?: BroResolvedConfig;

  attributeChangedCallback(): void {
    this.update();
  }

  protected content() {
    const determinate = (this.getAttribute('mode') === 'determinate');
    const value = () => Number(this.attribute('value'));

    return suid(LinearProgress, {
      'aria-label': this.config?.texts.loadingProgress,
      variant: determinate ? 'determinate' : 'indeterminate',
      get value() {
        return determinate ? value() : undefined;
      }
    });
  }
}

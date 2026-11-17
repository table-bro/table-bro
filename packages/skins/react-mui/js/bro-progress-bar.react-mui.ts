import type {BroConfiguredElement, BroResolvedConfig} from '@table-bro/core';

import LinearProgress       from '@mui/material/LinearProgress';
import {createElement as h} from 'react';

import {BroMuiElement} from './bro-mui-element';

/** The progress bar of the skin, the element bro-mui-progress-bar with the attributes of BroProgressBar. */
export class BroMuiProgressBarComponent extends BroMuiElement implements BroConfiguredElement {
  static get observedAttributes(): string[] {
    return ['value'];
  }

  config?: BroResolvedConfig;

  attributeChangedCallback(): void {
    this.update();
  }

  protected content() {
    const determinate = (this.getAttribute('mode') === 'determinate');

    return h(LinearProgress, {
      'aria-label': this.config?.texts.loadingProgress,
      variant: determinate ? 'determinate' : 'indeterminate',
      value: determinate ? Number(this.getAttribute('value')) : undefined
    });
  }
}

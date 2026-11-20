import {type BroConfiguredElement, BroDom, type BroResolvedConfig} from '@table-bro/core';

import {LinearProgress} from 'm3-svelte';

import {BroM3SvelteElement, type BroM3SveltePart, type BroM3SvelteProps} from './bro-m3-svelte-element';

/**
 * The progress bar of the skin, the element bro-m3-svelte-progress-bar with the attributes of BroProgressBar. A determinate
 * bar is the linear progress of M3 Svelte; M3 Svelte has no indeterminate one, so the indeterminate bar of the table is
 * the one of Material 3 from its tokens: the indicator and the track in the colors of the linear progress of M3 Svelte.
 */
export class BroM3SvelteProgressBarComponent extends BroM3SvelteElement implements BroConfiguredElement {
  static get observedAttributes(): string[] {
    return ['value'];
  }

  config?: BroResolvedConfig;

  private progress: BroM3SveltePart | null = null;

  attributeChangedCallback(): void {
    this.update();
  }

  protected render(container: HTMLElement): void {
    const label = this.config?.texts.loadingProgress;

    if (this.getAttribute('mode') === 'determinate') {
      this.progress = this.mountPart(LinearProgress, container, this.props());

      return;
    }

    const bar = new BroDom(this.ownerDocument).createElement('div');

    bar.className = 'bro-m3-svelte-progress-indeterminate';
    bar.setAttribute('role', 'progressbar');

    if (label) {
      bar.setAttribute('aria-label', label);
    }

    bar.append(...['bro-m3-svelte-progress-indicator', 'bro-m3-svelte-progress-indicator'].map(className => {
      const part = new BroDom(this.ownerDocument).createElement('div');

      part.className = className;

      return part;
    }));
    container.append(bar);
  }

  protected refresh(): void {
    this.progress?.set(this.props());
  }

  protected override unmounted(): void {
    this.progress = null;
  }

  /** The props of the determinate linear progress: its value in percent and the height of the bar of the table. */
  private props(): BroM3SvelteProps {
    return {percent: Number(this.getAttribute('value')), height: this.clientHeight, 'aria-label': this.config?.texts.loadingProgress};
  }
}

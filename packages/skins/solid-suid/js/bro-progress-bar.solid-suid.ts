import {type BroConfiguredElement, type BroResolvedConfig, isPrerendered} from '@table-bro/core';

import LinearProgress from '@suid/material/LinearProgress';

import {BroSuidElement, suid} from './bro-suid-element';

/**
 * The start times of the animations of the prerendered progress bar of each table, by their keyframes: the progress bar
 * that the table renders in its place in the browser continues them.
 */
const prerenderStartTimes = new WeakMap<Element, Map<string, CSSNumberish>>();

/**
 * The keyframes of an animation of the progress bar of SUID without the id that SUID gives them, a random string of the
 * module of the progress bar: the prerender and the browser name the same keyframes with different ids, so the table,
 * which continues the animations of the prerender by their names, finds none of them.
 * @param animation - the animation
 */
function keyframes(animation: CSSAnimation): string {
  return animation.animationName.replace(/-[^-]*$/, '');
}

/**
 * The CSS animations of an element and of its descendants.
 * @param element - the element
 */
function cssAnimations(element: Element): CSSAnimation[] {
  return element.getAnimations({subtree: true}).filter(animation => animation instanceof CSSAnimation);
}

/** The progress bar of the skin, the element bro-suid-progress-bar with the attributes of BroProgressBar. */
export class BroSuidProgressBarComponent extends BroSuidElement implements BroConfiguredElement {
  static get observedAttributes(): string[] {
    return ['value'];
  }

  config?: BroResolvedConfig;

  connectedCallback(): void {
    // The prerendered progress bar keeps its markup until the table renders: the table keeps the start times of its
    // animations for its progress bar in the browser. A server DOM animates nothing
    const host = this.closest('table-bro');

    if (host && isPrerendered(this) && (typeof this.getAnimations === 'function')) {
      prerenderStartTimes.set(host, new Map(cssAnimations(this)
        .filter(animation => animation.startTime !== null)
        .map(animation => [keyframes(animation), <CSSNumberish>animation.startTime])));
    }

    super.connectedCallback();
  }

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

  /**
   * The first progress bar that the table renders in the place of the prerendered one continues its animations, as the
   * table continues the animations of the prerender of the other skins: the bar goes on from its position.
   */
  protected rendered(): void {
    const host = this.closest('table-bro');
    const startTimes = host && prerenderStartTimes.get(host);

    if (!startTimes) {
      return;
    }

    prerenderStartTimes.delete(host);

    cssAnimations(this).forEach(animation => {
      const startTime = startTimes.get(keyframes(animation));

      if (startTime !== undefined) {
        animation.startTime = startTime;
      }
    });
  }
}

import {type BroConfiguredElement, BroHTML, BroHTMLElement, type BroProgressBar, type BroProgressMode, type BroResolvedConfig, type BroView, isPrerendered} from '@table-bro/core';

const {escape} = BroHTML;

/** The CSS animation of the progress of an unknown end: the skin grows the bar by its schedule. */
const growth: string = 'bro-progress-bar-growth';

export class BroBootstrapProgressBarComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroProgressBar {
  template(): string {
    // Bootstrap has no class of the color of the table for the bar; the contract keeps the attribute
    this.color = this.getAttribute('color') || '';

    this.mode = <BroProgressMode>this.getAttribute('mode') || 'indeterminate';

    const indeterminate = (this.mode === 'indeterminate');
    // The CSS of the skin grows the bar of an unknown end, slower with config.debugAnimation
    const debugClass = (this.config.debugAnimation ? ' bro-progress-bar-debug-animation' : '');
    const growthClasses = (indeterminate ? ` bro-progress-bar-indeterminate${debugClass}` : '');

    this.value = (indeterminate ? 0 : (this.getAttribute('value') || 0))
      .toString();

    return `
      <div class="progress"
           role="progressbar" aria-label="${escape(this.config.texts.loadingProgress)}"
           ${indeterminate ? '' : `aria-valuenow="${escape(this.value)}" aria-valuemin="0" aria-valuemax="100"`}>
        <div class="progress-bar progress-bar-striped progress-bar-animated${growthClasses}"></div>
      </div>`;
  }

  static get observedAttributes() {
    return ['value'];
  }

  config!: BroResolvedConfig;

  color!: string;
  mode!: BroProgressMode;
  value!: string;

  /** The start time of the growth of the progress of an unknown end; a move in the DOM keeps it. */
  private startTime: CSSNumberish | null = null;
  /** A move in the DOM connects the element again; it keeps its markup and its progress. */
  private rendered: boolean = false;
  private valueEl!: HTMLElement;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());
  }

  connectedCallback(): void {
    // An element of a prerendered table keeps its markup until the table renders its own elements in its place
    if (isPrerendered(this)) {
      return;
    }

    if (!this.rendered) {
      this.rendered = true;

      this.render();

      this.valueEl = this.querySelector('.progress-bar') as HTMLElement;

      if (this.mode === 'determinate') {
        // The width of the value is a property of style: a strict Content Security Policy blocks a style attribute
        this.valueEl.style.width = `${this.value}%`;
      } else if (!this.config.prerender && !parseFloat(getComputedStyle(this).getPropertyValue('--bro-duration-scale'))) {
        // The time of the table is 0: the bar is full at once, as under reduced motion
        this.valueEl.classList.add('bro-progress-bar-full');
      } else {
        this.valueEl.addEventListener('animationstart', event => this.keepStartTime(event));
      }
    } else if (this.startTime !== null) {
      // A move in the DOM starts the CSS animations of the bar again, moveBefore() keeps them: both go on from their start
      this.valueEl.getAnimations().forEach(animation => {
        animation.startTime = this.startTime;
      });
    }
  }

  attributeChangedCallback(name: string, previousValue: string, currentValue: string) {
    if (this.mode === 'determinate' && name === 'value') {
      this.valueEl.style.width = `${currentValue}%`;
      this.valueEl.parentElement?.setAttribute('aria-valuenow', currentValue);
    }
  }

  /**
   * Keeps the start time of the growth of the progress, the CSS animation of the skin. The growth of a table that
   * continues a prerendered one starts at the start of the prerender.
   * @param event - the start of a CSS animation of the bar
   */
  private keepStartTime(event: AnimationEvent): void {
    if (event.animationName === growth && this.startTime === null) {
      const animation = this.valueEl.getAnimations().find(animation => (<CSSAnimation>animation).animationName === growth);

      this.startTime = animation?.startTime ?? null;
    }
  }
}

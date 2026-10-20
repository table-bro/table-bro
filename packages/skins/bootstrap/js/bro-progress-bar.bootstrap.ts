import {type BroConfiguredElement, BroHTML, BroHTMLElement, BroMotion, type BroProgressBar, type BroProgressMode, type BroResolvedConfig, type BroView, isPrerendered} from '@table-bro/core';

const {escape} = BroHTML;

/** The progress of an unknown end in each of its 12 seconds, in %: half in the first one, then smaller steps up to 98%. */
const progressPerSecond: number[] = [50, 8, 8, 8, 3, 3, 3, 3, 3, 3, 3, 3];

export class BroBootstrapProgressBarComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroProgressBar {
  template(): string {
    // Bootstrap has no class of the color of the table for the bar; the contract keeps the attribute
    this.color = this.getAttribute('color') || '';

    this.mode = <BroProgressMode>this.getAttribute('mode') || 'indeterminate';

    const indeterminate = (this.mode === 'indeterminate');

    this.value = (indeterminate ? 0 : (this.getAttribute('value') || 0))
      .toString();

    return `
      <div class="progress"
           role="progressbar" aria-label="${escape(this.config.texts.loadingProgress)}"
           ${indeterminate ? '' : `aria-valuenow="${escape(this.value)}" aria-valuemin="0" aria-valuemax="100"`}>
        <div class="progress-bar progress-bar-striped progress-bar-animated"></div>
      </div>`;
  }

  static get observedAttributes() {
    return ['value'];
  }

  config!: BroResolvedConfig;

  color!: string;
  mode!: BroProgressMode;
  value!: string;

  /** The motion of the progress of an unknown end; a move in the DOM keeps it. */
  private motion?: BroMotion;
  /** A move in the DOM connects the element again; it keeps its markup and its motion. */
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
      // The width of the value is a property of style: a strict Content Security Policy blocks a style attribute
      this.valueEl.style.width = `${this.value}%`;
    }

    // A prerender animates nothing: the bar of the table that the browser renders moves
    if (this.mode === 'indeterminate' && !this.motion && !this.config.prerender) {
      this.animateProgress();
    }
  }

  /** A move in the DOM disconnects and connects the element in one task: the progress goes on. */
  disconnectedCallback(): void {
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.motion?.cancelAll();
        this.motion = undefined;
      }
    });
  }

  attributeChangedCallback(name: string, previousValue: string, currentValue: string) {
    if (this.mode === 'determinate' && name === 'value') {
      this.valueEl.style.width = `${currentValue}%`;
      this.valueEl.parentElement?.setAttribute('aria-valuenow', currentValue);
    }
  }

  /**
   * Moves the progress of an unknown end by its schedule in the time of the table: --bro-duration-scale, 0 under
   * reduced motion, where the bar is full at once, and slower with config.debugAnimation. At the end of the schedule
   * the bar flashes until the loading ends.
   */
  private animateProgress(): void {
    const durationScale = parseFloat(getComputedStyle(this).getPropertyValue('--bro-duration-scale'));

    if (!durationScale) {
      this.valueEl.style.width = '100%';

      return;
    }

    const end = progressPerSecond.reduce((sum, progress) => sum + progress, 0);

    this.motion = new BroMotion(new AbortController().signal, this.config.debugAnimation);
    this.motion.durationScale *= durationScale;

    this.motion.animate('progress', {
      duration: progressPerSecond.length * 1000,
      // Within each second the progress grows evenly
      timing: (timeFraction: number): number => {
        const time = timeFraction * progressPerSecond.length;
        const second = Math.min(Math.floor(time), progressPerSecond.length - 1);
        const before = progressPerSecond.slice(0, second).reduce((sum, progress) => sum + progress, 0);

        return (before + (time - second) * progressPerSecond[second]) / end;
      },
      draw: (progress: number): void => {
        this.valueEl.style.width = `${progress * end}%`;

        if (progress === 1) {
          this.valueEl.classList.add('bro-progress-bar-animated-n-flashing');
        }
      }
    });
  }
}

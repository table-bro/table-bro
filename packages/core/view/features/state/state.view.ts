import {selectors as sharedSelectors} from '../../../shared/shared-selectors';
import {selectors}                    from '../../../table-bro-selectors';
import type {BroContext}              from '../../../types/context';
import type {BroView}                 from '../../../types/view';
import {easeInOutSine}                from '../../shared/animation';

export class BroStateView implements BroView {
  template(iconHTML: string, message: string): string {
    const lottie = !!this.ctx.config.components.state.lottie;

    return `
      <div class="${sharedSelectors.stateContainer}">
        ${iconHTML}${!lottie ? `<span class="${selectors.stateMessage}">${message}</span>` : ''}
      </div>`;
  }

  el!: HTMLElement;

  private iconEl: HTMLElement | null = null;

  private messageEl: HTMLElement | null = null;

  constructor(protected readonly ctx: BroContext) {
  }

  render(iconHTML: string, message: string): HTMLElement {
    this.el = this.ctx.dom.createFromHTML(this.template(iconHTML, message));

    return this.el;
  }

  renderAnimation() {
    // The prerender shows the first frame of the animation, which the table plays in the browser
    if (this.ctx.config.components.state.lottie || this.ctx.config.prerender) {
      return;
    }

    this.renderIconAnimation();
    this.renderMessageAnimation();
  }

  private renderIconAnimation() {
    const {config, styles, motion} = this.ctx;

    if (!this.iconEl) {
      this.iconEl = this.el.querySelector('.bro-state-icon');
    }

    const iconEl = this.iconEl;

    if (!iconEl) {
      return;
    }

    let cssDegree: number = -180; // how to get this value based on `getComputedStyle` - https://stackoverflow.com/questions/42267189/how-to-get-value-translatex-by-javascript

    if (config.stateAnimationEffect === 'alt') {
      this.el.classList.add(sharedSelectors.stateContainerAlt);

      cssDegree = -120;
    }

    const previousDegree = cssDegree;
    const targetDegree = 0;

    const {top, lineHeight, fontSize} = getComputedStyle(iconEl);
    const previousTop = parseFloat(top);
    const targetTop = config.components.state.fontIcon ? 0 : (parseFloat(lineHeight) - parseFloat(fontSize)) / 2;

    motion.animate('state-icon', {
      duration: styles.stateIconDuration,
      timing: easeInOutSine,
      draw: timingProgress => {
        iconEl.style.transform = `rotate(${previousDegree + (targetDegree - previousDegree) * timingProgress}deg)`;

        if (!config.stateAnimationEffect) {
          iconEl.style.top = `${previousTop + (targetTop - previousTop) * timingProgress}px`;
        }
      }
    });
  }

  private renderMessageAnimation() {
    if (!this.messageEl) {
      this.messageEl = this.el.querySelector(`.${selectors.stateMessage}`);
    }

    const messageEl = this.messageEl;

    if (!messageEl) {
      return;
    }

    this.ctx.motion.animate('state-message', {
      duration: this.ctx.styles.stateMessageDuration,
      timing: easeInOutSine,
      draw: timingProgress => {
        messageEl.style.opacity = `${timingProgress}`;
      }
    });
  }
}

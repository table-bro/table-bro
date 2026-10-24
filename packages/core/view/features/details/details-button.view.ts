import {BroDom}                                       from '../../../shared/dom';
import {BroHTMLElement}                               from '../../../shared/html';
import {dispatchAction}                               from '../../../shared/interaction';
import {BroMotion}                                    from '../../../shared/motion';
import {selectors}                                    from '../../../shared/shared-selectors';
import {cssEasing, cssNumber}                         from '../../../shared/styles';
import type {BroConfiguredElement, BroResolvedConfig} from '../../../types/table-bro';
import type {BroView}                                 from '../../../types/view';
import {easeInOutSine}                                from '../../shared/animation';

/** The name of the details button of a row. */
export const detailsButtonSelector = 'bro-details-button';

export class BroDetailsButton extends BroHTMLElement implements BroView, BroConfiguredElement {
  // The table sets the config before the element connects
  config!: BroResolvedConfig;

  /** The animations of this element: it is a Custom Element, so it does not get the context of the table. */
  private readonly motion: BroMotion = new BroMotion(new AbortController().signal);
  private iconEl: HTMLElement | null = null;
  /** The control of the skin in the button, once the skin rendered it: it tells a screen reader the state of the details. */
  private buttonEl: Element | null = null;
  private expand: boolean = false;
  private rowDetailsServer: boolean = false;
  /** The table told the state of the details during the event of the button. */
  private stateTold: boolean = false;

  /** Attributes */
  private buttonTitle: string = '';
  private name: string = '';

  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events(): void {
    if (!this.iconEl) {
      this.iconEl = this.querySelector(this.config.components.button.iconSelector);
    }

    if (!this.iconEl) {
      return;
    }

    this.stateTold = false;

    dispatchAction(this, this.name);

    // The table tells the state of the details of the row during the event (renderDetailsState); a button of another
    // action reads its row
    if (!this.stateTold) {
      this.expand = this.getExpandStatus();

      this.renderExpanded();
      this.renderAnimation();
    }
  }

  render(): void {
    this.buttonTitle = this.getAttribute('title') ?? '';
    this.name = this.getAttribute('name') ?? '';

    this.rowDetailsServer = !!this.config.rowDetailsServer;

    const button = this.renderButtonWithIcon();

    button.addEventListener('click', () => {
      this.events();
    });

    this.append(button);

    // A row rendered again keeps its open details: its new button shows them open at once
    this.expand = this.hasOpenDetails();

    this.renderExpanded();

    if (this.expand) {
      // The icon of the skin may come after the button: it turns at the next frame
      this.motion.animate('rotate', {
        duration: 0,
        timing: easeInOutSine,
        draw: () => {
          this.iconEl ??= this.querySelector(this.config.components.button.iconSelector);

          if (this.iconEl) {
            this.iconEl.style.transform = 'rotate(180deg)';
          }
        }
      });
    }
  }

  renderAnimation() {
    const iconEl = this.iconEl;

    if (!iconEl) {
      return;
    }

    const transformValue = iconEl.style.transform.replace('rotate(', '');
    let previousDegree = parseFloat(transformValue);

    previousDegree = (previousDegree === 360) ? 0 : (previousDegree || 0);

    const targetDegree: number = (this.expand) ? 180 : 360;

    // The element reads the timing of the skin from the host; under prefers-reduced-motion: reduce the scale is 0
    const style = getComputedStyle(this);

    this.motion.durationScale = cssNumber(style.getPropertyValue('--bro-duration-scale'));

    // A new click replaces the rotation of the previous one and goes on from the current angle
    this.motion.animate('rotate', {
      duration: cssNumber(style.getPropertyValue('--bro-details-duration')),
      timing: cssEasing(style.getPropertyValue('--bro-details-easing')),
      draw: timingProgress => {
        iconEl.style.transform = `rotate(${previousDegree + (targetDegree - previousDegree) * timingProgress}deg)`;
      }
    });
  }

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task and keeps the rotation; a removed element stops it
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.motion.cancelAll();
      }
    });
  }

  /**
   * The table tells the button whether the details of its row are open or loading: at a click, at the end of the loading
   * of server details, and for a button of a row that the table rendered again. The icon turns when the state changes.
   */
  renderDetailsState(open: boolean): void {
    this.stateTold = true;

    const changed = (!!this.expand !== open);

    this.expand = open;
    this.renderExpanded();

    this.iconEl ??= this.querySelector(this.config.components.button.iconSelector);

    if (changed && this.iconEl) {
      this.renderAnimation();
    }
  }

  /** The row of the details follows the row of the button and opens, or the server details of the row load. */
  private hasOpenDetails(): boolean {
    const tr = this.closest('tr');
    const details = tr?.nextElementSibling;

    if (this.rowDetailsServer && tr?.getAttribute('data-action') === 'expand') {
      return true;
    }

    return !!details?.classList.contains(selectors.detailsTr) && details.getAttribute('data-action') === 'expand';
  }

  /**
   * The button of the skin tells a screen reader whether the details of its row are open, and which row holds them:
   * the row of the details follows the row of the button.
   */
  private renderExpanded(): void {
    const button = this.buttonEl ??= this.querySelector('button, [role="button"]');

    if (!button) {
      return;
    }

    button.setAttribute('aria-expanded', `${!!this.expand}`);

    const details = this.expand ? this.closest('tr')?.nextElementSibling : null;

    if (details?.id) {
      button.setAttribute('aria-controls', details.id);
    } else {
      button.removeAttribute('aria-controls');
    }
  }

  private renderButtonWithIcon(): HTMLElement {
    const button: HTMLElement = new BroDom(this.ownerDocument).createElement(this.config.components.button.selector);

    this.config.components.button.beforeRender(button, this.buttonTitle);

    return button;
  }

  private getExpandStatus(): boolean {
    const tr = this.closest('tr');

    // Server details keep their action on the row, the other details on the row of the details
    return (this.rowDetailsServer ? tr : tr?.nextElementSibling)?.getAttribute('data-action') === 'expand';
  }
}

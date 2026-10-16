import {type BroButton, BroHTML, BroHTMLElement, type BroView, dispatchAction} from '@table-bro/core';

const {escape} = BroHTML;

export class BroButtonComponent extends BroHTMLElement implements BroView, BroButton {
  template(): string {
    this.label = this.getAttribute('label') || '';

    this.buttonClassName = this.getAttribute('button-class');

    this.buttonTitle = this.getAttribute('button-title') || '';
    this.iconHTML = this.getAttribute('icon-html') || this.iconHTML;
    this.mode = <BroButton['mode']>this.getAttribute('mode') || 'button';

    this.eventType = this.getAttribute('event-type') || 'action';

    // A button with a title takes its name from the title; a button with an icon only takes the label.
    // The title and the name are text; the icon is the markup of the skin
    const className = this.buttonClassName ? ` class="${escape(this.buttonClassName)}"` : '';
    const ariaLabel = (!this.buttonTitle && this.label) ? ` aria-label="${escape(this.label)}"` : '';
    const content = `${escape(this.buttonTitle)}${this.iconHTML ? `${this.buttonTitle ? '&nbsp;' : ''}${this.iconHTML}` : ''}`;

    if (this.mode !== 'link') {
      return `
        <button${className}
                type="button"${ariaLabel}>
          ${content}
        </button>`;
    } else {
      return `
        <a${className} href=""
           role="button"${ariaLabel}>
          ${content}
        </a>`;
    }
  }

  label!: string;
  buttonClassName!: string | null;
  buttonTitle!: string;
  iconHTML!: string;
  mode: BroButton['mode'];

  eventType!: string;

  events() {
    const buttonEl = this.children[0];

    buttonEl.addEventListener('click', (event: Event) => {
      dispatchAction(buttonEl, this.eventType);

      event.preventDefault();
    });

    // A link in the role of a button takes Space as a button does, instead of scrolling the page; Enter clicks a link anyway
    if (this.mode === 'link') {
      buttonEl.addEventListener('keydown', (event: Event) => {
        if ((<KeyboardEvent>event).key === ' ' && !(<KeyboardEvent>event).repeat) {
          event.preventDefault();

          (<HTMLElement>buttonEl).click();
        }
      });
    }
  }

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    this.events();
  }

  connectedCallback(): void {
    if (!this.firstChild) {
      this.render();
    }
  }
}

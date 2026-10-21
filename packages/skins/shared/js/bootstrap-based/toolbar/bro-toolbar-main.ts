import {type BroButton, type BroConfiguredElement, BroDom, type BroDropdown, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroSkinComponents, type BroToolbarMain, type BroView, broVisuallyHidden, events, isPrerendered} from '@table-bro/core';

import type {BroToolbarComponent} from './bro-toolbar';

const {escape} = BroHTML;

export class BroToolbarMainComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroToolbarMain {
  template(): string {
    this.css = <NonNullable<BroSkinComponents['toolbarMain']['css']>>this.config.components.toolbarMain.css;

    this.toolbarTitle = this.config.toolbarTitle;

    const ulClass = this.css.navbarCollapse.ul.className ? `${this.css.navbarCollapse.ul.className} ${this.contentClassName}` : this.contentClassName;

    return `
      <!--bro-toolbar-->
        <span class="bro-toolbar-title-space"></span>
        <span class="${escape(this.css.toolbarTitle.className)}">${escape(this.toolbarTitle)}</span>

        <span class="bro-toolbar-space"></span>

        <div class="${escape(this.css.navbarCollapse.className)} bro-toolbar-buttons">
          <ul class="${escape(ulClass)}">
            <!-- search-button -->
            <!-- buttons -->
          </ul>
        </div>
      <!--/bro-toolbar-->`;
  }

  config!: BroResolvedConfig;

  contentClassName: string = 'bro-navbar-nav';
  toolbarTitle!: string;

  // The vanilla skins give the classes of their toolbar
  private css!: NonNullable<BroSkinComponents['toolbarMain']['css']>;
  private navContentEl!: HTMLElement;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events() {
    this.addEventListener('click', (event: Event) => {
      event.preventDefault();
    });

    const searchLink = this.navContentEl.children[0];

    searchLink.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent(events.toolbarEvent, {
          bubbles: true,
          composed: true,
          detail: events.toolbarSearchOpenEvent
        })
      );
    });
  }

  render(): void {
    // The toolbar element
    const broToolbar = this.dom.createElement<BroToolbarComponent>(this.config.components.toolbar.selector);

    broToolbar.setAttribute('class', 'bro-toolbar');

    broToolbar.config = this.config;

    this.appendChild(broToolbar);

    // The template in the toolbar element
    const wrapper: HTMLElement = this.dom.createElement('div');

    wrapper.insertAdjacentHTML('afterbegin', this.template());

    broToolbar.appendToolbarContent(
      ...Array.from(wrapper.children)
    );

    // The buttons
    this.appendToolbarContent(
      this.renderSearchButton(),

      ...this.renderButtons()
    );

    this.querySelectorAll(<string>this.config.components.dropdown?.selector).forEach(broDropdown => {
      broDropdown.replaceWith(broDropdown.children[0]);
    });

    this.events();
  }

  connectedCallback(): void {
    // An element of a prerendered table keeps its markup until the table renders its own elements in its place
    if (isPrerendered(this)) {
      return;
    }

    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }

  appendToolbarContent(...nodes: (Node | string)[]): void {
    if (!this.navContentEl) {
      this.navContentEl = <HTMLElement>this.querySelector(`.${this.contentClassName}`);
    }

    this.navContentEl
      .append(...nodes);
  }

  /** The nodes of the toolbar in the document of its element, as of a server DOM in a prerender. */
  private get dom(): BroDom {
    return new BroDom(this.ownerDocument);
  }

  /**
   * A link of the toolbar.
   * @param buttonTitle - the title of the link
   * @param role - the words after the title, as visually hidden text, as button; none without a title
   * @param iconHTML - the icon before the title
   * @param className - a class of the link
   */
  private templateToolbarButton(buttonTitle: string, role: string, iconHTML?: string, className?: string): HTMLElement {
    // A link says what it is with visually hidden text: Lighthouse reads the text of a link, not its label
    const word = (buttonTitle && role) ? `<span class="${escape(broVisuallyHidden)}"> ${escape(role)}</span>` : '';

    return this.dom.createFromHTML(`
      <li class="${escape(this.css.navbarCollapse.ul.li.className)}">
        <a class="${escape(this.css.navbarCollapse.ul.li.a.className)}${className ? ` ${escape(className)}` : ''}" href="">
           ${iconHTML || ''}${escape(buttonTitle)}${word}
        </a>
      </li>`);
  }

  private renderSearchButton(): HTMLElement {
    const broButton = this.dom.createElement<BroButton>(this.config.components.button.selector);

    this.config.components.toolbarMain.beforeRender?.(broButton, this.config.texts.search);

    const buttonTitle = broButton.getAttribute('button-title') ?? '';

    // The search says what it searches: the rows of the table that the toolbar names
    return this.templateToolbarButton(buttonTitle, this.config.texts.searchRole(this.config.toolbarTitle), broButton.iconHTML, 'bro-toolbar-button-search');
  }

  private renderButtons(): HTMLElement[] {
    return (this.config.components.toolbarMain.buttons ?? []).map((button: BroButton | BroDropdown) => {
      if (button.mode === 'navbar-dropdown') {
        const broDropdown: HTMLElement = this.dom.createElement(<string>this.config.components.dropdown?.selector);

        (<BroConfiguredElement>broDropdown).config = this.config;

        broDropdown.setAttribute('mode', 'navbar-dropdown');
        broDropdown.setAttribute('button-title', button.buttonTitle);
        broDropdown.setAttribute('options', JSON.stringify(button.options));

        // The menu sends the value of its option as a toolbar action. The toolbar puts the markup of the menu in place
        // of its element (render), so the element sends its value out of the DOM, and only its own listener hears it
        broDropdown.addEventListener('value', (event: Event) => {
          this.dispatchEvent(
            new CustomEvent(events.toolbarEvent, {
              bubbles: true,
              composed: true,
              detail: (<CustomEvent>event).detail
            })
          );
        });

        return broDropdown;
      } else {
        const buttonEl = this.templateToolbarButton(button.buttonTitle, this.config.texts.buttonRole, button.iconHTML);

        // A config button sends its eventType as a toolbar action, as the Material toolbar does
        buttonEl.querySelector('a')?.addEventListener('click', () => {
          this.dispatchEvent(
            new CustomEvent(events.toolbarEvent, {
              bubbles: true,
              composed: true,
              detail: (<BroButton>button).eventType
            })
          );
        });

        return buttonEl;
      }
    });
  }
}

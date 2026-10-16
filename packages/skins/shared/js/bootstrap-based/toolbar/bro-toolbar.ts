import {type BroConfiguredElement, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroSkinComponents, type BroToolbarElement, type BroView} from '@table-bro/core';

const {escape} = BroHTML;

export class BroToolbarComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroToolbarElement {
  template(): string {
    this.css = <NonNullable<BroSkinComponents['toolbar']['css']>>this.config.components.toolbar.css;

    const divClass = this.css.nav.div?.className ? `${this.css.nav.div.className} ${this.contentClassName}` : this.contentClassName;

    return `
      <nav class="${escape(this.css.nav.className)}">
        <div class="${escape(divClass)}">
          <!-- toolbar content -->
        </div>
      </nav>`;
  }

  config!: BroResolvedConfig;
  contentClassName: string = 'bro-toolbar-content';

  // The vanilla skins give the classes of their toolbar
  private css!: NonNullable<BroSkinComponents['toolbar']['css']>;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());
  }

  appendToolbarContent(...nodes: (Node | string)[]): void {
    if (!this.firstChild) {
      this.render();
    }

    this.querySelector(`.${this.contentClassName}`)
      ?.append(...nodes);
  }
}

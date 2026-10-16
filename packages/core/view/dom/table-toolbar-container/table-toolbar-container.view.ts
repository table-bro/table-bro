import {actionEvent, toolbarEvent, toolbarSearchCloseEvent, toolbarSearchOpenEvent} from '../../../shared/events';
import {BroHTML, classAttr, createComponent}                                        from '../../../shared/html';
import {dispatchAction}                                                             from '../../../shared/interaction';
import {selectors}                                                                  from '../../../shared/shared-selectors';
import type {BroContext}                                                            from '../../../types/context';
import type {BroConfiguredElement, BroEventDetail, BroToolbarMain}                  from '../../../types/table-bro';
import type {BroView}                                                               from '../../../types/view';
import {BroToolbarSearch}                                                           from './toolbar/toolbar-search.view';

const {createElement} = BroHTML;

export class BroTableToolbarContainer implements BroView {
  template(): string {
    return `
      <div class="${selectors.toolbarContainer}">
        <div ${classAttr(this.ctx.config.css.shadow?.className, selectors.toolbarShadow)}></div>
      </div>`;
  }

  el!: HTMLElement;

  private toolbarSearch: BroToolbarSearch | null = null;

  constructor(protected readonly ctx: BroContext) {
  }

  events() {
    this.ctx.host.addEventListener(actionEvent, event => {
      const detail = (<CustomEvent<BroEventDetail>>event).detail;

      // The search of a table in the row details of this one is not the search of this toolbar
      if ((<Element>event.target).closest('table-bro') !== this.ctx.host) {
        return;
      }

      if (detail.action === toolbarSearchOpenEvent) {
        this.showToolbarSearch();
      } else if (detail.action === toolbarSearchCloseEvent) {
        this.hideToolbarSearch();
      }
    }, {signal: this.ctx.signal});
  }

  render(): HTMLElement {
    this.el = createElement(this.template());

    this.appendToolbarMain();

    this.events();

    return this.el;
  }

  showToolbarSearch() {
    this.el.firstChild?.remove();

    this.toolbarSearch = new BroToolbarSearch(this.ctx);

    const search = this.toolbarSearch.render();

    this.el.prepend(
      search
    );

    // After the insertion: an Angular element writes the classes of its component into its class attribute when it connects
    search.classList.add('bro-toolbar', 'bro-toolbar-search');

    this.toolbarSearch.focus();
  }

  hideToolbarSearch() {
    if (!this.toolbarSearch) {
      return;
    }

    this.toolbarSearch.unrender();
    this.toolbarSearch = null;

    // The focus was in the search, which is gone: it returns to the search button that opened it
    this.appendToolbarMain().querySelector<HTMLElement>('.bro-toolbar-button-search')?.focus();
  }

  private appendToolbarMain(): HTMLElement {
    const {config} = this.ctx;

    const broToolbarMain = createComponent<BroToolbarMain & BroConfiguredElement>(config.components.toolbarMain.selector);

    broToolbarMain.config = config;

    broToolbarMain.setAttribute('title', config.toolbarTitle);
    // The toolbar of a skin has only its search unless the config gives it buttons
    broToolbarMain.setAttribute('buttons', JSON.stringify(config.components.toolbarMain.buttons ?? []));

    broToolbarMain.addEventListener(toolbarEvent, (event: Event) => {
      const action: string = (<CustomEvent>event).detail;

      dispatchAction(broToolbarMain, action);
    });

    this.el.prepend(broToolbarMain);

    return broToolbarMain;
  }
}

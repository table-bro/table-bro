import {BroHTML, classAttr} from '../../../../shared/html';
import {selectors}          from '../../../../shared/shared-selectors';
import type {BroContext}    from '../../../../types/context';
import type {BroView}       from '../../../../types/view';
import {BroTable}           from '../table-body-container/scrolling-container/table/table.view';

const {createElement} = BroHTML;

export class BroTableHeaderContainer implements BroView {
  template(): string {
    return `
      <div class="${selectors.headerContainer}">
        <div ${classAttr(this.ctx.config.css.shadow?.className, selectors.headerShadow)}></div>
      </div>`;
  }

  el!: HTMLElement;

  tableEl!: HTMLElement;

  constructor(protected readonly ctx: BroContext) {
  }

  render(): HTMLElement {
    this.el = createElement(this.template());

    this.tableEl = new BroTable(this.ctx, null).render(true);

    this.el.prepend(this.tableEl);

    // header: false hides the header and keeps its table: the widths and the sort of the columns live in it
    if (this.ctx.config.header === false) {
      this.el.hidden = true;
    }

    return this.el;
  }
}

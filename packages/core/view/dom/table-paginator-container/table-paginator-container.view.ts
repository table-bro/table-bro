import {classAttr}                from '../../../shared/html';
import {selectors}                from '../../../shared/shared-selectors';
import type {BroContext}          from '../../../types/context';
import type {BroPaginatorOptions} from '../../../types/pagination';
import type {BroView}             from '../../../types/view';
import {BroPaginator}             from './paginator/paginator.view';

export class BroTablePaginatorContainer implements BroView {
  template(): string {
    return `
      <div class="${selectors.paginatorContainer}">
        <div ${classAttr(this.ctx.config.css.shadow?.className, selectors.paginatorShadow)}></div>
      </div>`;
  }

  constructor(protected readonly ctx: BroContext) {
  }

  /**
   * @param options - the page, the page size and the total of the rows at the first render
   */
  render(options?: BroPaginatorOptions): HTMLElement {
    const container = this.ctx.dom.createFromHTML(this.template());

    const paginator = new BroPaginator(this.ctx);

    this.ctx.view.paginator = paginator;

    container.prepend(
      paginator.render(options)
    );

    return container;
  }
}

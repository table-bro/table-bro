import {BroHTML, classAttr} from '../../../../../../../shared/html';
import type {BroContext}    from '../../../../../../../types/context';
import type {BroCol}        from '../../../../../../../types/table-bro';
import type {BroView}       from '../../../../../../../types/view';
import {BroTheadTr}         from '../../table/thead/tr/tr.view';

const {createElement} = BroHTML;

export class BroTheadAux implements BroView {
  template(): string {
    return `<thead ${classAttr(this.ctx.config.css.table?.thead?.className)}></thead>`;
  }

  el!: HTMLElement;

  /**
   * @param ctx - the context of the table
   * @param cols - the table columns or their short titles for the minimal width calculation
   */
  constructor(protected readonly ctx: BroContext,
              private cols: BroCol[]) {
  }

  render(): HTMLElement {
    this.el = createElement(this.template());

    this.el.appendChild(new BroTheadTr(this.ctx, this.cols).render());

    return this.el;
  }

  /** The aux header goes after the measurement of the header. */
  unrender(): void {
    this.el.remove();
  }

  /** Renders the aux header in place of the previous one. */
  replace(previous: BroTheadAux): void {
    previous.el.replaceWith(this.render());
  }
}

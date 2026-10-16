import type {BroContext}    from '../types/context';
import type {BroPagination} from './pagination';

/**
 * The heights of the details on a page. The state of the details lives in the slots of the rows (BroRowSlot.detailsHeight),
 * the target of their animations.
 */
export class BroDetailsHeights {
  /**
   * @param ctx - the context of the table
   * @param gapsHeight - the full height of the gaps of the layout of the body around the open details of the rows from
   * first to last
   */
  constructor(protected readonly ctx: BroContext,
              private readonly gapsHeight: (first: number, last: number) => number) {
  }

  /** The pagination of the state: new rows that keep the body bring a new one. */
  protected get pagination(): BroPagination {
    return this.ctx.state.pagination;
  }

  /** The height of the open details of the rows of the page, with the gaps of the layout of the body around them. */
  calcExpandedDetailsHeight(): number {
    if (!this.ctx.config.rowDetailsComponent) {
      return 0;
    }

    const {pageStart, pageEnd} = this.pagination;

    const slots = this.ctx.model.slots.list;
    let height: number = 0;

    for (let i = pageStart; i < pageEnd; i++) {
      if (slots[i]?.detailsHeight > 0) {
        height += slots[i].detailsHeight;
      }
    }

    // The gaps of the layout of the body around the open details
    return height + this.gapsHeight(pageStart + 1, pageEnd);
  }
}

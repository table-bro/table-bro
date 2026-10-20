import type {BroPagination}                                                    from '../../../../model/pagination';
import {paginatorPageEvent}                                                    from '../../../../shared/events';
import {dispatchAction, keepFocus}                                             from '../../../../shared/interaction';
import type {BroContext}                                                       from '../../../../types/context';
import type {BroPaginatorOptions}                                              from '../../../../types/pagination';
import type {BroConfiguredElement, BroPaginatorElement, BroPaginatorPageEvent} from '../../../../types/table-bro';
import type {BroView}                                                          from '../../../../types/view';

export class BroPaginator implements BroView {
  el!: HTMLElement & BroPaginatorElement & BroConfiguredElement;

  /** The options of the paginator; the page size comes from the pagination at once. */
  private readonly options: BroPaginatorOptions & {pageSize: number};
  private pagination: BroPagination;

  constructor(protected readonly ctx: BroContext) {
    this.pagination = this.ctx.state.pagination;

    this.options = {
      pageSize: this.pagination.pageSize
    };
  }

  render(options?: BroPaginatorOptions): HTMLElement {
    const {config} = this.ctx;

    this.el = this.ctx.dom.createElement<BroPaginatorElement & BroConfiguredElement>(config.components.paginator.selector);

    this.el.classList.add('bro-paginator');
    this.el.setAttribute('role', 'group');
    this.el.setAttribute('aria-label', config.texts.pagination);

    this.el.config = config;

    this.initPaginator(options);

    this.el.addEventListener('page', (event: Event) => {
      const pageEvent = (<CustomEvent<BroPaginatorPageEvent>>event).detail;
      const page = pageEvent.pageIndex + 1;
      const pageSize = pageEvent.pageSize;
      const pageSizeChanged = (pageSize !== this.options.pageSize);

      this.options.pageSize = pageSize;

      // The controller decides whether the page scrolls into view or loads first
      if (pageEvent.pageIndex !== pageEvent.previousPageIndex || pageSizeChanged) {
        dispatchAction(this.el, paginatorPageEvent, {page, pageSize});
      }
    });

    return this.el;
  }

  /**
   * Renders the paginator in place of the previous one: the new element takes the options of the rows at its render.
   * @param previous - the paginator to replace
   * @param options - the page, the page size and the total of new rows, for an element that the table creates again
   */
  replace(previous: BroPaginator, options?: BroPaginatorOptions): void {
    keepFocus(previous.el, () => {
      previous.el.replaceWith(this.render(options));

      return this.el;
    });
  }

  initPaginator(options?: BroPaginatorOptions): void {
    const {config} = this.ctx;

    Object.assign(this.options, options);

    if (options?.page) {
      this.setOption('pageIndex', 'page-index', options.page - 1);
    }

    this.setOption('pageSize', 'page-size', this.options.pageSize);

    // 0 is a total too: under the not-found state the range label shows no rows
    if (this.options.total !== undefined && this.options.total !== null) {
      this.setOption('length', 'length', this.options.total);
    }

    const total = this.options?.total;
    const pageSize = this.options.pageSize;

    // Sizes up to the total, the first size above it and the current size, so the list is never empty
    const pageSizeOptions = config.pageSizeOptions.filter((item, i, array) => {
      if ((total !== undefined && item <= total) || item === pageSize) {
        return true;
      }

      return total !== undefined && (i === 0 || array[i - 1] < total) && total < item;
    });

    this.setOption('pageSizeOptions', 'page-size-options', pageSizeOptions);
    this.setOption('showFirstLastButtons', 'show-first-last-buttons', !config.server);

    // The controller sets disabled from the status of the table; the element takes the last value. It comes last:
    // a skin renders its page size list again for new options, and the new list takes the state from it
    this.setOption('disabled', 'disabled', !!this.options.disabled);
  }

  /** Enables or disables the paginator by the status of the table; the same value again writes nothing. */
  setDisabled(disabled: boolean): void {
    if (!!this.options.disabled === disabled) {
      return;
    }

    this.options.disabled = disabled;

    this.setOption('disabled', 'disabled', disabled);
  }

  /**
   * Gives the element an option as its property or as its attribute, as the skin says: an attribute takes the text of
   * the value, a list as JSON.
   */
  private setOption<K extends 'pageIndex' | 'pageSize' | 'length' | 'pageSizeOptions' | 'showFirstLastButtons' | 'disabled'>(property: K, attribute: string, value: BroPaginatorElement[K]): void {
    if (this.ctx.config.components.paginator.inputsAsProperties) {
      (<BroPaginatorElement>this.el)[property] = value;
    } else {
      this.el.setAttribute(attribute, Array.isArray(value) ? JSON.stringify(value) : String(value));
    }
  }
}

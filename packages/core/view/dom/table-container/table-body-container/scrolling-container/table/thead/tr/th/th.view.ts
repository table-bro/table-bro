import type {BroColumnModel}                                                      from '../../../../../../../../../model/columns';
import {BroHTML, classAttr}                                                       from '../../../../../../../../../shared/html';
import {selectors}                                                                from '../../../../../../../../../table-bro-selectors';
import type {BroContext}                                                          from '../../../../../../../../../types/context';
import type {BroCol, BroConfiguredElement, BroCustomElementConfig, BroSortHeader} from '../../../../../../../../../types/table-bro';
import type {BroView}                                                             from '../../../../../../../../../types/view';

const {createElement, escape} = BroHTML;

export class BroTheadTh implements BroView {
  template(col: BroCol) {
    let className = '';

    if (col.className) {
      className = col.className;
    } else if (col.component) {
      // A component of the cells may give its column a class: a selector string has no attrs
      const containerClass = (<BroCustomElementConfig>col.component).attrs?.['container-class'];

      if (containerClass) {
        className = <string>containerClass;
      }
    }

    // A column without a title, as of the details buttons, has no header for screen readers: an empty header cell is a cell
    const header = col.title ? 'role="columnheader" scope="col"' : 'role="cell"';

    return `
      <th ${classAttr(this.ctx.config.css.table?.thead?.tr?.th?.className, className)} ${header}></th>`;
  }

  /**
   * @param ctx - the context of the table
   * @param col - the column of the application
   * @param column - the record of the column, which gives the cell its class and its key
   * @param header - the cell is in the header row of the table, not in an aux one: the record keeps it and its sort header
   */
  constructor(protected readonly ctx: BroContext,
              private col: BroCol,
              private readonly column: BroColumnModel,
              private readonly header?: boolean) {
  }

  render() {
    const th = createElement(this.template(this.col));

    th.classList.add(this.column.className);
    th.setAttribute(selectors.columnKeyAttribute, this.column.key);

    // Screen readers would read the short title of the row numbers, No, as a word
    if (this.col.name === selectors.rowCounter) {
      th.setAttribute('aria-label', this.ctx.config.texts.rowCounterName);
    }

    const sortHeader = this.renderSortHeader(this.col);

    if (this.header) {
      this.column.headerCell = th;
      this.column.sortHeader = sortHeader;
    }

    th.appendChild(sortHeader);

    return th;
  }

  private renderSortHeader(col: BroCol): HTMLElement & BroSortHeader {
    const {config} = this.ctx;

    const parent: HTMLElement = document.createElement('div');

    parent.insertAdjacentHTML('afterbegin', this.buildSortHeaderHTML(col));

    const sortHeaderEl = <HTMLElement & BroSortHeader>parent.children[0];

    if (config.components.sortHeader.beforeRender) {
      config.components.sortHeader.beforeRender(sortHeaderEl, '');
    }

    (<BroConfiguredElement>sortHeaderEl).config = config;

    return sortHeaderEl;
  }

  private buildSortHeaderHTML(col: BroCol): string {
    const sortHeaderSelector = this.ctx.config.components.sortHeader.selector;

    const sortKey = <string>(col.sortKey || col.name);
    const arrowPosition: string = (col.dataType === 'number') ? 'before' : 'after';

    // The title of the column is text, as the values of its cells without html: true
    return `
      <${sortHeaderSelector} class="bro-cell_component bro-sort-header"
                             arrow-position="${arrowPosition}"
                             sort-id="${escape(sortKey)}" data-type="${escape(col.dataType)}"
                             header-title="${escape(col.title)}" tooltip="${escape(col.tooltip)}">${this.ctx.config.components.sortHeader.titleAsContent ? escape(col.title) : ''}</${sortHeaderSelector}>`;
  }
}

import type {BroConfiguredElement, BroPaginatorElement, BroPaginatorPageEvent, BroResolvedConfig} from '@table-bro/core';

import TablePagination, {type TablePaginationProps} from '@mui/material/TablePagination';
import {type ComponentType, createElement as h}     from 'react';

import {BroMuiElement} from './bro-mui-element';

/**
 * The paginator of the skin, the element bro-mui-paginator with the properties of BroPaginatorElement: the table
 * pagination of MUI with the texts of the config of the table. A change of the page or of the page size sends the event
 * page with the indexes of the pages, as the paginator of Angular Material.
 */
export class BroMuiPaginatorComponent extends BroMuiElement implements BroConfiguredElement, BroPaginatorElement {
  config?: BroResolvedConfig;

  private options: BroPaginatorElement = {pageIndex: 0, pageSize: 10, length: 0, pageSizeOptions: [], showFirstLastButtons: false, disabled: false};

  get disabled(): boolean {
    return this.options.disabled;
  }

  set disabled(disabled: boolean) {
    this.setOption('disabled', disabled);
  }

  get length(): number {
    return this.options.length;
  }

  set length(length: number) {
    this.setOption('length', length);
  }

  get pageIndex(): number {
    return this.options.pageIndex;
  }

  set pageIndex(pageIndex: number) {
    this.setOption('pageIndex', pageIndex);
  }

  get pageSize(): number {
    return this.options.pageSize;
  }

  set pageSize(pageSize: number) {
    this.setOption('pageSize', pageSize);
  }

  get pageSizeOptions(): number[] {
    return this.options.pageSizeOptions;
  }

  set pageSizeOptions(pageSizeOptions: number[]) {
    this.setOption('pageSizeOptions', pageSizeOptions);
  }

  get showFirstLastButtons(): boolean {
    return this.options.showFirstLastButtons;
  }

  set showFirstLastButtons(showFirstLastButtons: boolean) {
    this.setOption('showFirstLastButtons', showFirstLastButtons);
  }

  protected content() {
    const {disabled, length, pageIndex, pageSize, pageSizeOptions, showFirstLastButtons} = this.options;
    const texts = this.config?.texts;
    const labels = texts && {first: texts.firstPage, last: texts.lastPage, next: texts.nextPage, previous: texts.previousPage};

    // The pagination of MUI renders a cell of a table unless it takes a component: the table renders the paginator in a
    // div
    return h(<ComponentType<TablePaginationProps<'div'>>>TablePagination, {
      component: 'div',
      count: length,
      page: pageIndex,
      rowsPerPage: pageSize,
      rowsPerPageOptions: pageSizeOptions,
      showFirstButton: showFirstLastButtons,
      showLastButton: showFirstLastButtons,
      disabled,
      labelRowsPerPage: texts?.itemsPerPage,
      labelDisplayedRows: texts && (() => texts.rangeLabel(pageIndex, pageSize, length)),
      getItemAriaLabel: labels && (type => labels[type]),
      // The classes of the buttons of the paginator of the vanilla skins: a page, as a demo, finds the buttons by them
      slotProps: {
        actions: {
          firstButton: {className: 'bro-paginator-navigation-first'},
          previousButton: {className: 'bro-paginator-navigation-previous'},
          nextButton: {className: 'bro-paginator-navigation-next'},
          lastButton: {className: 'bro-paginator-navigation-last'}
        }
      },
      onPageChange: (_event, page) => this.changePage(page, pageSize),
      // The first row of the page stays on the page of the new size, as in the paginator of Angular Material
      onRowsPerPageChange: event => {
        const size = Number(event.target.value);

        this.changePage(Math.floor(pageIndex * pageSize / size), size);
      }
    });
  }

  /**
   * Shows the new page and sends the event page.
   * @param pageIndex - the index of the new page
   * @param pageSize - the new page size
   */
  private changePage(pageIndex: number, pageSize: number): void {
    const previousPageIndex = this.options.pageIndex;

    this.options = {...this.options, pageIndex, pageSize};
    this.update();

    this.emit<BroPaginatorPageEvent>('page', {pageIndex, previousPageIndex, pageSize, length: this.options.length});
  }

  /**
   * Sets an option that the table gives and renders the paginator with it.
   * @param name - the name of the option
   * @param value - its value
   */
  private setOption<K extends keyof BroPaginatorElement>(name: K, value: BroPaginatorElement[K]): void {
    this.options = {...this.options, [name]: value};
    this.update();
  }
}

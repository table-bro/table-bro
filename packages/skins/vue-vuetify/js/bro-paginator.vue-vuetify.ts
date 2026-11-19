import type {BroConfiguredElement, BroPaginatorElement, BroPaginatorPageEvent, BroResolvedConfig} from '@table-bro/core';

import {h}       from 'vue';
import {VBtn}    from 'vuetify/components/VBtn';
import {VSelect} from 'vuetify/components/VSelect';

import {BroVuetifyElement, icon} from './bro-vuetify-element';

/**
 * The paginator of the skin, the element bro-vuetify-paginator with the properties of BroPaginatorElement: the footer
 * of the data table of Vuetify, the select of the page size, the range of the rows and the buttons of the pages, with
 * the texts of the config of the table. A change of the page or of the page size sends the event page with the indexes
 * of the pages, as the paginator of Angular Material.
 */
export class BroVuetifyPaginatorComponent extends BroVuetifyElement implements BroConfiguredElement, BroPaginatorElement {
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
    const lastPage = Math.max(Math.ceil(length / pageSize) - 1, 0);

    // A button of a page, with the class of the button of the paginator of the vanilla skins: a page, as a demo, finds
    // the buttons by them
    const button = (name: 'first' | 'previous' | 'next' | 'last', ligature: string, page: number, active: boolean) => h(VBtn, {
      class: `bro-paginator-navigation-${name}`,
      'aria-label': texts?.[`${name}Page`],
      disabled: disabled || !active,
      icon: true,
      variant: 'text',
      density: 'comfortable',
      onClick: () => this.changePage(page, pageSize)
    }, () => icon(ligature));

    const buttons = [
      showFirstLastButtons ? button('first', 'first_page', 0, pageIndex > 0) : null,
      button('previous', 'chevron_left', pageIndex - 1, pageIndex > 0),
      button('next', 'chevron_right', pageIndex + 1, pageIndex < lastPage),
      showFirstLastButtons ? button('last', 'last_page', lastPage, pageIndex < lastPage) : null
    ];

    // The first row of the page stays on the page of the new size, as in the paginator of Angular Material
    const sizes = pageSizeOptions.length
      ? h('div', {class: 'bro-vuetify-paginator-page-size'}, [
          h('span', {class: 'bro-vuetify-paginator-label'}, texts?.itemsPerPage),
          h(VSelect, {
            class: 'bro-vuetify-paginator-select',
            'aria-label': texts?.itemsPerPage,
            modelValue: pageSize,
            items: pageSizeOptions,
            disabled,
            density: 'compact',
            variant: 'outlined',
            hideDetails: true,
            'onUpdate:modelValue': (size: number) => this.changePage(Math.floor(pageIndex * pageSize / size), size)
          })
        ])
      : null;

    return h('div', {class: 'bro-vuetify-paginator'}, [
      sizes,
      h('span', {class: 'bro-vuetify-paginator-range'}, texts?.rangeLabel(pageIndex, pageSize, length)),
      h('div', {class: 'bro-vuetify-paginator-actions'}, buttons)
    ]);
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

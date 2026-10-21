/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {BroConfiguredElement, BroDropdownOption, BroPaginatorElement, BroPaginatorPageEvent, BroResolvedConfig, BroTexts, BroView} from '@table-bro/core';
import {BroDom, BroHTML, BroHTMLElement, isPrerendered}                                                                                 from '@table-bro/core';

const {escape} = BroHTML;

export class BroPaginatorComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroPaginatorElement {
  template(): string {
    this.disabled = this.getAttribute('disabled') === 'true' || false;
    this.length = Number(this.getAttribute('length')) || 0;
    this.pageIndex = Math.max(Number(this.getAttribute('page-index')) || 0, 0);
    this.pageSize = Number(this.getAttribute('page-size'));
    // The table writes 'true' or 'false'; without the attribute the buttons are shown
    this.showFirstLastButtons = this.getAttribute('show-first-last-buttons') !== 'false';

    this.parsePageSizeOptions();

    const texts = this.texts = this.config.texts;

    // The vanilla skins, which have this paginator, give the classes of its list and their dropdown
    const ul = this.config.components.paginator.css?.ul;
    // No class attribute for a class the skin does not give
    const ulClass = ul?.className ? ` class="${escape(ul.className)}"` : '';
    const liClass = ul?.li?.className ? ` class="${escape(ul.li.className)}"` : '';
    const aClass = ul?.li?.a?.className ? `${escape(ul.li.a.className)} ` : '';

    this.dropdownSelector = <string>this.config.components.dropdown?.selector;

    return `
      <div class="bro-paginator-outer-container">
        <div class="bro-paginator-inner-container">
          <div class="bro-paginator-page-size">
            <div class="bro-paginator-page-size-label">
              ${escape(texts.itemsPerPage)}
            </div>

            ${this.pageSizeDropdown?.length ? '' : this.templatePageSizeValue()}
          </div>

          <div class="bro-paginator-range-actions">
            <div class="bro-paginator-range-label" aria-live="polite">
              ${escape(texts.rangeLabel(this.pageIndex, this.pageSize, this.length))}
            </div>

            <nav aria-label="${escape(texts.pageNavigation)}">
              <ul${ulClass}>
                ${this.showFirstLastButtons
                    ? `
                  <li${liClass}>
                    <a class="${aClass}bro-paginator-navigation-first" href=""
                       aria-label="${escape(texts.firstPage)}">${escape(texts.first)}</a>
                  </li>`
                    : ''
                }

                  <li${liClass}>
                    <a class="${aClass}bro-paginator-navigation-previous" href=""
                       aria-label="${escape(texts.previousPage)}">${escape(texts.previous)}</a>
                  </li>

                  <li${liClass}>
                    <a class="${aClass}bro-paginator-navigation-next" href=""
                       aria-label="${escape(texts.nextPage)}">${escape(texts.next)}</a>
                  </li>

                ${this.showFirstLastButtons
                    ? `
                  <li${liClass}>
                    <a class="${aClass}bro-paginator-navigation-last" href=""
                       aria-label="${escape(texts.lastPage)}">${escape(texts.last)}</a>
                  </li>`
                    : ''
                }
              </ul>
            </nav>
          </div>
        </div>
      </div>`;
  }

  static get observedAttributes() {
    return [
      'page-index', 'page-size', 'length',
      'page-size-options', 'disabled'
    ];
  }

  // The table sets the config, and the template reads the other values from the attributes, before the element renders
  config!: BroResolvedConfig;

  disabled!: boolean;
  length!: number;
  pageIndex!: number;
  pageSize!: number;
  pageSizeOptions!: number[];
  showFirstLastButtons!: boolean;

  private page!: BroPaginatorPageEvent;
  private eventName = 'page';

  // The elements of the template of the paginator, found when it renders
  private firstEl!: HTMLElement;
  private previousEl!: HTMLElement;
  private nextEl!: HTMLElement;
  private lastEl!: HTMLElement;

  private pageSizeEl!: HTMLElement;
  private pageSizeValueEl!: HTMLElement;
  private rangeLabelEl!: HTMLElement;

  private dropdownSelector!: string;
  /** The texts of the table, taken at the render: before it the attributes change nothing. */
  private texts?: BroTexts;
  private pageSizeDropdown?: BroDropdownOption[];
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events() {
    this.previousEl = <HTMLElement>this.querySelector('.bro-paginator-navigation-previous');
    this.nextEl = <HTMLElement>this.querySelector('.bro-paginator-navigation-next');

    this.previousEl.addEventListener('click', (event: Event) => {
      event.preventDefault();

      if (!this.hasPreviousPage()) {
        return;
      }

      this.navigate(this.pageIndex - 1);
    });

    this.nextEl.addEventListener('click', (event: Event) => {
      event.preventDefault();

      if (!this.hasNextPage()) {
        return;
      }

      this.navigate(this.pageIndex + 1);
    });

    if (this.showFirstLastButtons) {
      this.firstEl = <HTMLElement>this.querySelector('.bro-paginator-navigation-first');
      this.lastEl = <HTMLElement>this.querySelector('.bro-paginator-navigation-last');

      this.firstEl.addEventListener('click', (event: Event) => {
        event.preventDefault();

        if (!this.hasPreviousPage()) {
          return;
        }

        this.navigate(0);
      });

      this.lastEl.addEventListener('click', (event: Event) => {
        event.preventDefault();

        if (!this.hasNextPage()) {
          return;
        }

        this.navigate(this.getNumberOfPages() - 1);
      });
    }
  }

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    // The list gets the config of the table before it connects
    if (this.pageSizeDropdown?.length) {
      this.pageSizeEl = <HTMLElement>this.querySelector('.bro-paginator-page-size');

      this.renderPageSizeDropdown();
    }

    this.events();

    this.renderNavigationState();
  }

  connectedCallback(): void {
    // An element of a prerendered table keeps its markup until the table renders its own elements in its place
    if (isPrerendered(this)) {
      return;
    }

    if (this.rendered) {
      return;
    }

    this.rendered = true;

    this.render();
  }

  attributeChangedCallback(name: string, previousValue: string, currentValue: string) {
    if (!this.texts) {
      return;
    }

    if (name === 'page-index' || name === 'page-size' || name === 'length') {
      if (!this.rangeLabelEl) {
        this.rangeLabelEl = <HTMLElement>this.querySelector('.bro-paginator-range-label');
      }

      if (!this.pageSizeValueEl) {
        this.pageSizeValueEl = <HTMLElement>this.querySelector('.bro-paginator-page-size-value');
      }

      if (name === 'page-index') {
        this.pageIndex = +currentValue;
      }

      if (name === 'page-size') {
        this.pageSize = +currentValue;

        if (!this.pageSizeOptions.length) {
          this.pageSizeValueEl.innerText = currentValue;
        }
      }

      if (name === 'length') {
        this.length = +currentValue;
      }

      this.rangeLabelEl.textContent = this.texts.rangeLabel(this.pageIndex, this.pageSize, this.length);

      this.renderNavigationState();
    }

    if (name === 'page-size-options') {
      this.parsePageSizeOptions();

      this.unrenderPageSizeControls();

      if (!this.pageSizeEl) {
        this.pageSizeEl = <HTMLElement>this.querySelector('.bro-paginator-page-size');
      }

      if (this.pageSizeDropdown?.length) {
        this.renderPageSizeDropdown();
      } else {
        this.renderPageSizeValue();

        this.setAttribute('disabled', true.toString());
      }
    }

    if (name === 'disabled') {
      this.setDisabledState(currentValue === true.toString());
    }
  }

  /** Whether there is a previous page. */
  hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize != 0;
  }

  /** Whether there is a next page. */
  hasNextPage(): boolean {
    const maxPageIndex = this.getNumberOfPages() - 1;

    return this.pageIndex < maxPageIndex && this.pageSize != 0;
  }

  /** Calculate the number of pages */
  getNumberOfPages(): number {
    if (!this.pageSize) {
      return 0;
    }

    return Math.ceil(this.length / this.pageSize);
  }

  private parsePageSizeOptions() {
    if (!this.getAttribute('page-size-options')) {
      return;
    }

    try {
      this.pageSizeOptions = JSON.parse(<string>this.getAttribute('page-size-options'))
        .map((item: string) => +item);

      this.pageSizeDropdown = this.pageSizeOptions.map(item => {
        return {
          value: item.toString(),
          title: item.toString()
        };
      });
    } catch (err) {
      this.pageSizeOptions = [];

      if (this.config.debug) {
        console.log(err);
      }
    }
  }

  private templatePageSizeValue(): string {
    return `<div class="bro-paginator-page-size-value">${this.pageSize}</div>`;
  }

  private unrenderPageSizeControls(): void {
    const dropdown = <HTMLElement>this.querySelector(this.dropdownSelector);

    if (dropdown) {
      dropdown.remove();
    }

    const pageSizeValueEl = <HTMLElement>this.querySelector('.bro-paginator-page-size-value');

    if (pageSizeValueEl) {
      pageSizeValueEl.remove();
    }
  }

  private renderPageSizeDropdown(): void {
    const broDropdown: HTMLElement = new BroDom(this.ownerDocument).createElement(this.dropdownSelector);

    (<BroConfiguredElement>broDropdown).config = this.config;
    broDropdown.setAttribute('mode', 'select');
    broDropdown.setAttribute('button-title', this.pageSize.toString());
    broDropdown.setAttribute('options', JSON.stringify(this.pageSizeDropdown));
    broDropdown.setAttribute('label', this.texts!.itemsPerPage);
    // The list takes the state of the paginator at its render, as the select of MatPaginator does
    broDropdown.setAttribute('disabled', this.disabled.toString());

    this.eventsPageSize(broDropdown);

    this.pageSizeEl.append(
      broDropdown
    );
  }

  private eventsPageSize(broDropdown: Element) {
    broDropdown.addEventListener('value', (event: Event) => {
      const value: string = (<CustomEvent>event).detail;

      this.changePageSize(+value);

      this.setAttribute('page-size', value);
    });
  }

  private renderPageSizeValue(): void {
    this.pageSizeEl.insertAdjacentHTML('beforeend', this.templatePageSizeValue());
  }

  private setDisabledState(disable: boolean) {
    this.disabled = disable;

    const dropdown = <HTMLElement>this.querySelector(this.dropdownSelector);

    if (dropdown) {
      dropdown.setAttribute('disabled', disable.toString());
    }

    this.renderNavigationState();
  }

  /**
   * Disables the buttons of a disabled paginator, First and Previous on the first page, and Next and Last on the last
   * one, as MatPaginator does.
   */
  private renderNavigationState(): void {
    const noPrevious = this.disabled || !this.hasPreviousPage();
    const noNext = this.disabled || !this.hasNextPage();
    const buttons: [HTMLElement | undefined, boolean][] = [[this.firstEl, noPrevious], [this.previousEl, noPrevious], [this.nextEl, noNext], [this.lastEl, noNext]];

    buttons.forEach(([button, disable]) => {
      // The class shows the state, and aria-disabled tells it to screen readers
      if (disable) {
        button?.parentElement?.classList.add('disabled');
        button?.setAttribute('aria-disabled', 'true');
      } else {
        button?.parentElement?.classList.remove('disabled');
        button?.removeAttribute('aria-disabled');
      }
    });
  }

  /** Navigates to a specific page index. */
  private navigate(index: number) {
    const previousIndex = this.pageIndex;

    if (index !== previousIndex) {
      this.pageIndex = index;
      this.setAttribute('page-index', this.pageIndex.toString());
      this.emitPageEvent(previousIndex);
    }
  }

  /**
   * Changes the page size so that the first item displayed on the page will still be
   * displayed using the new page size.
   *
   * For example, if the page size is 10 and on the second page (items indexed 10-19) then
   * switching so that the page size is 5 will set the third page as the current page so
   * that the 10th item will still be displayed.
   */
  changePageSize(pageSize: number) {
    // Current page needs to be updated to reflect the new page size. Navigate to the page
    // containing the previous page's first item.
    const startIndex = this.pageIndex * this.pageSize;
    const previousIndex = this.pageIndex;

    this.pageIndex = Math.floor(startIndex / pageSize) || 0;
    this.pageSize = pageSize;
    this.emitPageEvent(previousIndex);
  }

  /** Emits an event notifying that a change of the paginator's properties has been triggered. */
  private emitPageEvent(previousPageIndex: number) {
    this.page = {
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length
    };

    this.dispatchEvent(
      new CustomEvent(this.eventName, {
        bubbles: true,
        composed: true,
        detail: this.page
      })
    );
  }
}

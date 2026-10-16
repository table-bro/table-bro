import {type BroColSort, type BroConfiguredElement, BroHTML, BroHTMLElement, type BroResolvedConfig, type BroSortDirection, type BroSortHeader, type BroView, dispatchAction, events} from '@table-bro/core';

const {escape} = BroHTML;

export class BroSortHeaderComponent extends BroHTMLElement implements BroView, BroConfiguredElement, BroSortHeader {
  template(): string {
    this.arrowPosition = <BroSortHeader['arrowPosition']>this.getAttribute('arrow-position') || 'after';
    this.sortId = this.getAttribute('sort-id') || '';
    this.dataType = this.getAttribute('data-type') || '';
    this.headerTitle = this.getAttribute('header-title') || '';
    this.iconHTML = this.getAttribute('icon-html') || '';
    this.tooltip = this.getAttribute('tooltip') || '';

    let classList: string = '';

    if (this.arrowPosition === 'before') {
      classList += ' bro-sort-header-position-before';
    }

    // The direction is descending by default
    classList += ' bro-sort-header-descending';

    // A control of the column header: Enter and Space sort, as a click does. A header without a title, as of a column
    // of buttons, sorts nothing and is no control, as in the mat skin
    const control = this.headerTitle ? ' role="button" tabindex="0"' : '';

    return `
      <div class="bro-sort-header-container${classList}"${control}>
        <div class="bro-sort-header-content">${escape(this.headerTitle)}</div>
        <div class="bro-sort-header-arrow" aria-hidden="true">${this.iconHTML}</div>
      </div>`;
  }

  static get observedAttributes(): string[] {
    return ['tooltip'];
  }

  config!: BroResolvedConfig;

  arrowPosition!: BroSortHeader['arrowPosition'];
  headerTitle!: string;
  dataType!: string;
  iconHTML!: string;
  sortId!: string;
  tooltip!: string;

  private _activeSort?: BroColSort;
  private direction: BroSortDirection | '' = '';
  /** Cleanup returned by afterRender of the skin, for example the removal of a tooltip. */
  private release?: void | (() => void);
  private released: boolean = false;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  events() {
    const headerContainerEl = <HTMLElement>this.children[0];

    if (!this.headerTitle) {
      return;
    }

    headerContainerEl.addEventListener('blur', () => {
      headerContainerEl.classList.remove('bro-sort-header-recently-cleared-ascending');
    });

    // The header is a button for the keyboard too: Enter and Space sort it as a click does
    headerContainerEl.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        headerContainerEl.click();
      }
    });

    headerContainerEl.addEventListener('click', () => {
      if (this.direction === '') {
        this.direction = 'desc';

        headerContainerEl.classList.add('bro-sort-header-sorted');

        headerContainerEl.classList.remove('bro-sort-header-recently-cleared-ascending');
      } else if (this.direction === 'desc') {
        this.direction = 'asc';

        headerContainerEl.classList.remove('bro-sort-header-descending');
      } else if (this.direction === 'asc') {
        this.direction = '';

        headerContainerEl.classList.remove('bro-sort-header-sorted');
        headerContainerEl.classList.add('bro-sort-header-descending');

        headerContainerEl.classList.add('bro-sort-header-recently-cleared-ascending');
      }

      // The third click clears the sort, as in the mat skin: sortDirection is undefined then
      dispatchAction(this, events.filtersSortEvent, {
        sortKey: this.sortId,
        sortDirection: this.direction || undefined
      });
    });
  }

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    this.afterRender();

    this.events();
  }

  get activeSort(): BroColSort | undefined {
    return this._activeSort;
  }

  /** A sort of another column resets the arrow of this header. */
  set activeSort(sort: BroColSort) {
    this._activeSort = sort;

    const container = this.children[0];

    if (this.direction !== '' && sort?.sortKey !== this.sortId && container) {
      this.direction = '';

      container.classList.remove('bro-sort-header-sorted');
      container.classList.add('bro-sort-header-descending');
    }
  }

  connectedCallback(): void {
    if (this.rendered) {
      if (this.released) {
        this.released = false;

        this.afterRender();
      }

      return;
    }

    this.rendered = true;

    this.render();
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task; only a removed element releases the skin callback
    queueMicrotask(() => {
      if (!this.isConnected) {
        if (typeof this.release === 'function') {
          this.release();
        }

        this.release = undefined;
        this.released = true;
      }
    });
  }

  /** The table gives a new tooltip when the width of the column changes: the skin callback runs again with it. */
  attributeChangedCallback(name: string, oldValue: string | null, value: string | null): void {
    if (!this.rendered || oldValue === value) {
      return;
    }

    this.tooltip = value || '';

    if (typeof this.release === 'function') {
      this.release();
    }

    this.release = undefined;

    // A header out of the document gets the callback again when it is connected
    if (this.isConnected) {
      this.afterRender();
    } else {
      this.released = true;
    }
  }

  private afterRender(): void {
    const container = this.children[0];

    this.release = this.config.components.sortHeader.afterRender?.(container, this.tooltip);
  }
}

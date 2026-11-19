import {type BroColSort, BroDom, BroHTMLElement, type BroSortHeader, dispatchAction, events} from '@table-bro/core';

import {iconHTML}              from './bro-m3-svelte-element';
import {attachM3SvelteTooltip} from './m3-tooltip';

/** The direction of the sort of a header: none, or the one of its arrow. */
type BroM3SvelteSortDirection = '' | 'asc' | 'desc';

/**
 * The sort header of a column, the element bro-m3-svelte-sort-header with the attributes of BroSortHeader: the title, its
 * tooltip, and the arrow of the sort, before the title of a number column. M3 Svelte has no sort header, so it renders
 * plain nodes in the type and the colors of Material 3. A click, Enter or Space sorts in the order of the skin mat:
 * descending, ascending, then not sorted.
 */
export class BroM3SvelteSortHeaderComponent extends BroHTMLElement implements BroSortHeader {
  /** The direction of the sort of this header. */
  private direction: BroM3SvelteSortDirection = '';
  /** Removes the tooltip and the listeners when the element leaves the DOM. */
  private release: (() => void) | null = null;
  private sort?: BroColSort;

  get activeSort(): BroColSort | undefined {
    return this.sort;
  }

  /** The active sort of the table: a sort of another column resets the arrow of this header. */
  set activeSort(sort: BroColSort | undefined) {
    this.sort = sort;

    if (this.direction && sort?.sortKey !== this.sortId) {
      this.setDirection('');
    }
  }

  get arrowPosition(): BroSortHeader['arrowPosition'] {
    return (this.getAttribute('arrow-position') === 'before') ? 'before' : 'after';
  }

  get dataType(): string {
    return this.getAttribute('data-type') ?? '';
  }

  get headerTitle(): string {
    return this.getAttribute('header-title') ?? '';
  }

  /** The key of the sort of the column, which the table gives every header. */
  get sortId(): string {
    return this.getAttribute('sort-id') ?? '';
  }

  /** The tooltip of a title that its column cuts, which the table sets later: the tooltip reads it when it shows. */
  get tooltip(): string {
    return this.getAttribute('tooltip') ?? '';
  }

  connectedCallback(): void {
    // A header without a title, as of a column of buttons, sorts nothing and is no control, as in the skin mat
    if (!this.headerTitle) {
      return;
    }

    if (!this.firstChild) {
      this.render();
    }

    const control = <HTMLElement>this.firstElementChild;

    if (this.release) {
      return;
    }

    const removeTooltip = attachM3SvelteTooltip(control, () => this.tooltip, {position: 'right', host: this});
    const onClick = () => this.onSort();
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.onSort();
      }
    };

    control.addEventListener('click', onClick);
    control.addEventListener('keydown', onKeydown);

    this.release = () => {
      removeTooltip();
      control.removeEventListener('click', onClick);
      control.removeEventListener('keydown', onKeydown);
    };
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task: only a removed element drops its listeners
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.release?.();
        this.release = null;
      }
    });
  }

  /** Renders the title and the arrow of the header. */
  private render(): void {
    const dom = new BroDom(this.ownerDocument);
    const control = dom.createElement('div');
    const content = dom.createElement('span');

    control.className = (this.arrowPosition === 'before') ? 'bro-m3-svelte-sort-header bro-m3-svelte-sort-header_before' : 'bro-m3-svelte-sort-header';
    control.setAttribute('role', 'button');
    control.tabIndex = 0;
    content.className = 'bro-m3-svelte-sort-header-content';
    content.textContent = this.headerTitle;
    control.append(content);
    control.insertAdjacentHTML('beforeend', iconHTML('arrow_upward'));
    control.lastElementChild!.classList.add('bro-m3-svelte-sort-header-arrow');
    this.append(control);
  }

  /**
   * Shows the direction of the sort of this header by its arrow.
   * @param direction - the direction, or none
   */
  private setDirection(direction: BroM3SvelteSortDirection): void {
    const control = this.firstElementChild;

    this.direction = direction;

    control?.classList.toggle('bro-m3-svelte-sort-header_sorted', !!direction);
    control?.classList.toggle('bro-m3-svelte-sort-header_ascending', direction === 'asc');
  }

  private onSort(): void {
    const next: Record<BroM3SvelteSortDirection, BroM3SvelteSortDirection> = {'': 'desc', desc: 'asc', asc: ''};

    this.setDirection(next[this.direction]);

    dispatchAction(this, events.filtersSortEvent, {
      sortKey: this.sortId,
      sortDirection: this.direction || undefined
    });
  }
}

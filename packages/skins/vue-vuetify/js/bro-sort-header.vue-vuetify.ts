import {type BroColSort, type BroSortHeader, dispatchAction, events} from '@table-bro/core';

import {h, mergeProps} from 'vue';
import {VTooltip}      from 'vuetify/components/VTooltip';

import {BroVuetifyElement, icon} from './bro-vuetify-element';

/** The direction of the sort of a header: none, or the one of its arrow. */
type BroVuetifySortDirection = '' | 'asc' | 'desc';

/**
 * The sort header of a column, the element bro-vuetify-sort-header with the attributes of BroSortHeader: the title and
 * the sort arrow of a header of the data table of Vuetify, with its tooltip, and the arrow before the title of a number
 * column. A click sorts in the order of the skin mat: descending, ascending, then not sorted.
 */
export class BroVuetifySortHeaderComponent extends BroVuetifyElement implements BroSortHeader {
  static get observedAttributes(): string[] {
    return ['tooltip'];
  }

  /** The direction of the sort of this header. */
  private direction: BroVuetifySortDirection = '';
  private sort?: BroColSort;

  get activeSort(): BroColSort | undefined {
    return this.sort;
  }

  /** The active sort of the table: a sort of another column resets the arrow of this header. */
  set activeSort(sort: BroColSort | undefined) {
    this.sort = sort;

    if (this.direction && sort?.sortKey !== this.sortId) {
      this.direction = '';
      this.update();
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

  get tooltip(): string {
    return this.getAttribute('tooltip') ?? '';
  }

  /** The table sets the tooltip of a title that its column cuts. */
  attributeChangedCallback(): void {
    this.update();
  }

  protected content() {
    if (!this.headerTitle) {
      return null;
    }

    const classes = ['bro-vuetify-sort-header'];

    if (this.direction) {
      classes.push('bro-vuetify-sort-header_sorted', `bro-vuetify-sort-header_${this.direction}`);
    }

    if (this.arrowPosition === 'before') {
      classes.push('bro-vuetify-sort-header_before');
    }

    // The arrow points up for the ascending sort and turns down for the descending one, as in the data table of Vuetify
    return h(VTooltip, {text: this.tooltip, disabled: !this.tooltip, location: 'right'}, {
      activator: ({props}: {props: Record<string, unknown>}) => h('button', mergeProps(props, {class: classes.join(' '), type: 'button', onClick: () => this.onSort()}), [
        h('span', {class: 'bro-vuetify-sort-header-content'}, this.headerTitle),
        icon('arrow_upward', 'bro-vuetify-sort-header-icon')
      ])
    });
  }

  private onSort(): void {
    const next: Record<BroVuetifySortDirection, BroVuetifySortDirection> = {'': 'desc', desc: 'asc', asc: ''};

    this.direction = next[this.direction];

    dispatchAction(this, events.filtersSortEvent, {
      sortKey: this.sortId,
      sortDirection: this.direction || undefined
    });

    this.update();
  }
}

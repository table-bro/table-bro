import {type BroColSort, type BroSortHeader, dispatchAction, events} from '@table-bro/core';

import TableSortLabel       from '@mui/material/TableSortLabel';
import Tooltip              from '@mui/material/Tooltip';
import {createElement as h} from 'react';

import {BroMuiElement, tooltipSlotProps} from './bro-mui-element';

/** The direction of the sort of a header: none, or the one of its arrow. */
type BroMuiSortDirection = '' | 'asc' | 'desc';

/**
 * The sort header of a column, the element bro-mui-sort-header with the attributes of BroSortHeader: the sort label of
 * MUI with the title, its tooltip, and the arrow before the title of a number column. A click sorts in the order of the
 * skin mat: descending, ascending, then not sorted.
 */
export class BroMuiSortHeaderComponent extends BroMuiElement implements BroSortHeader {
  static get observedAttributes(): string[] {
    return ['tooltip'];
  }

  /** The direction of the sort of this header. */
  private direction: BroMuiSortDirection = '';
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

    const label = h(TableSortLabel, {
      className: (this.arrowPosition === 'before') ? 'bro-mui-sort-header_before' : undefined,
      active: !!this.direction,
      direction: this.direction || 'desc',
      onClick: () => this.onSort()
    }, h('span', {className: 'bro-mui-sort-header-content'}, this.headerTitle));

    return h(Tooltip, {title: this.tooltip, placement: 'right', slotProps: tooltipSlotProps, children: label});
  }

  private onSort(): void {
    const next: Record<BroMuiSortDirection, BroMuiSortDirection> = {'': 'desc', desc: 'asc', asc: ''};

    this.direction = next[this.direction];

    dispatchAction(this, events.filtersSortEvent, {
      sortKey: this.sortId,
      sortDirection: this.direction || undefined
    });

    this.update();
  }
}

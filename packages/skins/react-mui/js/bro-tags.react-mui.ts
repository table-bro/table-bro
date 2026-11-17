import {type BroCellElement, type BroCol, type BroConfiguredElement, type BroResolvedConfig, type BroRow, fitCellItems} from '@table-bro/core';

import Chip                 from '@mui/material/Chip';
import {createElement as h} from 'react';

import {BroMuiElement} from './bro-mui-element';

/** The texts of the tags of the skin, as the ones of the tags of the skins bs and nv. */
export interface BroTagsTexts {
  /** The text of a cell of tags without items, No data by default. */
  empty: string;
}

/** The texts that the application gives the tags by withTags() and setTagsTexts(). */
let tagsTexts: Partial<BroTagsTexts> = {};
/** The tags in the DOM, which a new text of a cell without items renders again. */
const connectedTags = new Set<BroMuiTagsComponent>();

/**
 * Sets the texts of the tags of the skin, as when the language of the page changes: the tags in the DOM take them at
 * once. They take the place of texts.noItems of the config of a table.
 * @param texts - the texts that change
 */
export function setTagsTexts(texts: Partial<BroTagsTexts>): void {
  tagsTexts = {...tagsTexts, ...texts};
  connectedTags.forEach(tags => tags.renderTexts());
}

/**
 * The tags of a cell, the element bro-mui-tags: the items of the field of the column in the row, as the chips of MUI.
 */
export class BroMuiTagsComponent extends BroMuiElement implements BroCellElement, BroConfiguredElement {
  col?: BroCol;
  row?: BroRow;
  /** The config of the table, which the table gives the elements of its cells: the text of a cell without items. */
  config?: BroResolvedConfig;

  /** Stops fitting the chips into the line when the element leaves the DOM. */
  private fitting: AbortController | null = null;

  override connectedCallback(): void {
    connectedTags.add(this);
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    connectedTags.delete(this);
    super.disconnectedCallback();
  }

  /** Renders the text of a cell without items again, as setTagsTexts() changes it. */
  renderTexts(): void {
    this.update();
  }

  protected content() {
    const name = this.col?.name;
    const items = name && this.row?.[name];
    const chips: string[] = (Array.isArray(items) && items.length) ? items : [tagsTexts.empty ?? this.config?.texts.noItems ?? 'No data'];
    const label = (item: string) => this.col?.html ? h('span', {dangerouslySetInnerHTML: {'__html': item}}) : item;

    // The chips that do not fit the line give way to an ellipsis, from the first render on
    return h('div', {className: 'bro-mui-tags-chips', ref: (row: HTMLDivElement | null) => this.fit(row)},
      chips.map((item, i) => h(Chip, {key: i, label: label(item), variant: 'outlined'})));
  }

  /**
   * Fits the chips of the rendered line into the cell, until the line goes: React gives the ref null when it renders
   * the line again or the root of the element goes.
   * @param row - the line of the chips, or null when it goes
   */
  private fit(row: HTMLElement | null): void {
    this.fitting?.abort();
    this.fitting = null;

    if (row) {
      this.fitting = new AbortController();
      fitCellItems(row, this.fitting.signal);
    }
  }
}

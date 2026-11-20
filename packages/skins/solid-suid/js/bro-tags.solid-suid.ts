import {type BroCellElement, type BroCol, type BroConfiguredElement, type BroResolvedConfig, type BroRow, fitCellItems} from '@table-bro/core';

import Chip from '@suid/material/Chip';

import {BroSuidElement, suid, tag} from './bro-suid-element';

/** The texts of the tags of the skin, as the ones of the tags of the skins bs and nv. */
export interface BroTagsTexts {
  /** The text of a cell of tags without items, No data by default. */
  empty: string;
}

/** The texts that the application gives the tags by withTags() and setTagsTexts(). */
let tagsTexts: Partial<BroTagsTexts> = {};
/** The tags in the DOM, which a new text of a cell without items renders again. */
const connectedTags = new Set<BroSuidTagsComponent>();

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
 * The tags of a cell, the element bro-suid-tags: the items of the field of the column in the row, as the chips of
 * SUID.
 */
export class BroSuidTagsComponent extends BroSuidElement implements BroCellElement, BroConfiguredElement {
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
    const empty = () => {
      this.changed();

      return tagsTexts.empty ?? this.config?.texts.noItems ?? 'No data';
    };

    const label = (item: string) => this.col?.html ? tag('span', {innerHTML: item}) : item;
    const chips = (Array.isArray(items) && items.length)
      ? items.map((item: string) => suid(Chip, {label: label(item), variant: 'outlined'}))
      : suid(Chip, {
          variant: 'outlined',
          get label() {
            return empty();
          }
        });

    return tag('div', {class: 'bro-suid-tags-chips', children: chips});
  }

  /** The chips that do not fit the line give way to an ellipsis, from the first render on. */
  protected override rendered(): void {
    this.fitting = new AbortController();
    fitCellItems(this.querySelector<HTMLElement>('.bro-suid-tags-chips')!, this.fitting.signal);
  }

  protected override unmounted(): void {
    this.fitting?.abort();
    this.fitting = null;
  }
}

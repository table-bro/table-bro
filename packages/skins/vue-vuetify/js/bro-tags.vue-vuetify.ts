import {type BroCellElement, type BroCol, type BroConfiguredElement, type BroResolvedConfig, type BroRow, fitCellItems} from '@table-bro/core';

import {h}     from 'vue';
import {VChip} from 'vuetify/components/VChip';

import {BroVuetifyElement} from './bro-vuetify-element';

/** The texts of the tags of the skin, as the ones of the tags of the skins bs and nv. */
export interface BroTagsTexts {
  /** The text of a cell of tags without items, No data by default. */
  empty: string;
}

/** The texts that the application gives the tags by withTags() and setTagsTexts(). */
let tagsTexts: Partial<BroTagsTexts> = {};
/** The tags in the DOM, which a new text of a cell without items renders again. */
const connectedTags = new Set<BroVuetifyTagsComponent>();

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
 * The tags of a cell, the element bro-vuetify-tags: the items of the field of the column in the row, as the chips of
 * Vuetify.
 */
export class BroVuetifyTagsComponent extends BroVuetifyElement implements BroCellElement, BroConfiguredElement {
  col?: BroCol;
  row?: BroRow;
  /** The config of the table, which the table gives the elements of its cells: the text of a cell without items. */
  config?: BroResolvedConfig;

  /** Stops fitting the chips into the line when the element leaves the DOM or renders them again. */
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
    // The text of a chip is a block of its own: the content of a chip of Vuetify is an inline flex box, whose text takes
    // no ellipsis
    const label = (item: string) => this.col?.html
      ? h('span', {class: 'bro-vuetify-tags-label', innerHTML: item})
      : h('span', {class: 'bro-vuetify-tags-label'}, item);

    return h('div', {class: 'bro-vuetify-tags-chips'}, chips.map(item => h(VChip, {variant: 'outlined'}, () => label(item))));
  }

  /**
   * Renders the chips, then fits them into the line of the cell: the chips that do not fit give way to an ellipsis,
   * from the first render on.
   */
  protected override update(): void {
    super.update();

    const line = this.querySelector<HTMLElement>('.bro-vuetify-tags-chips');

    this.fitting?.abort();
    this.fitting = null;

    if (line) {
      this.fitting = new AbortController();
      fitCellItems(line, this.fitting.signal);
    }
  }

  protected override unmounted(): void {
    this.fitting?.abort();
    this.fitting = null;
  }
}

import {type BroCellElement, type BroCol, type BroConfiguredElement, BroHTMLElement, type BroResolvedConfig, type BroRow, type BroView, fitCellItems} from '@table-bro/core';

/** The texts of the tags of a skin. */
export interface BroTagsTexts {
  /** The text of a cell of tags without items, No data by default. */
  empty: string;
}

/** The texts that the application gives the tags by withTags() and setTagsTexts() of the skin. */
let tagsTexts: Partial<BroTagsTexts> = {};
/** The tags in the DOM, which a new text of a cell without items renders again. */
const connectedTags = new Set<BroTagsComponent>();

/**
 * Sets the texts of the tags of the skin, as when the language of the page changes: the tags in the DOM take them at
 * once. They take the place of texts.noItems of the config of a table.
 * @param texts - the texts that change
 */
export function setTagsTexts(texts: Partial<BroTagsTexts>): void {
  tagsTexts = {...tagsTexts, ...texts};
  connectedTags.forEach(tags => tags.renderEmpty());
}

/**
 * The tags of a cell of the vanilla skins: the items of the field of the column in the row, each in the markup of a tag
 * of the skin.
 */
export abstract class BroTagsComponent extends BroHTMLElement implements BroView, BroCellElement, BroConfiguredElement {
  template(): string {
    const name = this.col?.name;
    const items = name && this.row?.[name];

    this.empty = !(Array.isArray(items) && items.length);
    this.items = this.empty ? [this.emptyText()] : <string[]>items;

    return this.items.map(() => this.tagHTML).join('');
  }

  row?: BroRow;
  col?: BroCol;
  config?: BroResolvedConfig;

  items: string[] = [];
  /** Whether the cell has no items and shows the text of an empty cell. */
  private empty: boolean = false;

  /** Stops fitting the tags into the line when the element leaves the DOM. */
  private fitting?: AbortController;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());
    Array.from(this.children).forEach((tagEl: Element, i: number) => this.renderTag(tagEl, this.items[i]));
  }

  /** Renders the text of an empty cell again, as setTagsTexts() changes it. */
  renderEmpty(): void {
    if (this.empty && this.firstElementChild) {
      this.items = [this.emptyText()];
      this.renderTag(this.firstElementChild, this.items[0]);
    }
  }

  /**
   * Puts an item into its tag: a tag is markup only for a column with html: true.
   * @param tagEl - the tag
   * @param item - the item
   */
  private renderTag(tagEl: Element, item: string): void {
    if (this.col?.html) {
      tagEl.innerHTML = item;
    } else {
      tagEl.textContent = item;
    }
  }

  /** The text of an empty cell: the one of the skin, the deprecated texts.noItems of the table, or No data. */
  private emptyText(): string {
    return tagsTexts.empty ?? this.config?.texts.noItems ?? 'No data';
  }

  /** The empty markup of one tag of the skin, which takes the text of an item. */
  protected abstract readonly tagHTML: string;

  connectedCallback(): void {
    connectedTags.add(this);

    if (!this.rendered) {
      this.rendered = true;

      this.render();
    } else {
      // The texts may have changed while the element was out of the DOM
      this.renderEmpty();
    }

    // The tags that do not fit the line give way to an ellipsis
    this.fitting = new AbortController();
    fitCellItems(this, this.fitting.signal);
  }

  disconnectedCallback(): void {
    connectedTags.delete(this);
    this.fitting?.abort();
  }
}

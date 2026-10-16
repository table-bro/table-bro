import {type BroCellElement, type BroCol, type BroConfiguredElement, BroHTMLElement, type BroResolvedConfig, type BroRow, type BroView, fitCellItems} from '@table-bro/core';

/**
 * The tags of a cell of the vanilla skins: the items of the field of the column in the row, each in the markup of a tag
 * of the skin.
 */
export abstract class BroTagsComponent extends BroHTMLElement implements BroView, BroCellElement, BroConfiguredElement {
  template(): string {
    const name = this.col?.name;
    const items = name && this.row?.[name];

    this.items = Array.isArray(items) && items.length ? items : [this.config?.texts.noItems ?? ''];

    return this.items.map(() => this.tagHTML).join('');
  }

  row?: BroRow;
  col?: BroCol;
  config?: BroResolvedConfig;

  items: string[] = [];

  /** Stops fitting the tags into the line when the element leaves the DOM. */
  private fitting?: AbortController;
  /** A move in the DOM connects the element again; it keeps its markup and listeners. */
  private rendered: boolean = false;

  render(): void {
    this.insertAdjacentHTML('afterbegin', this.template());

    // A tag is markup only for a column with html: true
    Array.from(this.children).forEach((tagEl: Element, i: number) => {
      if (this.col?.html) {
        tagEl.innerHTML = this.items[i];
      } else {
        tagEl.textContent = this.items[i];
      }
    });
  }

  /** The empty markup of one tag of the skin, which takes the text of an item. */
  protected abstract readonly tagHTML: string;

  connectedCallback(): void {
    if (!this.rendered) {
      this.rendered = true;

      this.render();
    }

    // The tags that do not fit the line give way to an ellipsis
    this.fitting = new AbortController();
    fitCellItems(this, this.fitting.signal);
  }

  disconnectedCallback(): void {
    this.fitting?.abort();
  }
}

import {type BroCellElement, type BroCol, type BroConfiguredElement, BroDom, BroHTML, type BroResolvedConfig, type BroRow, fitCellItems} from '@table-bro/core';

import {Chip} from 'm3-svelte';

import {BroM3SvelteElement, BroM3SvelteMarkup, type BroM3SveltePart} from './bro-m3-svelte-element';

/** The texts of the tags of the skin, as the ones of the tags of the skins bs and nv. */
export interface BroTagsTexts {
  /** The text of a cell of tags without items, No data by default. */
  empty: string;
}

/** The texts that the application gives the tags by withTags() and setTagsTexts(). */
let tagsTexts: Partial<BroTagsTexts> = {};
/** The tags in the DOM, which a new text of a cell without items renders again. */
const connectedTags = new Set<BroM3SvelteTagsComponent>();

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
 * The tags of a cell, the element bro-m3-svelte-tags: the items of the field of the column in the row, as the input chips of
 * M3 Svelte, which show information. A chip is a label, not a button: a chip of a cell is no control.
 */
export class BroM3SvelteTagsComponent extends BroM3SvelteElement implements BroCellElement, BroConfiguredElement {
  col?: BroCol;
  row?: BroRow;
  /** The config of the table, which the table gives the elements of its cells: the text of a cell without items. */
  config?: BroResolvedConfig;

  /** The chips in their order, with the markup of their labels. */
  private chips: {chip: BroM3SveltePart; label: BroM3SvelteMarkup}[] = [];
  /** Stops fitting the chips into the line when the element leaves the DOM. */
  private fitting: AbortController | null = null;
  /** The line of the chips. */
  private line: HTMLElement | null = null;

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

  protected render(container: HTMLElement): void {
    this.line = new BroDom(this.ownerDocument).createElement('div');
    this.line.className = 'bro-m3-svelte-tags-chips';
    container.append(this.line);
  }

  /** Gives each chip its item, mounts the chips of new items and unmounts the ones of the items that are gone. */
  protected refresh(): void {
    const line = this.line!;
    const items = this.items();

    while (this.chips.length > items.length) {
      this.chips.pop()!.chip.destroy();
    }

    items.forEach((item, i) => {
      const entry = this.chips[i];
      const html = `<span>${this.col?.html ? item : BroHTML.escape(item)}</span>`;

      if (entry) {
        entry.chip.set({variant: 'input', label: true, children: entry.label.of(html)});
      } else {
        const label = new BroM3SvelteMarkup();

        this.chips.push({chip: this.mountPart(Chip, line, {variant: 'input', label: true, children: label.of(html)}), label});
      }
    });

    // The chips that do not fit the line give way to an ellipsis, from the first render on
    this.fitting?.abort();
    this.fitting = new AbortController();
    fitCellItems(line, this.fitting.signal);
  }

  protected override unmounted(): void {
    this.fitting?.abort();
    this.fitting = null;
    this.chips = [];
    this.line = null;
  }

  /** The items of the cell, or the text of a cell without items. */
  private items(): string[] {
    const name = this.col?.name;
    const items = name && this.row?.[name];

    return (Array.isArray(items) && items.length) ? items : [tagsTexts.empty ?? this.config?.texts.noItems ?? 'No data'];
  }
}

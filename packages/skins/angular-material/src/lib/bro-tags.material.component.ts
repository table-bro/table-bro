import {afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, Injectable, input, signal} from '@angular/core';

import {MatChip, MatChipSet}                                            from '@angular/material/chips';
import {type BroCol, type BroResolvedConfig, type BroRow, fitCellItems} from '@table-bro/core';

/**
 * The texts of the tags of the skin mat, which withTags({texts}) sets and the application changes at any time, as when
 * the language of the page changes: the chips in the DOM take them at once.
 */
@Injectable({providedIn: 'root'})
export class TableBroMatTagsTexts {
  /** The text of a cell of tags without items; without it the tags take the deprecated texts.noItems of the table, or No data. */
  readonly empty = signal<string | undefined>(undefined);
}

/** The tags of a cell: the items of the field of the column, as the chips of Material. */
@Component({
  template: `
    <mat-chip-set>
      @for (chip of chipList(); track $index) {
        <mat-chip>{{ chip }}</mat-chip>
      }
    </mat-chip-set>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatChip,
    MatChipSet
  ]
})
export class BroMaterialTagsComponent {
  readonly col = input<BroCol>();
  readonly row = input<BroRow>();
  /** The config of the table, which the table gives the elements of its cells: the text of a cell without items. */
  readonly config = input<BroResolvedConfig>();

  /** The items of the field of the column in the row. */
  readonly chipList = computed<string[]>(() => {
    const name = this.col()?.name;
    const items = name && this.row()?.[name];

    return Array.isArray(items) && items.length ? items : [this.texts.empty() ?? this.config()?.texts.noItems ?? 'No data'];
  });

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly texts: TableBroMatTagsTexts = inject(TableBroMatTagsTexts);

  /** Stops fitting the chips into the line when the component goes. */
  private readonly fitting: AbortController = new AbortController();

  constructor() {
    // The chips that do not fit the line give way to an ellipsis
    afterNextRender(() => {
      const chips = this.elementRef.nativeElement.querySelector<HTMLElement>('.mdc-evolution-chip-set__chips');

      if (chips) {
        fitCellItems(chips, this.fitting.signal);
      }
    });

    inject(DestroyRef).onDestroy(() => this.fitting.abort());
  }
}

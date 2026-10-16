import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';

import {MatTooltip}                             from '@angular/material/tooltip';
import {broCellSelectors, type BroCol, BroHTML} from '@table-bro/core';

/** A value wider than its column, with the whole value in a tooltip: the element bro-mat-text-ellipsis of BroTextEllipsis. */
@Component({
  template: `
    <span matTooltipPosition="above"
          class="{{ tableCellTextEllipsisContainer }}{{ containerClassName() ? ' ' + containerClassName() : '' }}"
          [matTooltip]="tooltip()">
      @if (col()?.html) {
        <span class="{{ tableCellTextEllipsis }}" [innerHTML]="value()"></span>
      } @else {
        <span class="{{ tableCellTextEllipsis }}">{{ value() }}</span>
      }
    </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTooltip
  ]
})
export class BroMaterialTextEllipsisComponent {
  /** The column of the cell: with html: true the value is markup. */
  readonly col = input<BroCol>();

  readonly containerClassName = input<string | null>(null, {alias: 'container-class'});
  readonly value = input<string>('');

  /** The text of the value: the text of the markup of an HTML value. */
  readonly tooltip = computed(() => this.col()?.html ? BroHTML.text(this.value()) : this.value());

  readonly tableCellTextEllipsisContainer = broCellSelectors.ellipsisContainer;
  readonly tableCellTextEllipsis = broCellSelectors.ellipsis;
}

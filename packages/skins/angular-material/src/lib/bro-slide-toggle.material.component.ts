import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';

import {MatSlideToggle}      from '@angular/material/slide-toggle';
import type {BroCol, BroRow} from '@table-bro/core';

/**
 * A switch of a boolean of a cell. A change sends the action of the attribute name in the output action, which the
 * table turns into bro-action with the column and the row (event: 'action' of the column); the title of the column
 * names the switch for screen readers.
 */
@Component({
  template: `
    <mat-slide-toggle [hideIcon]="true" [checked]="checked()" [aria-label]="col()?.title ?? null" (change)="onChange()"></mat-slide-toggle>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSlideToggle
  ]
})
export class BroMaterialSlideToggleComponent<T extends object = BroRow> {
  readonly col = input<BroCol<T>>();
  readonly row = input<T>();

  /** The action of a change. */
  readonly name = input<string>();

  readonly action = output<string>();

  /** The value of the field of the column in the row. */
  readonly checked = computed(() => {
    const name = this.col()?.name;

    return !!(name && this.row()?.[name]);
  });

  onChange() {
    const name = this.name();

    if (name) {
      this.action.emit(name);
    }
  }
}

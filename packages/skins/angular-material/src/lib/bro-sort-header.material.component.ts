import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, signal, viewChild} from '@angular/core';

import {MatSort, MatSortHeader, type Sort, type SortDirection, type SortHeaderArrowPosition} from '@angular/material/sort';
import {MatTooltip}                                                                          from '@angular/material/tooltip';
import {type BroColDataType, type BroColSort, type BroSortHeader, dispatchAction, events}    from '@table-bro/core';

/** The sort header of a column, the element bro-mat-sort-header with the properties of BroSortHeader. */
@Component({
  template: `
    @if (headerTitle()) {
      <div matSort matSortStart="desc"
           [matSortDirection]="matSortDirection()"
           (matSortChange)="onSort($event)">
        <div [mat-sort-header]="id()" matTooltipPosition="right"
             [arrowPosition]="arrowPosition()" [matTooltip]="tooltip()">
          <ng-content></ng-content>
        </div>
      </div>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatSort,
    MatSortHeader,
    MatTooltip
  ]
})
export class BroMaterialSortHeaderComponent {
  /** The active sort of the table: a sort of another column resets the arrow of this header. */
  readonly activeSort = input<BroColSort>();
  readonly arrowPosition = input<BroSortHeader['arrowPosition'] | SortHeaderArrowPosition>('after', {alias: 'arrow-position'});
  readonly dataType = input<BroColDataType>(undefined, {alias: 'data-type'});
  readonly headerTitle = input<string>('', {alias: 'header-title'});
  readonly sortId = input<string>('', {alias: 'sort-id'});
  readonly tooltip = input<string>('');

  /** The key of the column, or an own one of the header. */
  readonly id = computed(() => this.sortId() || `bro-${Math.random().toString(36).slice(2)}`);
  readonly matSortDirection = signal<SortDirection>('');

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly sortHeader = viewChild(MatSortHeader, {read: ElementRef});
  private sortedDirection: SortDirection = '';

  constructor() {
    effect(() => {
      const sort = this.activeSort();

      if (this.sortedDirection !== '' && sort?.sortKey !== this.id()) {
        this.sortedDirection = '';
        this.matSortDirection.set('');
      }
    });

    // The header cell of the table tells the sort with aria-sort. Material puts aria-sort on its own host too, a div
    // inside the cell, where ARIA does not allow it: the div does not keep it
    effect(onCleanup => {
      const header: HTMLElement | undefined = this.sortHeader()?.nativeElement;

      if (!header) {
        return;
      }

      const observer = new MutationObserver(() => header.removeAttribute('aria-sort'));

      header.removeAttribute('aria-sort');
      observer.observe(header, {attributes: true, attributeFilter: ['aria-sort']});
      onCleanup(() => observer.disconnect());
    });
  }

  onSort(event: Sort): void {
    dispatchAction(this.elementRef.nativeElement, events.filtersSortEvent, {
      sortKey: event.active,
      sortDirection: event.direction || undefined
    });

    this.sortedDirection = event.direction;
    this.matSortDirection.set(event.direction);
  }
}

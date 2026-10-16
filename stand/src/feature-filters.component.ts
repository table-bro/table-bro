import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, type OnInit, output} from '@angular/core';
import {takeUntilDestroyed}                                                                 from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule}                                        from '@angular/forms';

import {MatButtonModule}    from '@angular/material/button';
import {MatCheckboxModule}  from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule}      from '@angular/material/icon';
import {MatInputModule}     from '@angular/material/input';
import {MatSelectModule}    from '@angular/material/select';
import type {BroSkin}       from '@table-bro/core';

import {debounceTime, distinctUntilChanged, startWith} from 'rxjs';

import {featureCategories, type FeatureFilters} from './features';

type FeatureFiltersForm = {
  featureName: string | null;
  category: string | null;
  serverSide: boolean | null;
};

/**
 * The filters of the Features table. The component lies in the filter drawer next to the table, outside of it,
 * and reports its filters to the page as any Angular component does. Its fields are of the skin of the table:
 * Angular Material, Bootstrap, or native elements.
 */
@Component({
  selector: 'stand-feature-filters',
  templateUrl: './feature-filters.component.html',
  styles: `
    /* The Material fields of this demo have no fill */
    :host {
      --mat-form-field-filled-container-color: transparent;
    }

    /* The native fields of the nv skin: a label above its field */
    .bro-native-field {
      display: block;

      margin-bottom: 12px;
    }

    .bro-native-field input,
    .bro-native-field select {
      display: block;
      box-sizing: border-box;

      width: 100%;
      margin-top: 4px;
    }

    .bro-native-check {
      display: block;

      margin-bottom: 12px;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,

    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class FeatureFiltersComponent implements OnInit {
  skin = input<BroSkin>('mat');

  changeFilter = output<FeatureFilters>();

  categories: string[] = featureCategories;

  filtersForm = new FormGroup<{
    [K in keyof FeatureFiltersForm]: FormControl<FeatureFiltersForm[K]>;
  }>({
    featureName: new FormControl(''),
    category: new FormControl(null),
    // On by default; Clear brings it back
    serverSide: new FormControl(true, {nonNullable: true})
  }, {updateOn: 'change'});

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // The default filters go to the table too
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.value),
      debounceTime(400),
      distinctUntilChanged((prev, curr) => this.shallowEqual(prev, curr)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.changeFilter.emit(
        this.mapFormToFilters(value)
      );
    });
  }

  onClearFilter(name: keyof FeatureFiltersForm) {
    this.filtersForm.patchValue({
      [name]: null
    });
  }

  onClearFilters() {
    this.filtersForm.reset();
  }

  /**
   * The table accumulates the changes of its filters, so a cleared field goes as an empty value.
   */
  private mapFormToFilters(value: Partial<FeatureFiltersForm>): FeatureFilters {
    return {
      featureName: value.featureName || undefined,
      category: value.category || undefined,
      serverSide: value.serverSide
    };
  }

  private shallowEqual<T extends object>(a: T, b: T): boolean {
    for (const key in a) {
      if (a[key] !== b[key]) {
        return false;
      }
    }

    return true;
  }
}

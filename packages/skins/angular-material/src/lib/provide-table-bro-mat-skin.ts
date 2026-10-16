import {EnvironmentInjector, type EnvironmentProviders, inject, provideAppInitializer, type Type} from '@angular/core';

import {registerSkin} from '@table-bro/core';

import {BroMaterialSlideToggleComponent} from './bro-slide-toggle.material.component';
import {BroMaterialTagsComponent}        from './bro-tags.material.component';
import {defineTableBroMatElements}       from './define-table-bro-mat-elements';
import {matSkinConfig}                   from './table-bro.angular-material.config';
import {BroMaterialToolbarMoreComponent} from './toolbar/bro-toolbar-more.material.component';

/** An optional element of the skin mat for provideTableBroMatSkin(): its tag and its component. */
export interface TableBroMatSkinFeature {
  /** The tag of the element and its component. */
  readonly elements: Record<string, Type<unknown>>;
}

/**
 * Connects the skin mat: registers its config and defines its elements when the application starts. A feature adds
 * an optional element, which only a table with a certain config uses, so a table without it does not carry its code.
 * @param features - the optional elements: withTags(), withSwitch(), withToolbarMenu()
 */
export function provideTableBroMatSkin(...features: TableBroMatSkinFeature[]): EnvironmentProviders {
  return provideAppInitializer(() => {
    registerSkin('mat', matSkinConfig);
    defineTableBroMatElements(inject(EnvironmentInjector), Object.assign({}, ...features.map(feature => feature.elements)));
  });
}

/** The element bro-mat-tags: the items of a column as the chips of Material. */
export function withTags(): TableBroMatSkinFeature {
  return {elements: {'bro-mat-tags': BroMaterialTagsComponent}};
}

/** The element bro-mat-slide-toggle: a boolean of a column as a slide toggle. */
export function withSwitch(): TableBroMatSkinFeature {
  return {elements: {'bro-mat-slide-toggle': BroMaterialSlideToggleComponent}};
}

/** The menu of the toolbar: a button of toolbarMain.buttons with the mode navbar-dropdown. */
export function withToolbarMenu(): TableBroMatSkinFeature {
  return {elements: {'bro-mat-toolbar-more': BroMaterialToolbarMoreComponent}};
}

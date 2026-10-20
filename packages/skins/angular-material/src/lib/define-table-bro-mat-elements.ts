import {isPlatformBrowser}                                from '@angular/common';
import {type EnvironmentInjector, PLATFORM_ID, type Type} from '@angular/core';
import {createCustomElement}                              from '@angular/elements';

import {MatPaginator}                       from '@angular/material/paginator';
import {MatProgressBar}                     from '@angular/material/progress-bar';
import {MatToolbar}                         from '@angular/material/toolbar';
import {type BroCellElement, isPrerendered} from '@table-bro/core';

import {BroMaterialButtonComponent}       from './bro-button.material.component';
import {BroMaterialSortHeaderComponent}   from './bro-sort-header.material.component';
import {BroMaterialTextEllipsisComponent} from './bro-text-ellipsis.material.component';
import {BroMaterialToolbarMainComponent}  from './toolbar/bro-toolbar-main.material.component';

/**
 * The elements of the skin that every table may use: the components of Material that the table uses as they are, and
 * the ones of the skin. The optional elements come from the features of provideTableBroMatSkin().
 */
export const tableBroMatElements: Record<string, Type<unknown>> = {
  'ng-mat-paginator': MatPaginator,
  'ng-mat-progress-bar': MatProgressBar,
  'ng-mat-toolbar': MatToolbar,

  'bro-mat-button': BroMaterialButtonComponent,
  'bro-mat-sort-header': BroMaterialSortHeaderComponent,
  'bro-mat-toolbar-main': BroMaterialToolbarMainComponent,
  'bro-mat-text-ellipsis': BroMaterialTextEllipsisComponent
};

/**
 * Defines the elements of the skin in the browser, each one unless it is defined; the server render of Angular has no
 * custom elements. In the dev mode an optional element that no feature gives is defined as an element that reports
 * the missing feature.
 * @param injector - the injector of the application, for the Angular elements
 * @param features - the optional elements that the application asks for
 */
export function defineTableBroMatElements(injector: EnvironmentInjector, features: Record<string, Type<unknown>> = {}): void {
  if (!isPlatformBrowser(injector.get(PLATFORM_ID))) {
    return;
  }

  Object.entries({...tableBroMatElements, ...features}).forEach(([name, component]) => {
    if (!customElements.get(name)) {
      customElements.define(name, keepThroughMoves(createCustomElement(component, {injector})));
    }
  });

  // The production build drops the block: the dev mode only reports a missing feature
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    Object.entries({'bro-mat-tags': 'Tags', 'bro-mat-slide-toggle': 'Switch', 'bro-mat-toolbar-more': 'ToolbarMenu'}).forEach(([name, feature]) => {
      if (!customElements.get(name)) {
        customElements.define(name, missingFeature(feature));
      }
    });
  }
}

/**
 * An element in place of an optional element that the application did not ask for: on its connection it reports the
 * feature to add, once for each column and once for the toolbar.
 * @param feature - the name of the feature after with, as Tags of withTags()
 */
function missingFeature(feature: string): CustomElementConstructor {
  const reported = new Set<string>();

  return class extends HTMLElement implements BroCellElement {
    declare col?: BroCellElement['col'];

    connectedCallback(): void {
      const user = this.col ? `the column "${this.col.name}"` : 'the toolbar';
      const element = feature.replace(/\B[A-Z]/g, ' $&').toLowerCase();

      if (!reported.has(user)) {
        reported.add(user);
        console.error(`Table, Bro: ${user} uses the element ${element}: add with${feature}() to provideTableBroMatSkin()`);
      }
    }
  };
}

/**
 * A move in the DOM, as a sort moves the rows, disconnects an element and connects it again at once. An Angular element
 * runs both in the zone of Angular, whose end checks every view of the application, so a sort of n rows checked n views
 * n times. The element lets a disconnection pass that a connection follows before the microtasks run: it is a move.
 */
function keepThroughMoves(element: CustomElementConstructor): CustomElementConstructor {
  const base = <new () => HTMLElement & {connectedCallback(): void; disconnectedCallback(): void}>element;

  return class extends base {
    private moving: boolean = false;

    override connectedCallback(): void {
      if (this.moving) {
        this.moving = false;

        return;
      }

      // An element of the prerender keeps its markup until the table renders its own elements in its place
      if (isPrerendered(this)) {
        return;
      }

      super.connectedCallback();
    }

    override disconnectedCallback(): void {
      this.moving = true;

      queueMicrotask(() => {
        if (this.moving) {
          this.moving = false;
          super.disconnectedCallback();
        }
      });
    }
  };
}

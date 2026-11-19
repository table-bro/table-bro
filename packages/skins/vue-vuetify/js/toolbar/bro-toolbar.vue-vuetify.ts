import type {BroConfiguredElement, BroResolvedConfig, BroSkinConfig, BroToolbarElement} from '@table-bro/core';

import {h}        from 'vue';
import {VToolbar} from 'vuetify/components/VToolbar';

import {BroVuetifyElement} from '../bro-vuetify-element';

/**
 * The toolbar of the skin, the element bro-vuetify-toolbar: the toolbar of Vuetify that holds the nodes of the table,
 * as its search line and the header of the filter drawer. The table appends them before the element renders: the
 * toolbar takes them after each render, and again after its root goes and comes back.
 */
export class BroVuetifyToolbarComponent extends BroVuetifyElement implements BroConfiguredElement, BroToolbarElement {
  /** The config of the table, or of the skin in the header of the filter drawer. */
  config?: BroResolvedConfig | BroSkinConfig;
  contentClassName: string = 'bro-toolbar-content';

  /** The nodes of the table in the toolbar, in their order. */
  private nodes: (Node | string)[] = [];

  appendToolbarContent(...nodes: (Node | string)[]): void {
    this.nodes.push(...nodes);
    this.toolbarContent()?.append(...nodes);
  }

  protected content() {
    return h(VToolbar, {class: this.contentClassName, flat: true});
  }

  /**
   * Renders the toolbar of Vuetify, then moves the nodes of the table into its content, which has no Vue children of
   * its own. The nodes move after the render, not in a hook of Vue: a node may be an element of the skin, as the close
   * button of the filter drawer, whose own root would render inside the patch of this one.
   */
  protected override update(): void {
    super.update();
    this.toolbarContent()?.append(...this.nodes);
  }

  /** The content of the rendered toolbar of Vuetify, the flex line of its items. */
  private toolbarContent(): HTMLElement | null {
    return this.querySelector(':scope > .bro-vuetify-root > .v-toolbar > .v-toolbar__content');
  }
}

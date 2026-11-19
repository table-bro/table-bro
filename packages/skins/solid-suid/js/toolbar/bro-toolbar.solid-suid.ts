import type {BroConfiguredElement, BroResolvedConfig, BroSkinConfig, BroToolbarElement} from '@table-bro/core';

import Toolbar from '@suid/material/Toolbar';

import {BroSuidElement, suid} from '../bro-suid-element';

/**
 * The toolbar of the skin, the element bro-suid-toolbar: the toolbar of SUID that holds the nodes of the table, as its
 * search line and the header of the filter drawer. The table appends them before the element renders: the toolbar
 * takes them when it renders, and again after its root goes and comes back.
 */
export class BroSuidToolbarComponent extends BroSuidElement implements BroConfiguredElement, BroToolbarElement {
  /** The config of the table, or of the skin in the header of the filter drawer. */
  config?: BroResolvedConfig | BroSkinConfig;
  contentClassName: string = 'bro-toolbar-content';

  /** The nodes of the table in the toolbar, in their order. */
  private nodes: (Node | string)[] = [];
  /** The node of the toolbar of SUID while it is rendered. */
  private toolbar: HTMLElement | null = null;

  appendToolbarContent(...nodes: (Node | string)[]): void {
    this.nodes.push(...nodes);
    this.toolbar?.append(...nodes);
  }

  protected content() {
    return suid(Toolbar, {class: this.contentClassName});
  }

  /**
   * Moves the nodes of the table into the toolbar of SUID, which has no children of Solid, after the render: a node
   * may be an element of the skin, as the close button of the filter drawer, which renders a root of its own.
   */
  protected override rendered(): void {
    this.toolbar = this.querySelector('.MuiToolbar-root');
    this.toolbar?.append(...this.nodes);
  }

  protected override unmounted(): void {
    this.toolbar = null;
  }
}

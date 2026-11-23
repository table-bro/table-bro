import type {BroConfiguredElement, BroResolvedConfig, BroSkinConfig, BroToolbarElement} from '@table-bro/core';

import Toolbar              from '@mui/material/Toolbar';
import {createElement as h} from 'react';

import {BroMuiElement} from '../bro-mui-element';

/**
 * The toolbar of the skin, the element bro-mui-toolbar: the toolbar of MUI that holds the nodes of the table, as its
 * search line and the header of the filter drawer. The table appends them before the element renders: the toolbar
 * takes them when React gives it its node, and again after its root goes and comes back.
 */
export class BroMuiToolbarComponent extends BroMuiElement implements BroConfiguredElement, BroToolbarElement {
  /** The config of the table, or of the skin in the header of the filter drawer. */
  config?: BroResolvedConfig | BroSkinConfig;
  contentClassName: string = 'bro-toolbar-content';

  /** The nodes of the table in the toolbar, in their order. */
  private nodes: (Node | string)[] = [];
  /** The node of the toolbar of MUI while it is rendered. */
  private toolbar: HTMLElement | null = null;

  appendToolbarContent(...nodes: (Node | string)[]): void {
    this.nodes.push(...nodes);
    this.toolbarNode()?.append(...nodes);
  }

  protected content() {
    return h(Toolbar, {className: this.contentClassName, ref: (toolbar: HTMLElement | null) => {
      this.toolbar = toolbar;
    }});
  }

  /**
   * Renders the toolbar of MUI, then moves the nodes of the table into it, which has no React children of its own. The
   * nodes move after the render, not in the ref of React: a node may be an element of the skin, as the close button of
   * the filter drawer, whose own root would render inside the commit of this one, where React puts its render off.
   */
  protected override update(): void {
    super.update();
    this.toolbarNode()?.append(...this.nodes);
  }

  /** The rendered toolbar of MUI: the markup of a server DOM has no ref of React, its toolbar is the node of the markup. */
  private toolbarNode(): HTMLElement | null {
    return this.toolbar ?? this.querySelector<HTMLElement>('.MuiToolbar-root');
  }
}

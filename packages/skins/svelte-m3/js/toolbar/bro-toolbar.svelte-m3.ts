import {type BroConfiguredElement, BroDom, BroHTMLElement, type BroResolvedConfig, type BroSkinConfig, type BroToolbarElement, isPrerendered} from '@table-bro/core';

/**
 * The toolbar of the skin, the element bro-m3-svelte-toolbar: the top app bar of Material 3 that holds the nodes of the table,
 * as its search line and the header of the filter drawer. M3 Svelte has no app bar, so it is a plain node in the colors
 * and the height of its tokens. The table appends the nodes before or after the element renders.
 */
export class BroM3SvelteToolbarComponent extends BroHTMLElement implements BroConfiguredElement, BroToolbarElement {
  /** The config of the table, or of the skin in the header of the filter drawer. */
  config?: BroResolvedConfig | BroSkinConfig;
  contentClassName: string = 'bro-toolbar-content';

  /** The nodes of the table in the toolbar, in their order. */
  private nodes: (Node | string)[] = [];
  /** The node of the toolbar while it is rendered. */
  private toolbar: HTMLElement | null = null;

  appendToolbarContent(...nodes: (Node | string)[]): void {
    this.nodes.push(...nodes);
    this.toolbar?.append(...nodes);
  }

  connectedCallback(): void {
    // An element of the prerender keeps its markup until the table renders its own elements in its place
    if (this.toolbar || isPrerendered(this)) {
      return;
    }

    this.toolbar = new BroDom(this.ownerDocument).createElement('div');
    this.toolbar.className = `bro-m3-svelte-toolbar ${this.contentClassName}`;
    this.toolbar.append(...this.nodes);
    this.append(this.toolbar);
  }
}

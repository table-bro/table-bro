import {BroTextEllipsisComponent} from '../../shared/js/bro-text-ellipsis';
import {BroSortHeaderComponent}   from '../../shared/js/material-based/bro-sort-header';
import {BroPaginatorComponent}    from '../../shared/js/material-based/paginator/bro-paginator';
import {attachSuidTooltip}        from './bro-suid-tooltip';

// SUID, a port of MUI 5, has no table pagination and no sort label. The skin takes the elements of these parts from the
// vanilla skins bs and nv, under tags of its own, so a page with a vanilla skin keeps its elements: the CSS of the skin
// gives them the look of the table of MUI in the theme of SUID, and the skin its tooltips (bro-suid-tooltip.ts)

/**
 * The paginator of the vanilla skins, with its list of page sizes on the select of SUID (bro-suid-dropdown) and the
 * names of its buttons in tooltips above them, as the paginator of the skin mat shows them.
 */
export class BroSuidPaginatorComponent extends BroPaginatorComponent {
  /** The removals of the tooltips of the buttons: a removed paginator takes its tooltips out of the body. */
  private releases: (() => void)[] = [];
  private released: boolean = false;

  override render(): void {
    super.render();

    this.attachTooltips();
  }

  override connectedCallback(): void {
    if (this.released) {
      this.released = false;

      this.attachTooltips();
    }

    super.connectedCallback();
  }

  disconnectedCallback(): void {
    // A move connects the element again in the same task; only a removed element releases its tooltips
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.releases.forEach(release => release());

        this.releases = [];
        this.released = true;
      }
    });
  }

  private attachTooltips(): void {
    this.querySelectorAll('[class*="bro-paginator-navigation-"]').forEach(button => this.releases.push(attachSuidTooltip(button, button.getAttribute('aria-label') ?? '')));
  }
}

/** The sort header of the vanilla skins, with the arrow of the sort label of MUI and its tooltip on the right. */
export class BroSuidSortHeaderComponent extends BroSortHeaderComponent {}

/** The text ellipsis of the vanilla skins, with the whole value in a tooltip above it. */
export class BroSuidTextEllipsisComponent extends BroTextEllipsisComponent {}

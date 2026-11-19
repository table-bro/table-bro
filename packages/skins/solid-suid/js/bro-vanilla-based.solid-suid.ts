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
  override render(): void {
    super.render();

    this.querySelectorAll('[class*="bro-paginator-navigation-"]').forEach(button => attachSuidTooltip(button, button.getAttribute('aria-label') ?? ''));
  }
}

/** The sort header of the vanilla skins, with the arrow of the sort label of MUI and its tooltip on the right. */
export class BroSuidSortHeaderComponent extends BroSortHeaderComponent {}

/** The text ellipsis of the vanilla skins, with the whole value in a tooltip above it. */
export class BroSuidTextEllipsisComponent extends BroTextEllipsisComponent {}

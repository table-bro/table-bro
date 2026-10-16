import type {BroTableAux}                    from '../dom/table-container/table-body-container/scrolling-container/table-aux/table-aux.view';
import type {BroTbodyAux}                    from '../dom/table-container/table-body-container/scrolling-container/table-aux/tbody/tbody-aux.view';
import type {BroTheadAux}                    from '../dom/table-container/table-body-container/scrolling-container/table-aux/thead/thead-aux.view';
import type {BroTableBodyScrollingContainer} from '../dom/table-container/table-body-container/scrolling-container/table-body-scrolling-container.view';
import type {BroTbody}                       from '../dom/table-container/table-body-container/scrolling-container/table/tbody/tbody.view';
import type {BroThead}                       from '../dom/table-container/table-body-container/scrolling-container/table/thead/thead.view';
import type {BroTableBodyShadowContainer}    from '../dom/table-container/table-body-container/shadow-container/table-body-shadow-container.view';
import type {BroTableBodyContainer}          from '../dom/table-container/table-body-container/table-body-container.view';
import type {BroTableContainer}              from '../dom/table-container/table-container.view';
import type {BroTableHeaderContainer}        from '../dom/table-container/table-header-container/table-header-container.view';
import type {BroPaginator}                   from '../dom/table-paginator-container/paginator/paginator.view';
import type {BroTableRegions}                from '../dom/table-regions.view';
import type {BroDetailsView}                 from '../features/details/details.view';

declare module '../../types/context' {
  interface BroContext {
    /** The registry of the rendered views. */
    readonly view: BroViews;
  }
}

/**
 * Registry of the rendered views of one table. A view never registers itself: the element, the controller,
 * or the parent view that creates a view assigns it, right before rendering it. The fields follow the order of one
 * render: regions, tableContainer, headerContainer, thead, paginator, bodyContainer, scrollingContainer, tableAux,
 * tbodyAux, theadAux, tbody, shadowContainer, details; the paginator comes before the body, so a body that fails shows
 * the fail state with it. A field is empty until that point, and a view reads only the views set before it, so the
 * types name them as set; optional are the views of a config and theadAux, which goes.
 */
export interface BroViews {
  /** The regions of the table in the host: the toolbar, the table container, the live region and the paginator. Set by the element at render. */
  regions: BroTableRegions;

  /** The table for screen readers around the header and body containers. Set by BroTableRegions at render. */
  tableContainer: BroTableContainer;

  /** The table header container. Set by BroTableRegions at render. */
  headerContainer: BroTableHeaderContainer;
  /** The header row group; set by the header BroTable. */
  thead: BroThead;

  /** Set by BroTablePaginatorContainer; the controller replaces it when the skin recreates the paginator on replaceRows. */
  paginator: BroPaginator;

  /** The table body container. Set by the controller on every body render. */
  bodyContainer: BroTableBodyContainer;
  /** The table body scrolling container. Set by BroTableBodyContainer. */
  scrollingContainer: BroTableBodyScrollingContainer;
  /** Set by BroTableBodyScrollingContainer. */
  tableAux: BroTableAux;
  /** Set by BroTableAux. */
  tbodyAux: BroTbodyAux;
  /**
   * Set by BroTableAux while the header is not measured yet, at the first render; the controller replaces it with
   * the short titles, and BroTableBodyScrollingContainer removes it after the measurement.
   */
  theadAux?: BroTheadAux | null;
  /** The body row group; set by the body BroTable. */
  tbody: BroTbody;

  /** Set by BroTableBodyContainer; the controller replaces it for a table state. */
  shadowContainer: BroTableBodyShadowContainer;

  /** Set by the controller for tables with row details. */
  details?: BroDetailsView;
}

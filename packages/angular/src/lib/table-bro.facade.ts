import type {InputSignal, OutputEmitterRef, Signal} from '@angular/core';

import type {BroActionDetail, BroCol, BroConfig, BroQuery} from '@table-bro/core';

/**
 * Public facade contract for a table component.
 *
 * Defines the public input surface exposed to consumers
 * (parent components and templates).
 *
 * All properties are Angular input signals managed by the framework and
 * must be treated as immutable from the consumer perspective.
 *
 * @typeParam MODEL Row model displayed by the table
 */
export interface BroFacade<MODEL extends object> {
  /** Column definitions and UI configuration */
  cols: InputSignal<BroCol<MODEL>[]>;

  /** Table rows; without a value the table keeps what it shows */
  rows: InputSignal<MODEL[] | undefined | null>;

  /** Table configuration (page size, title, etc.) */
  conf: InputSignal<BroConfig<MODEL>>;

  /** The loading of the rows: the loading state, or a refresh over the shown rows */
  loading?: InputSignal<boolean>;

  /** A failed loading of the rows: the fail state */
  failed?: InputSignal<boolean>;

  action?: OutputEmitterRef<BroActionDetail<MODEL>>;
}

/**
 * Public facade contract for a server-driven table.
 *
 * Extends BroFacade with server-specific responsibilities such as
 * total row count exposure and query emission.
 *
 * Intended to be injected into page components that handle
 * server-side data fetching.
 *
 * @typeParam MODEL Row model displayed by the table
 */
export interface BroServerFacade<MODEL extends object> extends BroFacade<MODEL> {
  /** Total number of rows available on the server */
  total: InputSignal<number | undefined>;

  rowsToAppend?: InputSignal<MODEL[] | undefined>;

  /**
   * Emits table queries whenever pagination, sorting or filtering changes.
   * Handled by a page-level server container.
   */
  query: OutputEmitterRef<BroQuery<MODEL>>;
}

/**
 * Page-level table state contract.
 *
 * Describes the local state and behavior of a page component that injects
 * and coordinates a BroFacade.
 *
 * The container:
 * - adapts facade data for the page template
 * - owns page-specific reactive state
 * - orchestrates table initialization and lifecycle
 *
 * All properties are writable signals owned by the page component.
 *
 * @typeParam MODEL Row model displayed by the table
 */
export interface BroContainer<MODEL extends object> {
  /** Reactive column definitions bound to the table */
  cols: Signal<BroCol<MODEL>[]>;

  /** Reactive row data consumed by the template */
  rows: Signal<MODEL[] | undefined | null>;

  /** Reactive table configuration for the page */
  conf: Signal<BroConfig<MODEL>>;

  /** Page-level initialization hook coordinating the facade */
  initTable: () => void;
}

/**
 * Page-level state contract for a server-driven table.
 *
 * Extends BroContainer with server-specific state and query handling logic.
 *
 * Implementations are responsible for:
 * - handling table queries
 * - calling backend services
 * - updating rows and total count
 *
 * @typeParam MODEL Row model displayed by the table
 * @typeParam EXTRA Additional backend-specific filter fields
 */
export interface BroServerContainer<
  MODEL extends object,
  EXTRA extends object = object
> extends BroContainer<MODEL> {
  /** Reactive total row count provided by the backend */
  total: Signal<number>;

  rowsToAppend?: Signal<MODEL[] | undefined>;

  /**
   * Handles table queries emitted by the facade.
   * Triggers server communication and state updates.
   */
  onQueryTable: (query: BroQuery<MODEL, EXTRA>) => void;
}

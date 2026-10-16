import type {BroQuery} from '@table-bro/core';

/**
 * Service contract responsible for translating between the table domain model
 * and a specific backend API.
 *
 * BroService defines how:
 * - a generic BroQuery (pagination, sorting, filtering) is transformed into
 *   an API-specific request format
 * - an API-specific response is mapped back into a normalized BroServerPage
 *
 * This abstraction allows the table component and its containers to remain
 * backend-agnostic, while each integration provides its own mapping logic.
 *
 */
export interface BroService<MODEL extends object, API_QUERY = unknown, API_PAGE = unknown, EXTRA extends object = object> {
  mapServerQuery: (query: BroQuery<MODEL, EXTRA>) => API_QUERY;

  mapServerResponse: (response: API_PAGE) => BroServerPage<MODEL>;
}

export interface BroServerPage<MODEL extends object> {
  rows: MODEL[];
  total: number;
}

import type {BroDocPage}        from '../../pages.js';
import {customSortingRulesPage} from './custom-sorting-rules.js';
import {customUserFiltersPage}  from './custom-user-filters.js';
import {filterDrawerPage}       from './filter-drawer.js';
import {toolbarWithSearchPage}  from './toolbar-with-search.js';

/** The pages of the section Filtering of Docs, in the order of the menu of Docs. */
export const filteringPages: BroDocPage[] = [toolbarWithSearchPage, customUserFiltersPage, filterDrawerPage, customSortingRulesPage];

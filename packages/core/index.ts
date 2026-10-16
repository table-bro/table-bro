import {selectors as sharedSelectors} from './shared/shared-selectors';
import './table-bro';

export type {BroPageChange} from './types/pagination';
export *                    from './types/theme';
export *                    from './types/view';

export type {BroActionDataMap, BroActionDetail, BroAppendRowsOptions, BroButton, BroCellActionData, BroCellElement, BroCol, BroColDataType, BroColSort, BroConfig, BroConfigCSS, BroConfiguredElement, BroConfigureOptions, BroCustomElementConfig, BroCustomElementValueFn, BroDeepPartial, BroDropdown, BroDropdownOption, BroEmptyState, BroErrorCode, BroErrorDetail, BroFilterDrawerHTMLElement, BroFilterDrawerHTMLElementEventMap, BroFiltersTransform, BroPaginatorElement, BroPaginatorPageEvent, BroProgressBar, BroProgressMode, BroReplaceRowsOptions, BroResolvedConfig, BroRow, BroRowDetailsElement, BroSkin, BroSkinComponents, BroSkinConfig, BroSortHeader, BroStates, BroTableAction, BroTableState, BroTextEllipsis, BroTexts, BroToolbarElement, BroToolbarMain, TableBroHTMLElement, TableBroHTMLElementEventMap} from './types/table-bro';

export type {BroAdvancedFilterGroup, BroFilterCondition, BroFilters, BroFilterValue, BroQuery, BroSortDirection, BroSortSpec} from './shared/query';

export {fitCellItems}            from './shared/cell-items';
export {resolveTexts}            from './shared/config';
export * as events               from './shared/events';
export {dispatchAction}          from './shared/interaction';
export {useIslandDetails}        from './shared/island';
export {BroMotion}               from './shared/motion';
export {matchesFilterCondition}  from './shared/query';
export {BroHTML, BroHTMLElement} from './shared/html';
export {registerSkin}            from './shared/skins';

// <table-bro-filter-drawer-container> is defined on demand, by the application
export {defineTableBroFilterDrawerContainer} from './view/features/filters/filter-drawer.view';

/**
 * The classes of the text ellipsis in cells, for skins.
 * A runtime object, not a re-export of a const enum: a build from the sources may give the production build other names.
 * @group Skins
 */
export const broCellSelectors: Readonly<{ellipsisContainer: string; ellipsis: string}> = Object.freeze({
  ellipsisContainer: sharedSelectors.tableCellTextEllipsisContainer,
  ellipsis: sharedSelectors.tableCellTextEllipsis
});

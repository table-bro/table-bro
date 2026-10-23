import {selectors as sharedSelectors} from './shared/shared-selectors';
import {selectors}                    from './table-bro-selectors';
import './table-bro';

export type {BroPageChange} from './types/pagination';
export *                    from './types/theme';
export *                    from './types/view';

export type {BroActionDataMap, BroActionDetail, BroAppendRowsOptions, BroButton, BroCellActionData, BroCellElement, BroCol, BroColDataType, BroColSort, BroConfig, BroConfigCSS, BroConfiguredElement, BroConfigureOptions, BroCustomElementConfig, BroCustomElementValueFn, BroDeepPartial, BroDropdown, BroDropdownOption, BroEmptyState, BroErrorCode, BroErrorDetail, BroFilterDrawerHTMLElement, BroFilterDrawerHTMLElementEventMap, BroFilterDrawerTexts, BroCoreTexts, BroFiltersTransform, BroFlatTexts, BroPaginatorElement, BroPaginatorPageEvent, BroPaginatorTexts, BroProgressBar, BroProgressBarTexts, BroProgressMode, BroReplaceRowsOptions, BroResolvedConfig, BroRow, BroRowDetailsElement, BroSkin, BroSkinComponents, BroSkinConfig, BroSortHeader, BroStates, BroStateTexts, BroTableAction, BroTableState, BroTextEllipsis, BroTextGroupName, BroTextGroups, BroTextGroupTexts, BroTexts, BroTextsConfig, BroToolbarElement, BroToolbarMain, BroToolbarMainTexts, BroToolbarSearchTexts, TableBroHTMLElement, TableBroHTMLElementEventMap} from './types/table-bro';

export type {BroAdvancedFilterGroup, BroFilterCondition, BroFilters, BroFilterValue, BroQuery, BroSortDirection, BroSortSpec} from './shared/query';

export {fitCellItems}                     from './shared/cell-items';
export {resolveTexts}                     from './shared/config';
export {BroDom}                           from './shared/dom';
export * as events                        from './shared/events';
export {dispatchAction}                   from './shared/interaction';
export {useIslandDetails}                 from './shared/island';
export {BroMotion}                        from './shared/motion';
export {matchesFilterCondition}           from './shared/query';
export {BroHTML, BroHTMLElement}          from './shared/html';
export {getSkin, registerSkin}            from './shared/skins';
export {isPrerendered, prerenderTableBro} from './table-bro';

// <table-bro-filter-drawer-container> is defined on demand, by the application; the drawer of the mat skin registers
// the properties of its motion as the definition does
export {defineTableBroFilterDrawerContainer, registerFilterDrawerProperties} from './view/features/filters/filter-drawer.view';

/**
 * The classes of the text ellipsis in cells, for skins.
 * A runtime object, not a re-export of a const enum: a build from the sources may give the production build other names.
 * @group Skins
 */
export const broCellSelectors: Readonly<{ellipsisContainer: string; ellipsis: string}> = Object.freeze({
  ellipsisContainer: sharedSelectors.tableCellTextEllipsisContainer,
  ellipsis: sharedSelectors.tableCellTextEllipsis
});

/**
 * The class that hides an element from the eye, not from screen readers: the CSS of the core has its rule, for skins.
 * A runtime value, not a re-export of a const enum: a build from the sources may give the production build other names.
 * @group Skins
 */
export const broVisuallyHidden: string = selectors.visuallyHidden;

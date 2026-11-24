import type {BroDocPage}             from '../../pages.js';
import {animatedPageSizePage}        from './animated-page-size.js';
import {animatedPaginationPage}      from './animated-pagination.js';
import {autoDetectedColumnWidthPage} from './auto-detected-column-width.js';
import {fixedColumnWidthPage}        from './fixed-column-width.js';
import {fixedRowHeightPage}          from './fixed-row-height.js';
import {tableStatesPage}             from './table-states.js';
import {tooltipPage}                 from './tooltip.js';

/** The pages of the section Basics of Docs, in the order of the menu of Docs. */
export const basicsPages: BroDocPage[] = [fixedRowHeightPage, fixedColumnWidthPage, autoDetectedColumnWidthPage, tooltipPage, animatedPaginationPage, animatedPageSizePage, tableStatesPage];

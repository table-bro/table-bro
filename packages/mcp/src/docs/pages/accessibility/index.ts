import type {BroDocPage}      from '../../pages.js';
import {keyboardAndFocusPage} from './keyboard-and-focus.js';
import {localizationPage}     from './localization.js';
import {screenReadersPage}    from './screen-readers.js';

/** The pages of the section Accessibility of Docs, in the order of the menu of Docs. */
export const accessibilityPages: BroDocPage[] = [localizationPage, keyboardAndFocusPage, screenReadersPage];

import type {BroDocPage}     from '../../pages.js';
import {bootstrapDesignPage} from './bootstrap-design.js';
import {cssStylingPage}      from './css-styling.js';
import {customContentPage}   from './custom-content.js';
import {darkLightModePage}   from './dark-light-mode.js';
import {materialDesignPage}  from './material-design.js';
import {roundedCornersPage}  from './rounded-corners.js';
import {shadowsPage}         from './shadows.js';
import {yourOwnSkinPage}     from './your-own-skin.js';

/** The pages of the section Design of Docs, in the order of the menu of Docs. */
export const designPages: BroDocPage[] = [cssStylingPage, customContentPage, shadowsPage, roundedCornersPage, darkLightModePage, materialDesignPage, bootstrapDesignPage, yourOwnSkinPage];

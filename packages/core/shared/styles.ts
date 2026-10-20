import type {BroSkinStyles}         from '../types/context';
import type {BroConfig}             from '../types/table-bro';
import {cubicBezier, easeInOutSine} from '../view/shared/animation';

/** The numbers of the skin: the curve of the details is a function. */
type BroSkinNumber = Exclude<keyof BroSkinStyles, 'detailsEasing'>;

/** The custom properties that the CSS of the skin sets on the host (packages/skins/shared/styles/shared/mixins/_custom-properties.scss). */
const properties: {[field in BroSkinNumber]: string} = {
  rowHeight: '--bro-row-height',
  shadowSize: '--bro-shadow-size',
  islandSpaceSize: '--bro-island-space-size',
  tableBodyContainerZIndex: '--bro-table-body-container-z-index',
  refreshOverlayOpacity: '--bro-refresh-overlay-opacity',
  refreshOverlayOpacityDark: '--bro-refresh-overlay-opacity-dark',
  detailsDuration: '--bro-details-duration',
  kineticTimeConstant: '--bro-kinetic-time-constant',
  stateIconDuration: '--bro-state-icon-duration',
  stateMessageDuration: '--bro-state-message-duration',
  durationScale: '--bro-duration-scale'
};

/**
 * The sizes and timings of the skin, read once from the computed style of the host at render. The core CSS registers
 * the properties, so lengths come in px and numbers as they are. Nothing reads the CSS later, in animation frames
 * for example: a change of the CSS applies at the next render.
 */
export function resolveStyles(host: HTMLElement, config: BroConfig): BroSkinStyles {
  const style = getComputedStyle(host);
  const styles = <{-readonly [field in keyof BroSkinStyles]: BroSkinStyles[field]}>{};

  for (const field of <BroSkinNumber[]>Object.keys(properties)) {
    styles[field] = cssNumber(style.getPropertyValue(properties[field]));
  }

  styles.detailsEasing = cssEasing(style.getPropertyValue('--bro-details-easing'));

  if (!config.shadowsEnabled) {
    styles.shadowSize = 0;
  }

  return Object.freeze(styles);
}

/**
 * The sizes and timings of the skin in the prerender, which computes no style: the sizes are unknown, the heights that
 * the prerender writes are the calc() of the custom properties of the skin (cssRowsHeight), and nothing animates.
 */
export const prerenderStyles: BroSkinStyles = Object.freeze({
  rowHeight: NaN,
  shadowSize: NaN,
  islandSpaceSize: NaN,
  tableBodyContainerZIndex: NaN,
  refreshOverlayOpacity: NaN,
  refreshOverlayOpacityDark: NaN,
  detailsDuration: 0,
  detailsEasing: easeInOutSine,
  kineticTimeConstant: 0,
  stateIconDuration: 0,
  stateMessageDuration: 0,
  durationScale: 0
});

/**
 * The height of rows of the skin in the prerender, which computes no style: the calc() of the custom properties of the
 * skin on the host.
 * @param rows - the number of the rows
 * @param shadows - the height takes the space of the shadows above and below the rows too
 */
export function cssRowsHeight(rows: number, shadows: boolean): string {
  return shadows ? `calc(var(--bro-row-height) * ${rows} + var(--bro-shadow-size) * 2)` : `calc(var(--bro-row-height) * ${rows})`;
}

/** The curve of the filter drawers: of the core (components/_filter-drawer.scss) and of @table-bro/angular-material. */
export const filterDrawerEasing = 'cubic-bezier(.4, 0, .2, 1)';

/** The keywords of the curves of CSS by their cubic-bezier. */
const easingKeywords: Record<string, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1]
};

/**
 * The curve of a computed custom property as a timing of the motion: cubic-bezier(x1, y1, x2, y2), a keyword of CSS
 * or linear. A curve of another kind, as steps(), runs as easeInOutSine, the curve of the details before the property.
 */
export function cssEasing(value: string): (x: number) => number {
  const easing = value.trim();
  const points = /^cubic-bezier\(([^)]*)\)$/.exec(easing)?.[1].split(',').map(Number) ?? easingKeywords[easing];

  if (easing === 'linear') {
    return (x: number) => x;
  }

  return (points?.length === 4 && points.every(Number.isFinite)) ? cubicBezier(points[0], points[1], points[2], points[3]) : easeInOutSine;
}

/** The number of a computed custom property: a length in px or a plain number as it is, a time in ms. */
export function cssNumber(value: string): number {
  // Only a time has two units: the browser may give 350ms as 0.35s
  return parseFloat(value) * (/\ds\s*$/.test(value) ? 1000 : 1);
}

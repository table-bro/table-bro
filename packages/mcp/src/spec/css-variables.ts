/**
 * The CSS custom properties a spec may set: the sizes and the timings that a skin declares on the host and the core
 * registers with @property (packages/core/styles/_custom-properties.scss). A value set on the element changes
 * the CSS and the script of the table together, without a new build of the skin.
 */
export interface BroCssVariable {
  name: string;
  kind: 'length' | 'time' | 'number' | 'integer' | 'easing';
  /**
   * The element that reads it: the table, the container of the Filter Drawer, or both. A value from an ancestor does
   * not reach them, so the generator sets it on the element itself.
   */
  target: 'table' | 'drawer' | 'both';
  min?: number;
  max?: number;
  description: string;
}

export const cssVariables: BroCssVariable[] = [
  {name: '--bro-row-height', kind: 'length', target: 'table', description: 'the height of a body row'},
  {name: '--bro-header-height', kind: 'length', target: 'table', description: 'the height of the header'},
  {name: '--bro-shadow-size', kind: 'length', target: 'both', description: 'the size of the shadow of the table and the room the Filter Drawer leaves for it'},
  {name: '--bro-corner-radius', kind: 'length', target: 'both', description: 'the radius of the corners of the table; 0 keeps them square'},
  {name: '--bro-island-space-size', kind: 'length', target: 'both', description: 'the space between the table and the Filter Drawer'},
  {name: '--bro-table-min-width', kind: 'length', target: 'table', description: 'the narrowest table, as wide as its paginator in one line; the Filter Drawer lies over a table that would be narrower next to it'},
  {name: '--bro-filter-drawer-width', kind: 'length', target: 'drawer', description: 'the width of the Filter Drawer'},
  {name: '--bro-filter-drawer-corner-radius', kind: 'length', target: 'drawer', description: 'the radius of the corners of the Filter Drawer; 0 keeps them square'},
  {name: '--bro-filter-drawer-duration', kind: 'time', target: 'both', description: 'the duration of the motion of the Filter Drawer and of the columns with it'},
  {name: '--bro-column-width-duration', kind: 'time', target: 'table', description: 'the duration of the motion of the columns to their new widths'},
  {name: '--bro-details-duration', kind: 'time', target: 'table', description: 'the duration of opening the row details'},
  {name: '--bro-details-easing', kind: 'easing', target: 'table', description: 'the curve of the eased row details, with config.rowDetailsMotion: eased, and of the turn of their button'},
  {name: '--bro-kinetic-time-constant', kind: 'time', target: 'table', description: 'the time constant of the kinetic scroll'},
  {name: '--bro-state-icon-duration', kind: 'time', target: 'table', description: 'the duration of the animation of the state icon'},
  {name: '--bro-state-message-duration', kind: 'time', target: 'table', description: 'the duration of the animation of the state message'},
  {name: '--bro-refresh-overlay-opacity', kind: 'number', target: 'table', min: 0, max: 1, description: 'how much the cells of the body fade during a refresh, in the light theme'},
  {name: '--bro-refresh-overlay-opacity-dark', kind: 'number', target: 'table', min: 0, max: 1, description: 'how much the cells of the body fade during a refresh, in the dark theme'},
  {name: '--bro-table-body-container-z-index', kind: 'integer', target: 'table', description: 'the layer of the body of the table'}
];

/** The registered properties a spec may not set, with the reason. */
export const excludedCssVariables: Record<string, string> = {
  '--bro-duration-scale': 'the skin sets it to 0 under prefers-reduced-motion; a value on the table would cancel this setting of the user',
  '--bro-filter-drawer-opened': 'it is the state of the Filter Drawer, not a setting: its CSS moves it from 0 to 1 on opening, and a value would stop the drawer'
};

const units: Record<BroCssVariable['kind'], RegExp> = {
  length: /^(\d+|\d*\.\d+)(px|rem|em)$|^0$/,
  time: /^(\d+|\d*\.\d+)(ms|s)$/,
  number: /^(\d+|\d*\.\d+)$/,
  integer: /^-?\d+$/,
  // The x of the two points of a cubic-bezier lie from 0 to 1, as CSS takes them
  easing: /^cubic-bezier\(\s*(0(\.\d+)?|1(\.0+)?|\.\d+)\s*,\s*-?(\d+(\.\d+)?|\.\d+)\s*,\s*(0(\.\d+)?|1(\.0+)?|\.\d+)\s*,\s*-?(\d+(\.\d+)?|\.\d+)\s*\)$|^(linear|ease|ease-in|ease-out|ease-in-out)$/
};

const expectedValues: Record<BroCssVariable['kind'], string> = {
  length: 'a length in px, rem or em, as 64px',
  time: 'a time in ms or s, as 300ms',
  number: 'a number, as 0.5',
  integer: 'an integer, as 2',
  easing: 'a curve of CSS, as cubic-bezier(.2, 0, 0, 1) or ease-out'
};

/** The problem of a value for its variable, or undefined for a good value. */
export function checkCssValue(variable: BroCssVariable, value: string): string | undefined {
  if (!units[variable.kind].test(value)) {
    return `expected ${expectedValues[variable.kind]}`;
  }

  const number = parseFloat(value);

  if (variable.min !== undefined && number < variable.min) {
    return `expected a value from ${variable.min}`;
  }

  if (variable.max !== undefined && number > variable.max) {
    return `expected a value up to ${variable.max}`;
  }

  return undefined;
}

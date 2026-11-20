import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';
import {isServer}                             from 'solid-js/web';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the azure
// palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the surface
// as the background of the table, the outline as the borders of the rows and the outline of the chips, and the font
// Roboto. The page stays light, as the page of that sample, and the table follows the color scheme of the system:
// the server renders the light one, and the browser follows a change of the scheme
const scheme = isServer ? undefined : window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme?.matches ?? false);

scheme?.addEventListener('change', event => setDark(event.matches));

const lightPalette = {
  mode: 'light' as const,
  primary: {main: '#005cbb'},
  text: {primary: '#1a1b1f', secondary: '#44474e', disabled: 'rgba(26, 27, 31, 0.38)'},
  divider: '#74777f',
  background: {default: '#faf9fd', paper: '#faf9fd'},
  action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)', disabledOpacity: 0.38},
  grey: {400: '#74777f'}
};

// The dark scheme keeps the light background of the page, which CssBaseline gives the body
const darkPalette = {
  mode: 'dark' as const,
  primary: {main: '#abc7ff'},
  text: {primary: '#e3e2e6', secondary: '#e0e2ec', disabled: 'rgba(227, 226, 230, 0.38)'},
  divider: '#8e9099',
  background: {default: '#faf9fd', paper: '#121316'},
  action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)', disabledOpacity: 0.38},
  grey: {700: '#8e9099'}
};

const palette = createRoot(() => createMemo(() => createPalette(dark() ? darkPalette : lightPalette)));

export const theme = createTheme({palette, typography: {fontFamily: 'Roboto'}});

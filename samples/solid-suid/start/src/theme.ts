import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';
import {isServer}                             from 'solid-js/web';

// The theme of the application in the color scheme of the system: the server renders the light one, and the browser
// takes the scheme of the system and follows a change of it, as the components of SUID and the table do
const scheme = isServer ? undefined : window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme?.matches ?? false);

scheme?.addEventListener('change', event => setDark(event.matches));

const palette = createRoot(() => createMemo(() => createPalette({mode: dark() ? 'dark' : 'light'})));

export const theme = createTheme({palette});

import {createPalette, createTheme}           from '@suid/material/styles';
import {createMemo, createRoot, createSignal} from 'solid-js';

// The theme of the application in the color scheme of the system: its palette follows a change of the scheme, and the
// components of SUID and the table take it
const scheme = window.matchMedia('(prefers-color-scheme: dark)');
const [dark, setDark] = createSignal(scheme.matches);

scheme.addEventListener('change', event => setDark(event.matches));

const palette = createRoot(() => createMemo(() => createPalette({mode: dark() ? 'dark' : 'light'})));

export const theme = createTheme({palette});

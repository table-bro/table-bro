// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin suid, and
// setSuidTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/solid-suid/dist/table-bro.solid-suid.min.css';
import {setSuidTheme} from '@table-bro/solid-suid';

import {theme} from './theme';

import './sample-page.css';

setSuidTheme(theme);

// The CSS of the core and of the skin, then the skin: its import defines <table-bro> and registers the skin mui, and
// setMuiTheme() gives its elements the theme of the application
import '@table-bro/core/dist/table-bro.min.css';
import '@table-bro/react-mui/dist/table-bro.react-mui.min.css';
import {setMuiTheme} from '@table-bro/react-mui';

import {theme} from './theme';

import './sample-page.css';

setMuiTheme(theme);

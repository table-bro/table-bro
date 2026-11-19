// The skin: its import defines <table-bro> and registers the skin mui, and setMuiTheme() gives its elements the theme
// of the application
import {setMuiTheme} from '@table-bro/react-mui';

import {theme} from './theme';

setMuiTheme(theme);

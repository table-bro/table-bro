import {createTheme} from '@suid/material/styles';

// The theme of the application, as the one of samples/angular-material in the roles of the palette of SUID: the light
// azure palette of Material 3, with the texts on-surface and on-surface-variant, the state layers of Material 3, the
// surface as the background, the outline as the borders of the rows and the outline of the chips, and the font Roboto
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {main: '#005cbb'},
    text: {primary: '#1a1b1f', secondary: '#44474e', disabled: 'rgba(26, 27, 31, 0.38)'},
    divider: '#74777f',
    background: {default: '#faf9fd', paper: '#faf9fd'},
    action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)', disabledOpacity: 0.38},
    grey: {400: '#74777f'}
  },
  typography: {fontFamily: 'Roboto'}
});

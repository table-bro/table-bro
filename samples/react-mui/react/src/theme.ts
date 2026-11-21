import {createTheme} from '@mui/material/styles';

// The theme of the application: its CSS variables give the colors to the table, and the attribute of its color
// schemes lets a table with a theme of its own take the light or the dark one. The colors are the ones of the theme of
// the sample of Angular Material, the azure palette of Material 3, so the table looks as the table of the skin mat
export const theme = createTheme({
  cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'},
  colorSchemes: {
    light: {
      palette: {
        primary: {main: '#005cbb', contrastText: '#ffffff'},
        text: {primary: '#1a1b1f', secondary: '#44474e'},
        action: {active: '#44474e', hover: 'rgba(26, 27, 31, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(26, 27, 31, 0.38)'},
        background: {default: '#faf9fd', paper: '#faf9fd'},
        divider: '#e0e2ec',
        'LinearProgress': {primaryBg: '#e0e2ec'},
        'TableCell': {border: '#74777f'}
      }
    },
    dark: {
      palette: {
        primary: {main: '#abc7ff', contrastText: '#002f65'},
        text: {primary: '#e3e2e6', secondary: '#e0e2ec'},
        action: {active: '#e0e2ec', hover: 'rgba(227, 226, 230, 0.08)', hoverOpacity: 0.08, disabled: 'rgba(227, 226, 230, 0.38)'},
        background: {default: '#121316', paper: '#121316'},
        divider: '#44474e',
        'LinearProgress': {primaryBg: '#44474e'},
        'TableCell': {border: '#8e9099'}
      }
    }
  }
});

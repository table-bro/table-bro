import {createTheme} from '@mui/material/styles';

// The theme of the application: its CSS variables give the colors to the table, and the attribute of its color
// schemes lets a table with a theme of its own take the light or the dark one
export const theme = createTheme({
  cssVariables: {colorSchemeSelector: 'data-mui-color-scheme'},
  colorSchemes: {light: true, dark: true}
});

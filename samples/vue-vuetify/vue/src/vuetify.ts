import {createVuetify, type ThemeDefinition} from 'vuetify';
import {md3}                                 from 'vuetify/blueprints';
import {aliases, md}                         from 'vuetify/iconsets/md';

// The light theme of the sample of Angular Material, its azure palette, in the colors of Vuetify: the system tokens of
// mat of the same roles. The light surface of Vuetify is the surface variant of Material, the surface variant of
// Vuetify its inverse surface, the background of the tooltips. The text of the high emphasis is the on-surface of mat,
// opaque, and the medium emphasis gives its on-surface-variant on the surface; the border is the outline of the rows of
// mat, and the state layers have the opacities of mat
const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAF9FD',
    'on-background': '#1A1B1F',
    primary: '#005CBB',
    'on-primary': '#FFFFFF',
    secondary: '#565E71',
    'on-secondary': '#FFFFFF',
    error: '#BA1A1A',
    'on-error': '#FFFFFF',
    surface: '#FAF9FD',
    'on-surface': '#1A1B1F',
    'surface-light': '#E0E2EC',
    'surface-variant': '#2F3033',
    'on-surface-variant': '#F2F0F4'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 0.8,
    'disabled-opacity': 0.38,
    'border-color': '#74777F',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The dark theme of the same palette, which the table takes in a dark system by its theme auto, as the table of the
// sample of Angular Material takes the dark tokens of mat there
const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121316',
    'on-background': '#E3E2E6',
    primary: '#ABC7FF',
    'on-primary': '#002F65',
    secondary: '#BEC6DC',
    'on-secondary': '#283041',
    error: '#FFB4AB',
    'on-error': '#690005',
    surface: '#121316',
    'on-surface': '#E3E2E6',
    'surface-light': '#44474E',
    'surface-variant': '#E3E2E6',
    'on-surface-variant': '#2F3033'
  },
  variables: {
    'high-emphasis-opacity': 1,
    'medium-emphasis-opacity': 1,
    'disabled-opacity': 0.38,
    'border-color': '#8E9099',
    'border-opacity': 1,
    'hover-opacity': 0.08,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.16
  }
};

// The Vuetify of the application, with the blueprint of Material 3: its themes give the colors to the table, on the
// light page of the sample of Angular Material, and its defaults the look of the components in it. Its icons are the
// ligatures of Material Icons, the font of the page, as the arrow of the select of the page size
export const vuetify = createVuetify({
  blueprint: md3,
  icons: {defaultSet: 'md', aliases, sets: {md}},
  theme: {defaultTheme: 'light', themes: {light, dark}}
});

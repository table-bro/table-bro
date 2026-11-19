import {createVuetify} from 'vuetify';
import {md3}           from 'vuetify/blueprints';
import {aliases, md}   from 'vuetify/iconsets/md';

// The Vuetify of the application, with the blueprint of Material 3: its themes give the colors to the table, light or
// dark as the system, and its defaults the look of the components in it. Its icons are the ligatures of Material
// Icons, the font of the page, as the arrow of the select of the page size
export const vuetify = createVuetify({blueprint: md3, icons: {defaultSet: 'md', aliases, sets: {md}}});

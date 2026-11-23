import type {BroSkinConfig} from '@table-bro/core';

import {vuetifyThemeAttribute} from './bro-vuetify-element';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const vuetifySkinConfig = {
  // A table with a theme of its own gives the components of Vuetify in it the theme of that name, light or dark: the
  // stylesheet of setVuetify() writes the variables of each theme of the application for this attribute
  themeAttribute: vuetifyThemeAttribute,

  css: {
    table: {
      className: 'bro-vuetify-table',

      thead: {
        tr: {
          className: 'bro-vuetify-header-row bro-header-row',

          th: {
            className: 'bro-vuetify-header-cell bro-header-cell text-title-small'
          }
        }
      },

      tbody: {
        tr: {
          className: 'bro-vuetify-row bro-row',

          td: {
            className: 'bro-vuetify-cell bro-cell text-body-medium'
          }
        }
      }
    },

    shadow: {
      className: 'bro-vuetify-elevation-16'
    }
  },

  components: {
    button: {
      selector: 'bro-vuetify-button',

      iconSelector: '.v-icon',

      beforeRender: (element: Element, value: string) => {
        element.setAttribute('button-title', value);
        element.setAttribute('icon', 'expand_more');
      }
    },
    filterDrawer: {
      beforeRender: (closeButton: Element) => {
        closeButton.setAttribute('icon', 'close');
      }
    },
    fontIcon: {
      // The name of a ligature icon is its text: the message of the state names the state instead
      html: (materialIcon: string) => `<span class="material-icons bro-state-icon" aria-hidden="true">${materialIcon}</span>`
    },
    paginator: {
      selector: 'bro-vuetify-paginator',
      inputsAsProperties: true
    },
    progressBar: {
      selector: 'bro-vuetify-progress-bar'
    },
    sortHeader: {
      selector: 'bro-vuetify-sort-header',
      contentSelector: '.bro-vuetify-sort-header-content'
    },
    state: {
      fontIcon: true,
      states: {
        loading: ['front_loader', 'Loading'],
        'no-data': ['heart_broken', 'No data'],
        'not-found': ['heart_broken', 'No records found'],
        fail: ['smart_toy', 'Failed']
      }
    },
    switch: {
      selector: 'bro-vuetify-switch'
    },
    textEllipsis: {
      selector: 'bro-vuetify-text-ellipsis'
    },
    toolbar: {
      selector: 'bro-vuetify-toolbar'
    },
    toolbarMain: {
      selector: 'bro-vuetify-toolbar-main'
    },
    toolbarSearch: {
      beforeRender: (backButton: Element, clearButton: Element) => {
        backButton.setAttribute('icon', 'arrow_back');

        clearButton.setAttribute('icon', 'close');
      }
    }
  },

  // The optional elements: a table that uses one undefined names its function in the console
  elements: {
    'bro-vuetify-tags': 'withTags',
    'bro-vuetify-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

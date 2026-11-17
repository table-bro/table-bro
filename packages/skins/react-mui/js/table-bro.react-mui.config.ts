import type {BroSkinConfig} from '@table-bro/core';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const muiSkinConfig = {
  // A table with a theme of its own gives the components of MUI in it the color scheme of that theme: the theme of the
  // application selects its schemes by this attribute (colorSchemeSelector of cssVariables)
  themeAttribute: 'data-mui-color-scheme',

  css: {
    table: {
      className: 'bro-mui-table',

      thead: {
        tr: {
          className: 'bro-mui-header-row bro-header-row',

          th: {
            className: 'bro-mui-header-cell bro-header-cell'
          }
        }
      },

      tbody: {
        tr: {
          className: 'bro-mui-row bro-row',

          td: {
            className: 'bro-mui-cell bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'bro-mui-elevation-16'
    }
  },

  components: {
    button: {
      selector: 'bro-mui-button',

      iconSelector: '.MuiIcon-root',

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
      selector: 'bro-mui-paginator',
      inputsAsProperties: true
    },
    progressBar: {
      selector: 'bro-mui-progress-bar'
    },
    sortHeader: {
      selector: 'bro-mui-sort-header',
      contentSelector: '.bro-mui-sort-header-content'
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
      selector: 'bro-mui-switch'
    },
    textEllipsis: {
      selector: 'bro-mui-text-ellipsis'
    },
    toolbar: {
      selector: 'bro-mui-toolbar'
    },
    toolbarMain: {
      selector: 'bro-mui-toolbar-main'
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
    'bro-mui-tags': 'withTags',
    'bro-mui-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

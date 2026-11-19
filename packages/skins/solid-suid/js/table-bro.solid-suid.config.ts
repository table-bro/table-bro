import type {BroSkinConfig} from '@table-bro/core';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const suidSkinConfig = {
  // A table with a theme of its own gives the components of SUID in it and the CSS variables of the skin the theme of
  // its scheme: the skin writes the variables of each scheme for the attribute, and its elements take its theme
  themeAttribute: 'data-suid-theme',

  css: {
    table: {
      className: 'bro-suid-table',

      thead: {
        tr: {
          className: 'bro-suid-header-row bro-header-row',

          th: {
            className: 'bro-suid-header-cell bro-header-cell'
          }
        }
      },

      tbody: {
        tr: {
          className: 'bro-suid-row bro-row',

          td: {
            className: 'bro-suid-cell bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'bro-suid-elevation-16'
    }
  },

  components: {
    button: {
      selector: 'bro-suid-button',

      iconSelector: '.MuiIcon-root',

      beforeRender: (element: Element, value: string) => {
        element.setAttribute('button-title', value);
        element.setAttribute('icon', 'expand_more');
      }
    },
    dropdown: {
      selector: 'bro-suid-dropdown'
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
      selector: 'bro-suid-paginator',

      // The links of the pages are the icon buttons of the table pagination of MUI, with the ligatures of Material Icons
      // (styles of the skin)
      css: {
        ul: {
          className: 'bro-suid-pagination',

          li: {
            className: 'bro-suid-page-item',

            a: {
              className: 'material-icons bro-suid-page-link'
            }
          }
        }
      }
    },
    progressBar: {
      selector: 'bro-suid-progress-bar'
    },
    sortHeader: {
      selector: 'bro-suid-sort-header',
      contentSelector: '.bro-sort-header-content',

      // The arrow of the sort label of MUI, the icon ArrowUpward of Material Icons: the header turns it down for a
      // descending sort
      beforeRender: <(element: Element, value: string) => void>((element: Element) => {
        element.setAttribute('icon-html', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>');
      })
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
      selector: 'bro-suid-switch'
    },
    textEllipsis: {
      selector: 'bro-suid-text-ellipsis'
    },
    toolbar: {
      selector: 'bro-suid-toolbar'
    },
    toolbarMain: {
      selector: 'bro-suid-toolbar-main'
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
    'bro-suid-tags': 'withTags',
    'bro-suid-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

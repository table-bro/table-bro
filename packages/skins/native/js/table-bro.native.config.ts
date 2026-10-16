import type {BroButton, BroSkinConfig} from '@table-bro/core';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const nativeSkinConfig = {
  css: {
    table: {
      thead: {
        tr: {
          className: 'bro-header-row',

          th: {
            className: 'bro-header-cell'
          }
        }
      },

      tbody: {
        tr: {
          className: 'bro-row',

          td: {
            className: 'bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'shadow-lg'
    }
  },

  components: {
    button: {
      selector: 'bro-button',

      iconSelector: '.bro-button-toggle',

      beforeRender: (element: Element, value: string) => {
        element.setAttribute('mode', 'link');
        element.setAttribute('button-title', value);
        element.setAttribute('icon-html', '<span class="bro-button-toggle"></span>');
      }
    },
    dropdown: {
      selector: 'bro-nv-dropdown'
    },
    filterDrawer: {
      beforeRender: (closeButton: Element) => {
        (<Element & BroButton>closeButton).iconHTML = '&times;';
        closeButton.setAttribute('button-class', 'bro-nav-link');
        closeButton.setAttribute('mode', 'link');
      }
    },
    paginator: {
      selector: 'bro-paginator',

      css: {
        ul: {
          className: 'bro-pagination',

          li: {
            className: 'bro-page-item',

            a: {
              className: 'bro-page-link'
            }
          }
        }
      }
    },
    progressBar: {
      selector: 'bro-nv-progress-bar'
    },
    sortHeader: {
      selector: 'bro-sort-header',
      contentSelector: '.bro-sort-header-content',

      beforeRender: <(element: Element, value: string) => void>((element: Element) => {
        element.setAttribute('icon-html', '<span class="bro-button-icon">&#9660;</span>');
      }),
      afterRender: (element: Element, value: string) => {
        element.setAttribute('title', value);
      }
    },
    state: {
      states: {
        loading: ['🚀', 'Loading'],
        'no-data': ['💔', 'No data'],
        'not-found': ['🔦', 'No records found'],
        fail: ['😕', 'Failed']
      }
    },
    switch: {
      selector: 'bro-switch',

      css: {
        div: {
          className: 'bro-form-check bro-form-switch',

          input: {
            className: 'bro-form-check-input'
          }
        }
      }
    },
    textEllipsis: {
      selector: 'bro-text-ellipsis',

      afterRender: (element: Element, value: string) => {
        element.setAttribute('title', value);
      }
    },
    toolbar: {
      selector: 'bro-toolbar',

      css: {
        nav: {
          className: 'bro-navbar bro-navbar-expand'
        }
      }
    },
    toolbarMain: {
      selector: 'bro-toolbar-main',

      css: {
        toolbarTitle: {
          className: 'bro-navbar-brand'
        },
        navbarCollapse: {
          className: 'bro-navbar-collapse',

          ul: {
            li: {
              className: 'bro-nav-item',

              a: {
                className: 'bro-nav-link'
              }
            }
          }
        }
      },

      // The value is the word of the search button, texts.search of the config
      beforeRender: (searchButton: Element, value: string) => {
        searchButton.setAttribute('button-title', value);
      }
    },
    toolbarSearch: {
      beforeRender: (backButton: Element, clearButton: Element) => {
        (<Element & BroButton>backButton).iconHTML = '&larr;';
        backButton.setAttribute('button-class', 'bro-nav-link');
        backButton.setAttribute('mode', 'link');

        (<Element & BroButton>clearButton).iconHTML = '&times;';
        clearButton.setAttribute('button-class', 'bro-nav-link');
        clearButton.setAttribute('mode', 'link');
      }
    }
  },

  // The optional elements: a table that uses one undefined names its function in the console
  elements: {
    'bro-nv-tags': 'withTags',
    'bro-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

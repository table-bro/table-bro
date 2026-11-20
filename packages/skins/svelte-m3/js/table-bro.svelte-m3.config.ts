import type {BroSkinConfig} from '@table-bro/core';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined.
// The theme of M3 Svelte writes its colors with light-dark(), as the tokens of Angular Material: a table with a theme of
// its own takes the scheme of that theme by the class of the core, without an attribute of the library
export const m3SvelteSkinConfig = {
  css: {
    table: {
      className: 'bro-m3-svelte-table',

      thead: {
        tr: {
          className: 'bro-m3-svelte-header-row bro-header-row',

          th: {
            className: 'bro-m3-svelte-header-cell bro-header-cell'
          }
        }
      },

      tbody: {
        tr: {
          className: 'bro-m3-svelte-row bro-row',

          td: {
            className: 'bro-m3-svelte-cell bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'bro-m3-svelte-elevation-5'
    }
  },

  components: {
    button: {
      selector: 'bro-m3-svelte-button',

      iconSelector: '.bro-m3-svelte-icon',

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
      html: (materialIcon: string) => `<span class="material-symbols-outlined bro-state-icon" aria-hidden="true">${materialIcon}</span>`
    },
    paginator: {
      selector: 'bro-m3-svelte-paginator',
      inputsAsProperties: true
    },
    progressBar: {
      selector: 'bro-m3-svelte-progress-bar'
    },
    sortHeader: {
      selector: 'bro-m3-svelte-sort-header',
      contentSelector: '.bro-m3-svelte-sort-header-content'
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
      selector: 'bro-m3-svelte-switch'
    },
    textEllipsis: {
      selector: 'bro-m3-svelte-text-ellipsis'
    },
    toolbar: {
      selector: 'bro-m3-svelte-toolbar'
    },
    toolbarMain: {
      selector: 'bro-m3-svelte-toolbar-main'
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
    'bro-m3-svelte-tags': 'withTags',
    'bro-m3-svelte-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

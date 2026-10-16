import type {BroSkinConfig} from '@table-bro/core';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const matSkinConfig = {
  css: {
    table: {
      className: 'mat-table',

      thead: {
        tr: {
          className: 'mat-header-row bro-header-row',

          th: {
            className: 'mat-header-cell bro-header-cell'
          }
        }
      },

      tbody: {
        tr: {
          className: 'mat-row bro-row',

          td: {
            className: 'mat-cell bro-cell'
          }
        }
      }
    },

    shadow: {
      className: 'mat-elevation-z16'
    }
  },

  components: {
    button: {
      selector: 'bro-mat-button',

      iconSelector: '.mat-icon',

      beforeRender: (element: Element, value: string) => {
        element.setAttribute('button-title', value);
        element.setAttribute('icon', 'expand_more');
      }
    },
    // The drawer of the skin is TableBroFilterDrawerContainerNg, with its close button in its template
    filterDrawer: {},
    fontIcon: {
      // The name of a ligature icon is its text: the message of the state names the state instead
      html: (materialIcon: string) => `<span class="material-icons bro-state-icon" aria-hidden="true">${materialIcon}</span>`
    },
    paginator: {
      selector: 'ng-mat-paginator',
      inputsAsProperties: true,
      recreateOnReplaceRows: true
    },
    progressBar: {
      selector: 'ng-mat-progress-bar'
    },
    sortHeader: {
      selector: 'bro-mat-sort-header',
      titleAsContent: true,
      contentSelector: '.mat-sort-header-content'
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
      selector: 'bro-mat-slide-toggle'
    },
    textEllipsis: {
      selector: 'bro-mat-text-ellipsis'
    },
    toolbar: {
      selector: 'ng-mat-toolbar'
    },
    toolbarMain: {
      selector: 'bro-mat-toolbar-main'
    },
    toolbarSearch: {
      beforeRender: (backButton: Element, clearButton: Element) => {
        backButton.setAttribute('icon', 'arrow_back');

        clearButton.setAttribute('icon', 'close');
      }
    }
  }
} satisfies BroSkinConfig;

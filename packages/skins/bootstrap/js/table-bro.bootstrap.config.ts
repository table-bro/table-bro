import type {BroButton, BroSkinConfig} from '@table-bro/core';

import {bootstrapClasses} from './bootstrap-classes';

// The constant keeps the type of its value: an application reads its buttons and its states without checks of undefined
export const bootstrapSkinConfig = {
  // A table with a theme of its own gives the components of Bootstrap in it the color mode of that theme
  themeAttribute: 'data-bs-theme',

  css: {
    table: {
      className: 'table',

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
        element.setAttribute('button-class', 'btn btn-link');
        element.setAttribute('button-title', value);
        element.setAttribute('icon-html', '<span class="bro-button-toggle"></span>');
      }
    },
    dropdown: {
      selector: 'bro-bs-dropdown',
      css: {
        button: {
          className: 'btn-outline-primary'
        }
      }
    },
    filterDrawer: {
      beforeRender: (closeButton: Element) => {
        (<Element & BroButton>closeButton).iconHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>`;
        closeButton.setAttribute('button-class', 'nav-link');
        closeButton.setAttribute('mode', 'link');
      }
    },
    paginator: {
      selector: 'bro-paginator',
      css: {
        ul: {
          className: 'pagination',

          li: {
            className: 'page-item',

            a: {
              className: 'page-link'
            }
          }
        }
      }
    },
    progressBar: {
      selector: 'bro-bs-progress-bar'
    },
    sortHeader: {
      selector: 'bro-sort-header',
      contentSelector: '.bro-sort-header-content',
      beforeRender: <(element: Element, value: string) => void>((element: Element) => {
        element.setAttribute('icon-html', `
          <span class="bro-button-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </span>`);
      }),
      afterRender: (element: Element, value: string) => {
        const bsTooltip = bootstrapClasses().Tooltip.getOrCreateInstance(element, {
          title: value,
          placement: 'right'
        });

        return () => bsTooltip.dispose();
      }
    },
    state: {
      states: {
        loading: [
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-rocket-takeoff-fill" viewBox="0 0 16 16">
             <path d="M12.17 9.53c2.307-2.592 3.278-4.684 3.641-6.218.21-.887.214-1.58.16-2.065a3.6 3.6 0 0 0-.108-.563 2 2 0 0 0-.078-.23V.453c-.073-.164-.168-.234-.352-.295a2 2 0 0 0-.16-.045 4 4 0 0 0-.57-.093c-.49-.044-1.19-.03-2.08.188-1.536.374-3.618 1.343-6.161 3.604l-2.4.238h-.006a2.55 2.55 0 0 0-1.524.734L.15 7.17a.512.512 0 0 0 .433.868l1.896-.271c.28-.04.592.013.955.132.232.076.437.16.655.248l.203.083c.196.816.66 1.58 1.275 2.195.613.614 1.376 1.08 2.191 1.277l.082.202c.089.218.173.424.249.657.118.363.172.676.132.956l-.271 1.9a.512.512 0 0 0 .867.433l2.382-2.386c.41-.41.668-.949.732-1.526zm.11-3.699c-.797.8-1.93.961-2.528.362-.598-.6-.436-1.733.361-2.532.798-.799 1.93-.96 2.528-.361s.437 1.732-.36 2.531Z"/>
             <path d="M5.205 10.787a7.6 7.6 0 0 0 1.804 1.352c-1.118 1.007-4.929 2.028-5.054 1.903-.126-.127.737-4.189 1.839-5.18.346.69.837 1.35 1.411 1.925"/>
           </svg>`, 'Loading'],
        'no-data': [
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heartbreak-fill" viewBox="0 0 16 16">
             <path d="M8.931.586 7 3l1.5 4-2 3L8 15C22.534 5.396 13.757-2.21 8.931.586M7.358.77 5.5 3 7 7l-1.5 3 1.815 4.537C-6.533 4.96 2.685-2.467 7.358.77"/>
           </svg>`, 'No data'],
        'not-found': [
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
             <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
           </svg>`, 'No records found'],
        fail: [
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-neutral-fill" viewBox="0 0 16 16">
             <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m-3 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8"/>
           </svg>`, 'Failed']
      }
    },
    switch: {
      selector: 'bro-switch',
      css: {
        div: {
          className: 'form-check form-switch',

          input: {
            className: 'form-check-input'
          }
        }
      }
    },
    textEllipsis: {
      selector: 'bro-text-ellipsis',
      afterRender: (element: Element, value: string) => {
        const bsTooltip = bootstrapClasses().Tooltip.getOrCreateInstance(element, {
          title: value
        });

        return () => bsTooltip.dispose();
      }
    },
    toolbar: {
      selector: 'bro-toolbar',
      css: {
        nav: {
          className: 'navbar navbar-expand border-bottom',

          div: {
            className: 'container-fluid'
          }
        }
      }
    },
    toolbarMain: {
      selector: 'bro-toolbar-main',
      css: {
        toolbarTitle: {
          className: 'navbar-brand mb-0 h5'
        },
        navbarCollapse: {
          className: 'collapse navbar-collapse',

          ul: {
            className: 'navbar-nav me-auto mb-0',

            li: {
              className: 'nav-item',

              a: {
                className: 'nav-link'
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
        (<Element & BroButton>backButton).iconHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>`;
        backButton.setAttribute('button-class', 'nav-link');
        backButton.setAttribute('mode', 'link');

        (<Element & BroButton>clearButton).iconHTML = `

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </svg>`;
        clearButton.setAttribute('button-class', 'nav-link');
        clearButton.setAttribute('mode', 'link');
      }
    }
  },

  // The optional elements: a table that uses one undefined names its function in the console
  elements: {
    'bro-bs-tags': 'withTags',
    'bro-switch': 'withSwitch'
  }
} satisfies BroSkinConfig;

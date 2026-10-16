import {cssVariables}      from './css-variables.js';
import type {BroSpecField} from './spec.js';

/** A JSON Schema as a plain object. */
export type BroJsonSchema = Record<string, unknown>;

const string = {type: 'string'};
const boolean = {type: 'boolean'};

const button: BroJsonSchema = {
  type: 'object',
  properties: {
    title: string,
    action: {type: 'string', description: 'The action of the bro-action event on a click, as export'},
    icon: {type: 'string', description: 'The name of a Material icon, as download: in the mat skin a button of the toolbar is an icon with a tooltip, the other skins show the title'}
  },
  required: ['title', 'action'],
  additionalProperties: false
};

/**
 * The JSON Schema of BroTableSpec, for the tools of the MCP server and the reference. It gives the form; validateSpec
 * checks the meaning: the names of the fields, the cells and the filters, the values of the CSS variables.
 */
export const specSchema: BroJsonSchema = {
  '$schema': 'https://json-schema.org/draft/2020-12/schema',
  title: 'BroTableSpec',
  description: 'A Table, Bro table as data: columns, custom cells, filters, rows, config and CSS variables, without functions and without the tags of a skin',
  type: 'object',
  properties: {
    specVersion: {const: 1},
    rowType: {type: 'string', description: 'The name of the type of a row in PascalCase, as Order'},
    fields: {
      type: 'array',
      description: 'The fields of a row',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string', description: 'An identifier, as customerName'},
          type: {enum: ['string', 'number', 'boolean', 'string[]']},
          values: {type: 'array', items: string, description: 'All values of a string field: the rows take only them, a select filter offers them'},
          source: {type: 'string', description: 'With an API: the path of the value in an item of its answer, as price or meta.createdAt'}
        },
        required: ['name', 'type'],
        additionalProperties: false
      }
    },
    cols: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: string,
          name: {type: 'string', description: 'The field of the row the column shows'},
          shortTitle: {type: 'string', description: 'The title for the narrowest width of the column; the default is the first word of the title'},
          tooltip: string,
          dataType: {enum: ['string', 'number', 'boolean'], description: 'By default the type of the field'},
          sortKey: {type: 'string', description: 'The field the column sorts by'},
          component: {
            description: 'A custom cell of cells, or a ready element of the skins: tags, switch or details-button',
            oneOf: [
              {type: 'object', properties: {cell: string}, required: ['cell'], additionalProperties: false},
              {type: 'object', properties: {element: {enum: ['tags', 'switch', 'details-button']}}, required: ['element'], additionalProperties: false}
            ]
          }
        },
        required: ['title'],
        additionalProperties: false
      }
    },
    cells: {
      type: 'array',
      description: 'The contracts of the custom cells and of the row details',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string', description: 'In kebab-case, as status'},
          kind: {enum: ['cell', 'details'], description: 'A cell of a column, or the element of the row details'},
          shows: {type: 'string', description: 'What the cell shows, in words'},
          fields: {type: 'array', items: string, description: 'The fields of the row the cell reads'},
          actions: {type: 'array', items: string, description: 'The actions the cell sends, as edit'}
        },
        required: ['name', 'shows', 'fields'],
        additionalProperties: false
      }
    },
    filters: {
      type: 'array',
      description: 'The filters of the Filter Drawer next to the table',
      items: {
        type: 'object',
        properties: {
          name: {type: 'string', description: 'The key in the object of the filters; a range has the keys <name>From and <name>To'},
          label: string,
          control: {enum: ['text', 'select', 'range', 'checkbox']},
          field: {type: 'string', description: 'The field of the row the filter compares'},
          match: {enum: ['contains', 'startsWith', 'eq', 'custom'], description: 'text: contains or startsWith; select and checkbox: eq; range compares itself'},
          rule: {type: 'string', description: 'The rule of the match custom, in words'}
        },
        required: ['name', 'label', 'control'],
        additionalProperties: false
      }
    },
    rows: {
      type: 'array',
      description: 'The rows of the spec: objects with the fields of the row',
      items: {type: 'object'}
    },
    config: {
      type: 'object',
      properties: {
        toolbarTitle: string,
        pageSize: {type: 'integer', minimum: 1, description: 'The rows on a page'},
        server: {type: 'boolean', description: 'The rows come from the server by the query of the table'},
        rowCounter: boolean,
        shadowsEnabled: boolean,
        theme: {enum: ['light', 'dark', 'auto']},
        rowDetailsComponent: {type: 'object', properties: {cell: string}, required: ['cell'], additionalProperties: false, description: 'A cell of the kind details'},
        rowDetailsServer: boolean,
        rowDetailsMotion: {enum: ['kinetic', 'eased'], description: 'The motion of the row details: kinetic by default, eased opens them in --bro-details-duration'}
      },
      additionalProperties: false
    },
    toolbar: {
      type: 'object',
      properties: {
        buttons: {type: 'array', items: button},
        menu: {
          type: 'object',
          properties: {title: string, items: {type: 'array', items: button}},
          required: ['title', 'items'],
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    stateMessages: {
      type: 'object',
      properties: {loading: string, 'no-data': string, 'not-found': string, fail: string},
      additionalProperties: false
    },
    skinConfig: {
      type: 'object',
      description: 'The settings of the components of one skin, with the names of BroConfig',
      properties: Object.fromEntries(['mat', 'bs', 'nv'].map(skin => [skin, {
        type: 'object',
        properties: {
          css: {type: 'object', description: 'Values of BroConfig.css'},
          components: {type: 'object', description: 'Values of BroConfig.components, without functions'},
          callbacks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {type: 'string', description: 'The path of the function, as components.sortHeader.afterRender'},
                does: {type: 'string', description: 'What the function does, in words'}
              },
              required: ['path', 'does'],
              additionalProperties: false
            }
          }
        },
        additionalProperties: false
      }])),
      additionalProperties: false
    },
    api: {
      type: 'object',
      description: 'The GET endpoint that gives the rows',
      properties: {
        url: {type: 'string', description: 'The address of the endpoint, http or https'},
        rows: {type: 'string', description: 'The path of the array of the rows in the answer, as products; empty for an answer that is the array'},
        paging: {
          type: 'object',
          description: 'An API that gives the rows page by page: the query parameters of the size of a page and of its offset or number',
          properties: {size: string, offset: string, page: string},
          required: ['size'],
          additionalProperties: false
        },
        total: {type: 'string', description: 'The path of the number of all rows in the answer of a page, as total: an API that gives pages has it'},
        search: {type: 'string', description: 'An API that gives pages: the query parameter of its text search, as search'},
        sort: {
          type: 'object',
          description: 'An API that gives pages: the query parameters of the sort, of the field and of the direction, asc or desc; without order a minus before the field sorts down',
          properties: {field: string, order: string},
          required: ['field'],
          additionalProperties: false
        },
        filters: {
          type: 'object',
          description: 'An API that gives pages: the query parameter of every key of the filters, as {"newsSite": "news_site"}; a range has the keys <name>From and <name>To',
          additionalProperties: string
        }
      },
      required: ['url', 'rows'],
      additionalProperties: false
    },
    cssVars: {
      type: 'object',
      description: 'The CSS variables of the table',
      properties: Object.fromEntries(cssVariables.map(variable => [variable.name, {type: 'string', description: variable.description}])),
      additionalProperties: false
    }
  },
  required: ['specVersion', 'rowType', 'fields', 'cols'],
  additionalProperties: false
};

/** The JSON Schema of a filter of the Filter Drawer, as in the spec. */
export const filterSchema = <BroJsonSchema>(<Record<string, BroJsonSchema>>specSchema['properties'])['filters']['items'];

/** The JSON Schema of the filling of one cell or of the row details, BroCellFilling, for the tools of the MCP server. */
export const cellFillingSchema: BroJsonSchema = {
  type: 'object',
  properties: {
    imports: {
      type: 'array',
      description: 'Angular: the components of the project that the template uses; the classes of Angular Material and the pipes of Angular come from the template',
      items: {
        anyOf: [
          {type: 'object', properties: {name: string, from: {type: 'string', description: 'The path of the module, as ./order-badge'}}, required: ['name', 'from'], additionalProperties: false},
          {type: 'string', description: 'The name of a class of Angular Material or of a pipe of Angular, as DatePipe'}
        ]
      }
    },
    template: {type: 'string', description: 'Angular: the template of the component, in every skin'},
    styles: {type: 'string', description: 'Angular: the styles of the component'},
    render: {type: 'string', description: 'Vanilla JS: the body of render(), which builds the DOM of the cell'},
    members: {type: 'string', description: 'The members of the class: computed values, handlers'}
  },
  additionalProperties: false
};

const skinBodies: BroJsonSchema = {type: 'object', additionalProperties: string};

/** The JSON Schema of BroSpecFillings, the parts of the code that a model writes, for the tools of the MCP server. */
export const fillingsSchema: BroJsonSchema = {
  title: 'BroSpecFillings',
  description: 'The parts of the code that you write: the templates of the cells, the rules of the custom filters and the bodies of the functions of the skin config; get_docs, topic fillings',
  type: 'object',
  properties: {
    cells: {
      type: 'object',
      description: 'The cells and the row details by their names, for each skin',
      additionalProperties: {type: 'object', properties: {mat: cellFillingSchema, bs: cellFillingSchema, nv: cellFillingSchema}, additionalProperties: false}
    },
    filterRules: {type: 'object', description: 'The conditions of the filters with the match custom, by their names: the body of (row, value) => boolean', additionalProperties: string},
    callbacks: {
      type: 'object',
      description: 'The bodies of the functions of the skin config, by the skin and the path, as components.sortHeader.afterRender',
      properties: {mat: skinBodies, bs: skinBodies, nv: skinBodies},
      additionalProperties: false
    }
  },
  additionalProperties: false
};

/**
 * The JSON Schema of the rows for the fields of a spec. A strict schema of a model has no object with free keys, so
 * the site asks the model for the rows by this schema, after the spec: every value gets the type of its field.
 */
export function rowsSchema(fields: BroSpecField[]): BroJsonSchema {
  return {
    type: 'object',
    properties: {
      rows: {
        type: 'array',
        items: {
          type: 'object',
          properties: Object.fromEntries(fields.map(field => [field.name, fieldSchema(field)])),
          required: fields.map(field => field.name),
          additionalProperties: false
        }
      }
    },
    required: ['rows'],
    additionalProperties: false
  };
}

function fieldSchema(field: BroSpecField): BroJsonSchema {
  const value: BroJsonSchema = field.values ? {type: 'string', enum: field.values} : {type: 'string'};

  switch (field.type) {
    case 'string[]':
      return {type: 'array', items: value};
    case 'string':
      return value;
    default:
      return {type: field.type};
  }
}

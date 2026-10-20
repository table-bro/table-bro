import type {BroFilters, BroQuery, BroSortDirection} from '../shared/query';
import type {BroPageChange}                          from './pagination';
import type {BroRow}                                 from './row';
import type {BroTheme, BroUserTheme}                 from './theme';

// The query of the table names its rows too: the row lives in a file of its own, which both import
export type {BroRow};

// The element
/**
 * The <table-bro> element: its methods and its theme. The methods take the rows of the application of type T.
 * @group Element
 */
export interface TableBroHTMLElement extends HTMLElement {
  /**
   * Creates the table with its columns, its first rows and its config. New columns or a new config need a new table.
   * @param options - the columns, the rows and the config; without rows the table shows its loading state
   */
  configure<T extends object>(options: BroConfigureOptions<T>): void;

  /**
   * Replaces the rows of the table; an empty array shows the empty state.
   * @param rows - the new rows of the application
   * @param options - in the server mode the number of the rows of the query and the state of an empty answer
   */
  replaceRows<T extends object>(rows: T[], options?: BroReplaceRowsOptions): void;

  /**
   * Adds the rows of the next page in the server mode. The local mode adds the rows to its rows and shows them through
   * its filters and sort, on the shown page.
   * @param rows - the rows of the page
   * @param options - the number of the rows of the query on the server
   */
  appendRows<T extends object>(rows: T[], options: BroAppendRowsOptions): void;

  /**
   * Shows a state of the loading of the application.
   * @param state - loading without rows, refreshing over the rows, fail, or idle, which ends a refresh
   */
  setState(state: BroTableState): void;

  /** The theme of this table; reflects the theme attribute. null returns the theme from config.theme. */
  theme: BroUserTheme | null;

  /**
   * Adds a listener of the actions of the table; a listener that takes CustomEvent<BroActionDetail<Order>> gets
   * the columns and the rows of the application of type Order, and one of BroActionDetail<Order, 'edit'> also the data
   * of the actions of the table by their names.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener<T extends object = BroRow, A extends string = string>(type: 'bro-action', listener: (this: TableBroHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | AddEventListenerOptions): void;
  /**
   * Adds a listener of an event of the table, typed by TableBroHTMLElementEventMap.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener<K extends keyof TableBroHTMLElementEventMap>(type: K, listener: (this: TableBroHTMLElement, event: TableBroHTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
  /**
   * Adds a listener of any other event.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  /**
   * Removes a listener of the actions of the table.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener<T extends object = BroRow, A extends string = string>(type: 'bro-action', listener: (this: TableBroHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | EventListenerOptions): void;
  /**
   * Removes a listener of an event of the table.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener<K extends keyof TableBroHTMLElementEventMap>(type: K, listener: (this: TableBroHTMLElement, event: TableBroHTMLElementEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
  /**
   * Removes a listener of any other event.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/**
 * The options of configure(): the columns of the table, its first rows and its config.
 * @group Element
 */
export interface BroConfigureOptions<T extends object = BroRow> {
  /** The columns of the table, in their order. */
  cols: BroCol<T>[];
  /** Without rows the table shows its loading state. */
  rows?: T[];
  /** The config of the table; skin is required. */
  conf: BroConfig<T>;
}

/**
 * The options of replaceRows() in the server mode; the local mode counts its rows and finds its empty state itself.
 * @group Element
 */
export interface BroReplaceRowsOptions {
  /** The number of the rows of the query on the server. */
  total?: number;
  /** The state of an empty answer: 'not-found' for a query with filters. */
  emptyState?: BroEmptyState;
}

/**
 * The state of a table without rows: no data, or no row found by the filters of the query.
 * @group Element
 */
export type BroEmptyState = 'no-data' | 'not-found';

/**
 * The options of appendRows(); the page and the page size are those of the last load intent of the table.
 * @group Element
 */
export interface BroAppendRowsOptions {
  /** The number of the rows of the query on the server. */
  total: number;
}

/**
 * The states of setState(): loading without rows, refreshing over the rows, a failure, or idle, which ends a refresh.
 * @group Element
 */
export type BroTableState = 'loading' | 'refreshing' | 'fail' | 'idle';

/**
 * The events of the <table-bro> element.
 * @group Element
 */
export interface TableBroHTMLElementEventMap extends HTMLElementEventMap {
  /** Every action of the table, of its skin and of the custom cells; bubbles from the element of the action. */
  'bro-action': CustomEvent<BroActionDetail>;
  /** The computed theme of the table changed. */
  'bro-theme-change': CustomEvent<BroTheme>;
  /** An error of the table with its stable code; the table shows its fail state. The event bubbles. */
  'bro-error': CustomEvent<BroErrorDetail>;
}

/**
 * detail of the bro-action event: an action of the table with its data, or a custom action of the application, of a cell
 * with its column and row or of a toolbar button without data. A check of a custom action, such as case 'edit' of a switch
 * on action, gives data as BroCellActionData; the data of an action of the table is BroActionDataMap[action]. A, the names
 * of the custom actions, as 'edit' | 'delete', or never without them, lets a check of an action of the table narrow its
 * data too: with the default string, a custom action may have any name, and its data stays in the union.
 * @group Events
 */
export type BroActionDetail<T extends object = BroRow, A extends string = string> =
  | {[K in BroTableAction]: {action: K; selector?: string; data: BroActionDataMap<T>[K]}}[BroTableAction]
  | {action: A; selector?: string; data?: BroCellActionData<T>};

/**
 * The names of the actions of the table and of its skin.
 * @group Events
 */
export type BroTableAction = keyof BroActionDataMap;

/**
 * The data of each action of the table and of its skin, by the name of the action.
 * @group Events
 */
export interface BroActionDataMap<T extends object = BroRow> {
  /** The search line of the toolbar opened. */
  'bro-toolbar-search-open': undefined;
  /** The search line of the toolbar closed. */
  'bro-toolbar-search-close': undefined;
  /** The export item of the More list of the toolbar. */
  'bro-toolbar-more-export': undefined;
  /** The filters changed: the search of the table, or the filters that the application sends to the table. */
  'bro-filters-filter': BroFilters<T>;
  /** The filters button of the toolbar: the application opens or closes its filter drawer. */
  'bro-filters-toggle': undefined;
  /** The sort of a column changed. */
  'bro-filters-sort': BroColSort<T>;
  /** The load intent of the server mode: the page, the page size, the filters with the search, and the sort. */
  'bro-filters-server-loaded': BroQuery<T>;
  /** The known new width of the table in px. */
  'bro-columns-width': number;
  /** The details button sends no data, a custom cell sends its column and row. */
  'bro-details-toggle': BroCellActionData<T> | undefined;
  /** The loaded part of the server details, 1 at the end. */
  'bro-details-server-loaded': number;
  /** The loading of the server details failed: the row ends its loading closed, and its next opening loads them again. */
  'bro-details-server-failed': undefined;
  /**
   * The paginator asks for a page: the page, from 1, and the page size. The table shows it, and the server mode loads
   * it first by a new load intent when its rows are not loaded.
   */
  'bro-paginator-page': BroPageChange;
}

/**
 * The data of an action of a custom cell: the column and the row of the cell.
 * @group Events
 */
export interface BroCellActionData<T extends object = BroRow> {
  /** The column object of the application. */
  col: BroCol<T>;
  /** The row object of the application. */
  row: T;
}

/**
 * detail of the bro-action event from every source. Table and skin actions carry data;
 * actions of custom cells carry data with the column and the row: BroEventDetail<{col: BroCol, row: BroRow}>.
 */
export interface BroEventDetail<T = unknown> {
  /** The name of the action. */
  action: string;
  /** The tag of the element that sent the action, for the actions of custom cells. */
  selector?: string;
  /** The data of the action. */
  data?: T;
}

/**
 * detail of the bro-error event on the host.
 * @group Events
 */
export interface BroErrorDetail {
  /** The stable code of the error. */
  code: BroErrorCode;
  /** The message of the error, for the log; it may change in any version. */
  message: string;
}

/**
 * Stable codes of the bro-error event: render-failed when a write of the table throws, island-details-missing when
 * a table with rowDetailsIsland renders without the Island Details module; the table shows the fail state in both cases.
 * @group Events
 */
export declare type BroErrorCode = 'render-failed' | 'island-details-missing';

// The columns
/**
 * A column of the table: its title, the field of the row it shows, its sort and its cells.
 * @group Columns and cells
 */
export interface BroCol<T extends object = BroRow> extends BroColSort {
  /** The title of the column in the header. */
  title: string;
  /** The tooltip of the header cell of the column. */
  tooltip?: string;
  /** The field of the row that the column shows, and its key for the class bro-col--<key>. */
  name?: Extract<keyof T, string>;
  /** A class of the header and body cells of the column. */
  className?: string;
  /** The Custom Element of the cells of the column: its tag, or its tag with its attributes and its event. */
  component?: string | BroCustomElementConfig<T>;
  /**
   * The cell values of the column are HTML: the table and the skin cells insert them as markup without sanitizing,
   * so pass only trusted values. Without the flag the values are shown as text.
   */
  html?: boolean;

  /** The colspan of the body cells of the column. */
  colSpan?: number;

  /**
   * The type of the values. The local sort compares the values of a 'number' column as numbers, also the ones given as
   * text, and the header puts the sort arrow of such a column before its title.
   */
  dataType?: BroColDataType;
  /**
   * The field of the row that the column sorts by. The local sort compares text in the language of the page, without
   * case and with the numbers in it, so 'Item 2' comes before 'Item 10'; empty values come last in both directions.
   */
  sortKey?: Extract<keyof T, string>;
  /**
   * Not read by the table: the field neither sets nor shows an initial sort of the column.
   * The table reports the sort direction in the bro-filters-sort event (BroColSort).
   */
  sortDirection?: BroSortDirection;
}

/**
 * The data of the bro-filters-sort event.
 * @group Columns and cells
 */
export interface BroColSort<T extends object = BroRow> {
  /** The type of the values of the sorted column. */
  dataType?: BroColDataType;
  /** The field of the row that the column sorts by. */
  sortKey?: Extract<keyof T, string>;
  /** The direction of the sort arrow, the one of the sort in BroQuery; undefined after the sort is cleared. */
  sortDirection?: BroSortDirection;
}

/**
 * The type of the values of a column, for the local sort and the place of the sort arrow.
 * @group Columns and cells
 */
export declare type BroColDataType = 'string' | 'number' | 'boolean';

/**
 * The setting of a Custom Element: of the cells of a column (BroCol.component), or of the button of a skin.
 * @group Columns and cells
 */
export interface BroCustomElementConfig<T extends object = BroRow> {
  /** The tag of the element. */
  selector?: string;
  /** The attributes of the element: values, or functions of the column and the row; the table sets them as strings, as they are. */
  attrs?: {
    /** The value of the element; without it the element of a column of a skin takes the value of the field of the row. */
    value?: BroCustomElementValueFn<T>;

    /** Any other attribute of the element, as name or href. */
    [attrName: string]: BroCustomElementValueFn<T> | string | undefined;
  };
  /** The event of the element whose detail the table sends as the action of a bro-action event, with the column and the row. */
  event?: string;
}

/**
 * A function of an attribute of a custom element: its value for the column and the row of the cell. The type of a method,
 * whose parameters TypeScript checks both ways, so a column of the application's rows, as BroCol<Order>, is a BroCol.
 * @group Columns and cells
 */
export declare type BroCustomElementValueFn<T extends object = BroRow> = {valueFn(col: BroCol<T>, row: T): string | number | boolean}['valueFn'];

// The config
/**
 * The config of a table: its skin, its classes, texts and theme, its data mode and its features. T is the row type of
 * the application, as of the columns of configure(), for the functions of the config that take a column.
 * @group Configuration
 */
export interface BroConfig<T extends object = BroRow> {
  // Skin, classes, texts
  /** The skin of the table; configure() takes no config without it. */
  skin?: BroSkin;
  /**
   * The theme of the table: 'auto' by default, the color scheme of the system; 'light' or 'dark' for a page that keeps
   * one theme. The theme attribute or property of the table wins over it.
   */
  theme?: BroUserTheme;
  /**
   * The settings of the components of the skin. The table puts the config of the application over a copy of the config
   * of the skin, so a config gives only what it changes, at any depth.
   */
  components?: BroDeepPartial<BroSkinComponents>;
  /** The classes of the table: the config of the application changes those of the skin, at any depth. */
  css?: BroDeepPartial<BroConfigCSS>;
  /** The texts of the table in the language of the application: a config gives the ones it changes. */
  texts?: Partial<BroTexts>;
  /** The shadows of the table and of its regions, on by default; false leaves out the class css.shadow. */
  shadowsEnabled?: boolean;
  /**
   * The nonce of a Content Security Policy without 'unsafe-inline' for styles: the table gives it to the <style>
   * elements of its column widths. The application passes the nonce of its page.
   */
  styleNonce?: string;

  // Data
  /**
   * The server mode: the application loads the rows by the load intent of the table (bro-filters-server-loaded) and
   * gives them by replaceRows() with their total; the table neither filters, sorts nor pages them itself.
   */
  server?: boolean;
  /**
   * The filters of the application in the local mode. The table calls it when a filter has a value, with the rows that
   * its search leaves, and shows the rows that it returns. A cleared filter is undefined, null or an empty string; false
   * and 0 are values.
   */
  filtersTransform?: BroFiltersTransform;

  // Toolbar
  /**
   * false renders the table without its toolbar, with its title, its search and its buttons, as a table in the row
   * details of another table.
   */
  toolbar?: boolean;
  /** The title of the toolbar; without it the toolbar shows no text. */
  toolbarTitle?: string;
  /** The delay of the search after the last key in ms: 100 by default, 400 in the server mode. */
  searchDebounce?: number;

  // Columns
  /**
   * false hides the header of the table, as a table in the row details of another table with the same columns. The
   * header keeps its place in the DOM: the widths and the sort of the columns stay as they are.
   */
  header?: boolean;
  /**
   * false turns off the auto-detected column widths, for an application that knows the widths it needs: the table
   * measures nothing and writes no widths, and the CSS of the application gives every column its width through its
   * class (BroCol.className), for the header and body cells. A long value keeps to the one line of its row and does
   * not widen its column: it shows its first line with an ellipsis; in a column with a width, its whole value shows in the tooltip of the skin.
   */
  autoColumnWidth?: boolean;
  /**
   * The short title of a column: a column may get narrower down to its width, with an ellipsis. The first word of the
   * title by default. The type of a method, whose parameters TypeScript checks both ways, so a config of BroRow serves
   * the columns of Order too.
   */
  shortColumnTitle?: {shortColumnTitle(col: BroCol<T>): string}['shortColumnTitle'];
  /** The column of the row numbers, on by default. */
  rowCounter?: boolean;

  // Row details
  /**
   * The tag of the Custom Element of the row details; without it the rows have no details. The table measures the
   * height of the details when they open: details opened in a hidden table take the height of a row until their next
   * opening, and a component that renders its content later, after a request, loads from the server (rowDetailsServer).
   */
  rowDetailsComponent?: string;
  /**
   * The row details load from the server: the element of the details gets the attribute server="true" and reports its
   * progress by the bro-details-server-loaded event.
   */
  rowDetailsServer?: boolean;
  /** The progress bar of the row details that load from the server: indeterminate, or determinate by their progress. */
  rowDetailsProgressMode?: BroProgressMode;
  /** Island Details: the open details of a row stand apart from the other rows, with spaces around them. */
  rowDetailsIsland?: boolean;
  /**
   * The motion of the row details: kinetic by default, as the pages move; eased opens and closes them in the time of
   * --bro-details-duration.
   */
  rowDetailsMotion?: 'kinetic' | 'eased';

  // Paginator
  /** The rows on a page, 5 by default. */
  pageSize?: number;
  /**
   * The page sizes that the paginator offers, [5, 10, 15, 20, 25, 50, 100] by default: the ones up to the number of all
   * rows, the first one above it and the current one.
   */
  pageSizeOptions?: number[];

  // States
  /** The other animation of the icon of a state: 'alt' turns it from a smaller angle and keeps its place. */
  stateAnimationEffect?: 'alt';

  // Debug
  /** Debugging: the table logs every update with its reason and phases, every received action, and its warnings. */
  debug?: boolean;
  /**
   * Debugging of the animations: every animation of the table runs six times slower with its real curve, and every
   * ended one is logged with its reason and duration and measured on the Performance timeline of the browser.
   */
  debugAnimation?: boolean;
}

/**
 * The skins of T,B, or the name of a skin of a third party that registerSkin registered.
 * @group Skins
 */
export type BroSkin = 'mat' | 'bs' | 'nv' | (string & {});

/**
 * Every field optional at every depth. Arrays and functions stay whole, as the table replaces them in the config of
 * the skin.
 * @group Configuration
 */
export declare type BroDeepPartial<T> = {
  // infer V makes the check distribute over an optional value, as V | undefined
  [K in keyof T]?: T[K] extends infer V ? (V extends (...args: never[]) => unknown ? V : V extends readonly unknown[] ? V : V extends object ? BroDeepPartial<V> : V) : never;
};

/**
 * The components of a skin: its elements, their settings and their functions, all that the table uses.
 * @group Skins
 */
export interface BroSkinComponents {
  /** The button element of the skin: the details button, the buttons of the search line and of the filter drawer. */
  button: BroCustomElementConfig & {
    /** The tag of the button element. */
    selector: string;

    /** The icon inside the button, which the details button turns. */
    iconSelector: string;

    /**
     * Sets the attributes of the button of the details button before it renders, as its class, title and icon.
     * @param element - the button element
     * @param value - the title of the button
     */
    beforeRender: (element: Element, value: string) => void;
  };
  /** The list element of the skin, for the lists of the toolbar. */
  dropdown?: {
    /** The tag of the list element. */
    selector: string;

    /** The classes of the list element. */
    css?: {
      /** The button that opens the list. */
      button: {
        /** The class of the button; the attribute button-class of the element replaces it. */
        className: string;
      };
    };
  };
  /** The filter drawer of the skin. */
  filterDrawer: {
    /**
     * Sets the attributes of the close button of the filter drawer before it renders.
     * @param closeButton - the close button element
     */
    beforeRender?: (closeButton: Element) => void;
  };
  /** The font icons of the skin, for the icons of the states with state.fontIcon. */
  fontIcon?: {
    /**
     * The markup of an icon.
     * @param iconName - the name of the icon, the first item of a state in state.states
     */
    html: (iconName: string) => string;
  };
  /** The paginator element of the skin. */
  paginator: {
    /** The tag of the paginator element. */
    selector: string;

    /** The element takes pageIndex, pageSize, length, pageSizeOptions, disabled and showFirstLastButtons as properties; otherwise as attributes. */
    inputsAsProperties?: boolean;
    /** The element does not apply a new pageIndex after replaceRows, so the table replaces it with a new element. */
    recreateOnReplaceRows?: boolean;

    /** The classes of the list of the page buttons of a vanilla paginator. */
    css?: {
      /** The list of the page buttons. */
      ul?: {
        /** The class of the list. */
        className?: string;

        /** An item of the list. */
        li?: {
          /** The class of an item. */
          className?: string;

          /** The button of an item. */
          a?: {
            /** The class of the button. */
            className?: string;
          };
        };
      };
    };
  };
  /** The progress bar element of the skin, for the loading of the table and of the server details. */
  progressBar: {
    /** The tag of the progress bar element. */
    selector: string;
  };
  /** The sort header element of the skin in the header cells. */
  sortHeader: {
    /** The tag of the sort header element. */
    selector: string;

    /** The column title goes into the element as its content, not only into the header-title attribute. */
    titleAsContent?: boolean;
    /** The title inside the element, measured for the column widths. */
    contentSelector: string;

    /**
     * Sets the attributes of the element before it renders.
     * @param element - the sort header element
     * @param value - an empty string: the title of the column is in the attributes of the element
     */
    beforeRender?: (element: Element, value: string) => void;
    /**
     * Runs after the element renders, for example to add a tooltip. It may return a cleanup function:
     * the element calls it when it is removed from the DOM, and runs the callback again if it is connected later.
     * @param element - the sort header element
     * @param value - the tooltip of the column
     */
    afterRender?: (element: Element, value: string) => void | (() => void);
  };
  /** The states of the body: their icons and messages. */
  state: {
    /** The icons of the states are font icons of fontIcon.html. */
    fontIcon?: boolean;

    /** The icons of the states are Lottie animations of lottieHTML, without a message. */
    lottie?: boolean;
    /**
     * The markup of the animation of a state.
     * @param iconSrc - the address of the animation, the first item of a state in states
     */
    lottieHTML?: (iconSrc: string) => string;

    /** The icon and the message of each state. */
    states: BroStates;
    /** The icon and the message of each state in the dark theme; without it the dark theme takes states. */
    statesDark?: BroStates;
  };
  /** The switch element of the bootstrap-based skins, for the cells of boolean values. */
  switch?: {
    /** The tag of the switch element. */
    selector: string;

    /** The classes of the switch. */
    css?: {
      /** The container of the switch. */
      div: {
        /** The class of the container. */
        className: string;

        /** The checkbox of the switch. */
        input: {
          /** The class of the checkbox. */
          className: string;
        };
      };
    };
  };
  /** The text element of the skin with an ellipsis, for the cells and the short titles. */
  textEllipsis: {
    /** The tag of the text element. */
    selector: string;

    /**
     * Runs after the element renders, for example to add a tooltip. It may return a cleanup function:
     * the element calls it when it is removed from the DOM, and runs the callback again if it is connected later.
     * @param element - the text element
     * @param value - the text of the element
     */
    afterRender?: (element: Element, value: string) => void | (() => void);
  };
  /** The toolbar element of the skin: the bar of the search line and of the filter drawer. */
  toolbar: {
    /** The tag of the toolbar element. */
    selector: string;

    /** The classes of the toolbar of a vanilla skin. */
    css?: {
      /** The bar of the toolbar. */
      nav: {
        /** The class of the bar. */
        className: string;

        /** The content of the bar. */
        div?: {
          /** The class of the content, next to its own class. */
          className?: string;
        };
      };
    };
  };
  /** The main toolbar element of the skin: the title, the search button and the buttons of the application. */
  toolbarMain: {
    /** The tag of the main toolbar element. */
    selector: string;

    /** The classes of the main toolbar of a vanilla skin. */
    css?: {
      /** The title of the toolbar, also the title of the filter drawer. */
      toolbarTitle: {
        /** The class of the title. */
        className: string;
      };
      /** The part of the toolbar with its buttons. */
      navbarCollapse: {
        /** The class of the part. */
        className: string;

        /** The list of the buttons. */
        ul: {
          /** The class of the list. */
          className?: string;

          /** An item of the list. */
          li: {
            /** The class of an item. */
            className: string;

            /** The button of an item. */
            a: {
              /** The class of the button. */
              className: string;
            };
          };
        };
      };
    };

    /**
     * Sets the attributes of the search button before it renders.
     * @param searchButton - the search button element
     * @param value - the word of the button, texts.search
     */
    beforeRender?: (searchButton: Element, value: string) => void;

    /** The buttons and lists of the application in the toolbar. */
    buttons?: (BroButton | BroDropdown)[];
  };
  /** The search line of the toolbar. */
  toolbarSearch: {
    /**
     * Sets the attributes of the back and clear buttons of the search line before they render.
     * @param backButton - the back button element
     * @param clearButton - the clear button element
     */
    beforeRender?: (backButton: Element, clearButton: Element) => void;
  };
}

/**
 * A button of the toolbar, and the contract of the button element of a skin, which takes it as attributes.
 * @group Skins
 */
export interface BroButton {
  /**
   * The name of a button without a title, for screen readers: the element gives it to its button. An attribute of its
   * own, not aria-label, which an element without a role must not carry.
   */
  label?: string;
  /** The class of the button inside the element. */
  buttonClassName?: string | null;
  /** The title of the button, as text. */
  buttonTitle: string;
  /** The tooltip of the button. */
  buttonTooltip?: string;
  /** The markup of the icon of the button, of the skin or the application. */
  iconHTML?: string;
  /** A button, by default, or a link of the toolbar. */
  mode?: 'button' | 'link';

  /** The action of the bro-action event the button sends on click. */
  eventType: string;
}

/**
 * A list of the toolbar, and the contract of the list element of a skin.
 * @group Skins
 */
export interface BroDropdown {
  /** The class of the button of the list. */
  buttonClassName?: string | null;
  /** The title of the button of the list, as text. */
  buttonTitle: string;
  /** The tooltip of the button of the list. */
  buttonTooltip?: string;
  /** The markup of the icon of the button of the list. */
  iconHTML?: string;
  /**
   * The name of a list of values for screen readers, as the page sizes of the paginator, from the attribute label: the
   * element names its control by it and by the value that the control shows.
   */
  label?: string;

  /** A select of values, a dropdown menu, or a dropdown menu of a navbar. */
  mode: 'select' | 'dropdown' | 'navbar-dropdown';
  /** The items of the list. */
  options: BroDropdownOption[];
}

/**
 * An item of a list: a value with its title, a divider, or a header.
 * @group Skins
 */
export declare type BroDropdownOption = {
  /** The value of the item, which the list sends when the item is chosen. */
  value?: string;
  /** The markup of the icon of the item. */
  iconHTML?: string;
  /** The title of the item, as text. */
  title?: string;

  /** A divider between the items. */
  divider?: true;

  /** A header of a group of items, as text. */
  header?: string;
};

/**
 * The icon and the message of each state of the body: the icon is a symbol, the name of a font icon or an animation.
 * @group Configuration
 */
export interface BroStates {
  /** The table loads its rows. */
  loading: [string, string];
  /** The table has no rows. */
  'no-data': [string, string];
  /** The filters found no row; without it the state shows the icon of no-data with the message No records found. */
  'not-found'?: [string, string];
  /** The loading failed. */
  fail: [string, string];
}

/** The states that the body shows with a message: the keys of the messages in components.state.states of the config. */
export type BroStateName = keyof BroStates;

/**
 * The classes of the table and of its shadows.
 * @group Configuration
 */
export interface BroConfigCSS {
  /** The tables of the header and of the body. */
  table?: {
    /** The class of the tables. */
    className?: string;

    /** The header row group. */
    thead?: {
      /** The class of the header row group. */
      className?: string;

      /** The header row. */
      tr?: {
        /** The class of the header row. */
        className?: string;

        /** A header cell. */
        th?: {
          /** The class of a header cell. */
          className?: string;
        };
      };
    };

    /** The body row group. */
    tbody?: {
      /** The class of the body row group. */
      className?: string;

      /** A body row. */
      tr?: {
        /** The class of a body row. */
        className?: string;

        /** A body cell. */
        td?: {
          /** The class of a body cell. */
          className?: string;
        };
      };
    };
  };

  /** The shadows of the toolbar, the header, the body and the paginator. */
  shadow?: {
    /** The class of the shadows. */
    className?: string;
  };
}

/**
 * The texts of the table: its words and the names of its controls, English by default. The skin mat takes the texts
 * of its paginator from MatPaginatorIntl of Angular Material, as its applications do.
 * @group Configuration
 */
export interface BroTexts {
  // The column of the row numbers
  /** The title of the column of the row numbers. */
  rowCounter: string;
  /** The name of the column of the row numbers for screen readers, whose short title they would read as a word. */
  rowCounterName: string;

  // The filter drawer
  /** The title of the filter drawer. */
  filters: string;
  /** The name of the close button of the filter drawer. */
  close: string;

  // The paginator
  /** The name of the paginator, the group of its controls. */
  pagination: string;
  /** The paginator of the vanilla skins: the name of its navigation, the label of its page sizes, the names of its buttons. */
  pageNavigation: string;
  /** The label of the page sizes of the paginator. */
  itemsPerPage: string;
  /** The name of the first page button. */
  firstPage: string;
  /** The name of the previous page button. */
  previousPage: string;
  /** The name of the next page button. */
  nextPage: string;
  /** The name of the last page button. */
  lastPage: string;
  /** The paginator of the vanilla skins: the words of its buttons. */
  first: string;
  /** The word of the previous page button. */
  previous: string;
  /** The word of the next page button. */
  next: string;
  /** The word of the last page button. */
  last: string;
  /** The range of the rows of a page, as 1 – 5 of 20, by the index of the page: as getRangeLabel of MatPaginatorIntl. */
  rangeLabel: (page: number, pageSize: number, length: number) => string;

  // The progress bar
  /** The name of the progress bar of the vanilla skins, bs and nv. */
  loadingProgress: string;

  // The states
  /** The messages of the states; a state without one takes the message of the skin. */
  states: Partial<Record<keyof BroStates, string>>;

  // The toolbar
  /** The search button of the toolbar. */
  search: string;

  // The search line
  /** The placeholder and the name of the field of the search line. */
  searchField: string;
  /** The names of the buttons of the search line. */
  back: string;
  /** The name of the clear button of the search line. */
  clear: string;

  // The tags
  /** A cell of tags without items. */
  noItems: string;

  // The row details
  /** What screen readers say when row details load from the server. */
  detailsLoading: string;
}

/**
 * The filters of the application in the local mode: the rows that the filters leave. The type of a method, whose
 * parameters TypeScript checks both ways, so a function of the application may take its own rows and filters, as Order[].
 * @group Configuration
 */
export type BroFiltersTransform = {filtersTransform(rows: BroRow[], filters: BroFilters): BroRow[]}['filtersTransform'];

/**
 * The mode of a progress bar: indeterminate, or determinate by its value.
 * @group Skins
 */
export declare type BroProgressMode = 'indeterminate' | 'determinate';

/**
 * The config of a skin, which registerSkin registers: its classes, its components and the attribute of its color mode.
 * @group Skins
 */
export interface BroSkinConfig {
  /**
   * The attribute of the color mode of the UI library of the skin, as data-bs-theme of Bootstrap: a table with a theme
   * of its own sets it on its host to 'light' or 'dark', so the components of the library in the table take that mode.
   */
  themeAttribute?: string;
  /** The classes of the table in the skin. */
  css: BroConfigCSS;
  /** The components of the skin. */
  components: BroSkinComponents;
  /**
   * The optional elements of the skin: the function that defines each one, by its tag. A table that uses one of them
   * undefined names the function in the console.
   */
  elements?: Record<string, string>;
}

/**
 * The config of a table after init: a copy of the config of the skin, the defaults, and the config of the application
 * over them. So it has the components, the classes and the theme attribute of the skin and the defaults of resolveConfig.
 * @group Configuration
 */
export interface BroResolvedConfig extends Omit<BroConfig, 'skin' | 'theme' | 'components' | 'css' | 'texts' | 'shadowsEnabled' | 'toolbarTitle' | 'shortColumnTitle' | 'rowCounter' | 'pageSize' | 'pageSizeOptions'> {
  /** configure() takes no config without a skin. */
  skin: BroSkin;
  /** The theme of the config, 'auto' by default. */
  theme: BroUserTheme;
  /** The attribute of the color mode from the config of the skin: only a skin whose UI library has one gives it. */
  themeAttribute?: string;
  /** The components of the skin with the ones of the config of the application over them. */
  components: BroSkinComponents;
  /** The classes of the skin with the ones of the config of the application over them. */
  css: BroConfigCSS;
  /** The English texts with the ones of the config of the application over them. */
  texts: BroTexts;
  /** The shadows of the table, true by default. */
  shadowsEnabled: boolean;
  /** The title of the toolbar, an empty string by default. */
  toolbarTitle: string;
  /** The short title of a column, the first word of its title by default. */
  shortColumnTitle: (col: BroCol) => string;
  /** The column of the row numbers, true by default. */
  rowCounter: boolean;
  /** The rows on a page, 5 by default. */
  pageSize: number;
  /** The page sizes of the paginator, [5, 10, 15, 20, 25, 50, 100] by default. */
  pageSizeOptions: number[];
  /**
   * The table renders into a server DOM, as of a prerender (prerenderTableBro): it shows its loading state, measures and
   * animates nothing, and its heights come from the custom properties of the skin in CSS. The elements of the skin render
   * their markup without the scripts of the browser, as the tooltips and the dropdowns of a UI library.
   */
  prerender?: boolean;
}

// The elements of the application: cells and details
/**
 * The element of a cell of the application: the table sets the objects of its column and row.
 * @group Columns and cells
 */
export interface BroCellElement<T extends object = BroRow> {
  /** The row object of the application: functions, dates and nested objects stay as they are. */
  row?: T;
  /** The column object of the application. */
  col?: BroCol<T>;
}

/**
 * An element that gets the config of its table: a cell element or an element of a skin.
 * @group Columns and cells
 */
export interface BroConfiguredElement {
  /** The config of the table; the table sets its config after init, a BroResolvedConfig with the full components. */
  config?: BroConfig;
}

/**
 * The element of the row details of the application: the table sets its row and the state of its server loading.
 * Server details load in the aux row and move into the row of the details when they open, so connectedCallback runs
 * again: the element renders its content once, by a flag of its own.
 * @group Columns and cells
 */
export interface BroRowDetailsElement<T extends object = BroRow> {
  /** The row object of the application. */
  row?: T;
  /**
   * The attribute server that the table sets, as text: 'true' with rowDetailsServer, so the element loads its data and
   * reports the progress by the bro-details-server-loaded event.
   */
  server?: string;
}

// The elements of the skin
/**
 * The sort header element of a skin: the title of a column with the sort arrow.
 * @group Skins
 */
export interface BroSortHeader {
  /** The active sort of the table; the header of another column resets its arrow. The table sets it. */
  activeSort?: BroColSort;

  /** The place of the arrow: before the title for a number column, after it otherwise. */
  arrowPosition: 'before' | 'after';
  /** The type of the values of the column. */
  dataType: string;
  /** The title of the column. */
  headerTitle: string;
  /** The markup of the arrow of the skin. */
  iconHTML?: string;
  /** The key of the sort of the column: its sortKey, else its name. */
  sortId: string;
  /** The tooltip of the column. */
  tooltip: string;
}

/**
 * The text element of a skin with an ellipsis.
 * @group Skins
 */
export interface BroTextEllipsis {
  /** The class of the container of the text, from the attribute container-class. */
  containerClassName: string | null;
  /** The text. */
  value: string;
}

/**
 * The progress bar element of a skin.
 * @group Skins
 */
export interface BroProgressBar {
  /** The color of the bar, as a class of the UI library of the skin. */
  color: string;
  /** Indeterminate, or determinate by the value. */
  mode: BroProgressMode;
  /** The value of a determinate bar, in percent. */
  value: string;
}

/**
 * The toolbar element of a skin: the bar that holds the content of the table, as its search line.
 * @group Skins
 */
export interface BroToolbarElement {
  /** The class of the content of the toolbar. */
  contentClassName: string;

  /**
   * Appends nodes to the content of the toolbar.
   * @param nodes - the nodes or texts to append
   */
  appendToolbarContent(...nodes: (Node | string)[]): void;
}

/**
 * The main toolbar element of a skin: a toolbar with the title of the table.
 * @group Skins
 */
export interface BroToolbarMain extends BroToolbarElement {
  /** The title of the toolbar, config.toolbarTitle. */
  toolbarTitle: string;
}

/**
 * The paginator element of a skin, with the inputs of the paginator of Angular Material.
 * @group Skins
 */
export interface BroPaginatorElement {
  /** The zero-based page index of the displayed list of items. Defaulted to 0. */
  pageIndex: number;

  /** Number of items to display on a page. By default set to 10. */
  pageSize: number;

  /** The length of the total number of items that are being paginated. Defaulted to 0. */
  length: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptions: number[];

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons: boolean;

  /** Whether the paginator is disabled, as while the table loads. */
  disabled: boolean;
}

/**
 * The page event of the paginator element, with zero-based indexes, as the PageEvent of Angular Material.
 * @group Skins
 */
export interface BroPaginatorPageEvent {
  /** The current page index. */
  pageIndex: number;

  /**
   * Index of the page that was selected previously.
   */
  previousPageIndex?: number;

  /** The current page size */
  pageSize: number;

  /** The current total number of items being paged */
  length: number;
}

// The filter drawer
/**
 * The <table-bro-filter-drawer-container> element: a table with a drawer of the filters of the application next to it, outside of it.
 * @group Filter drawer
 */
export interface BroFilterDrawerHTMLElement extends HTMLElement {
  /** Whether the drawer is opened; reflects the opened attribute. */
  opened: boolean;
  /**
   * side, by default: the drawer stands next to the table, and lies over it with a scrim when the table would get
   * narrower than its minimum width; over: the drawer lies over the table always. Reflects the mode attribute.
   */
  mode: 'side' | 'over';
  /** The texts of the drawer, as the texts of its table: its title and the name of its close button. */
  texts?: Partial<BroTexts>;

  /** Opens a closed drawer and closes an opened one. */
  toggle(): void;

  /**
   * Adds a listener of the actions of the table in the drawer container, which bubble up; a listener that takes
   * CustomEvent<BroActionDetail<Order>> gets the columns and the rows of the application of type Order, and one of
   * BroActionDetail<Order, 'edit'> also the data of the actions of the table by their names.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener<T extends object = BroRow, A extends string = string>(type: 'bro-action', listener: (this: BroFilterDrawerHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | AddEventListenerOptions): void;
  /**
   * Adds a listener of an event of the drawer, typed by BroFilterDrawerHTMLElementEventMap.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener<K extends keyof BroFilterDrawerHTMLElementEventMap>(type: K, listener: (this: BroFilterDrawerHTMLElement, event: BroFilterDrawerHTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
  /**
   * Adds a listener of any other event.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of addEventListener of the DOM
   */
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  /**
   * Removes a listener of the actions of the table in the drawer container.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener<T extends object = BroRow, A extends string = string>(type: 'bro-action', listener: (this: BroFilterDrawerHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | EventListenerOptions): void;
  /**
   * Removes a listener of an event of the drawer.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener<K extends keyof BroFilterDrawerHTMLElementEventMap>(type: K, listener: (this: BroFilterDrawerHTMLElement, event: BroFilterDrawerHTMLElementEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
  /**
   * Removes a listener of any other event.
   * @param type - the name of the event
   * @param listener - the listener of the event
   * @param options - the options of removeEventListener of the DOM
   */
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/**
 * The events of the <table-bro-filter-drawer-container> element: its own, and the actions of its table that bubble up.
 * @group Filter drawer
 */
export interface BroFilterDrawerHTMLElementEventMap extends HTMLElementEventMap {
  /** The drawer opened. */
  'bro-filters-open': CustomEvent<null>;
  /** The drawer closed. */
  'bro-filters-close': CustomEvent<null>;
  /** An action of the table in the drawer container, bubbled up. */
  'bro-action': CustomEvent<BroActionDetail>;
}

declare global {
  interface HTMLElementTagNameMap {
    /** document.createElement('table-bro') and querySelector('table-bro') give the element with its methods. */
    'table-bro': TableBroHTMLElement;
    /** document.createElement('table-bro-filter-drawer-container') gives the element of the filter drawer with its methods. */
    'table-bro-filter-drawer-container': BroFilterDrawerHTMLElement;
  }
}

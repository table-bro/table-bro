# The public types of table-bro

Written by `npm run check:api -- --update` from the types of the build, without their comments.

```ts
export declare class BroHTML {
    static createElement(html: string): HTMLElement;
    static createTemplate(html: string): HTMLTemplateElement;
    static escape(text: unknown): string;
    static text(html: string): string;
}
export declare const BroHTMLElement: typeof HTMLElement;
interface BroRow extends Record<string, unknown> {
    id?: string | number;
}
interface BroQuery<MODEL = BroRow, EXTRA extends object = object> {
    page: number;
    pageSize: number;
    filter?: BroFilters<MODEL, EXTRA>;
    sort?: {
        keys: Partial<Record<keyof MODEL, BroSortSpec>>;
        order?: readonly (keyof MODEL)[];
    };
}
type BroFilters<MODEL = BroRow, EXTRA extends object = object> = Partial<{
    [K in Exclude<keyof MODEL, keyof EXTRA>]: BroFilterValue<MODEL[K]> | BroFilterCondition<MODEL[K]>;
}> & EXTRA & {
    search?: string | null;
    advancedFilters?: BroAdvancedFilterGroup<MODEL>[];
};
type BroFilterValue<T> = T | readonly T[];
interface BroFilterCondition<T> {
    eq?: T;
    in?: readonly T[];
    contains?: string;
    startsWith?: string;
    gte?: T;
    lte?: T;
}
type BroAdvancedFilterGroup<MODEL = BroRow> = {
    joiner: "AND" | "OR";
    search?: BroFilterCondition<string>;
} & Partial<{
    [K in Exclude<keyof MODEL, "joiner" | "search">]: BroFilterCondition<MODEL[K]>;
}>;
export declare function matchesFilterCondition(fieldValue: unknown, condition: BroFilterCondition<unknown>): boolean;
type BroSortDirection = "asc" | "desc";
interface BroSortSpec {
    direction: BroSortDirection;
}
interface BroPageChange {
    page: number;
    pageSize: number;
}
export declare type BroTheme = "light" | "dark";
export declare type BroUserTheme = BroTheme | "auto";
interface TableBroHTMLElement extends HTMLElement {
    configure<T extends object>(options: BroConfigureOptions<T>): void;
    replaceRows<T extends object>(rows: T[], options?: BroReplaceRowsOptions): void;
    appendRows<T extends object>(rows: T[], options: BroAppendRowsOptions): void;
    setState(state: BroTableState): void;
    theme: BroUserTheme | null;
    addEventListener<T extends object = BroRow, A extends string = string>(type: "bro-action", listener: (this: TableBroHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof TableBroHTMLElementEventMap>(type: K, listener: (this: TableBroHTMLElement, event: TableBroHTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<T extends object = BroRow, A extends string = string>(type: "bro-action", listener: (this: TableBroHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof TableBroHTMLElementEventMap>(type: K, listener: (this: TableBroHTMLElement, event: TableBroHTMLElementEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
interface BroConfigureOptions<T extends object = BroRow> {
    cols: BroCol<T>[];
    rows?: T[];
    conf: BroConfig<T>;
}
interface BroReplaceRowsOptions {
    total?: number;
    emptyState?: BroEmptyState;
}
type BroEmptyState = "no-data" | "not-found";
interface BroAppendRowsOptions {
    total: number;
}
type BroTableState = "loading" | "refreshing" | "fail" | "idle";
interface TableBroHTMLElementEventMap extends HTMLElementEventMap {
    "bro-action": CustomEvent<BroActionDetail>;
    "bro-theme-change": CustomEvent<BroTheme>;
    "bro-error": CustomEvent<BroErrorDetail>;
}
type BroActionDetail<T extends object = BroRow, A extends string = string> = {
    [K in BroTableAction]: {
        action: K;
        selector?: string;
        data: BroActionDataMap<T>[K];
    };
}[BroTableAction] | {
    action: A;
    selector?: string;
    data?: BroCellActionData<T>;
};
type BroTableAction = keyof BroActionDataMap;
interface BroActionDataMap<T extends object = BroRow> {
    "bro-toolbar-search-open": undefined;
    "bro-toolbar-search-close": undefined;
    "bro-toolbar-more-export": undefined;
    "bro-filters-filter": BroFilters<T>;
    "bro-filters-toggle": undefined;
    "bro-filters-sort": BroColSort<T>;
    "bro-filters-server-loaded": BroQuery<T>;
    "bro-columns-width": number;
    "bro-details-toggle": BroCellActionData<T> | undefined;
    "bro-details-server-loaded": number;
    "bro-details-server-failed": undefined;
    "bro-paginator-page": BroPageChange;
}
interface BroCellActionData<T extends object = BroRow> {
    col: BroCol<T>;
    row: T;
}
interface BroErrorDetail {
    code: BroErrorCode;
    message: string;
}
declare type BroErrorCode = "render-failed" | "island-details-missing";
interface BroCol<T extends object = BroRow> extends BroColSort {
    title: string;
    tooltip?: string;
    name?: Extract<keyof T, string>;
    className?: string;
    component?: string | BroCustomElementConfig<T>;
    html?: boolean;
    colSpan?: number;
    dataType?: BroColDataType;
    sortKey?: Extract<keyof T, string>;
    sortDirection?: BroSortDirection;
}
interface BroColSort<T extends object = BroRow> {
    dataType?: BroColDataType;
    sortKey?: Extract<keyof T, string>;
    sortDirection?: BroSortDirection;
}
declare type BroColDataType = "string" | "number" | "boolean";
interface BroCustomElementConfig<T extends object = BroRow> {
    selector?: string;
    attrs?: {
        value?: BroCustomElementValueFn<T>;
        [attrName: string]: BroCustomElementValueFn<T> | string | undefined;
    };
    event?: string;
}
declare type BroCustomElementValueFn<T extends object = BroRow> = {
    valueFn(col: BroCol<T>, row: T): string | number | boolean;
}["valueFn"];
interface BroConfig<T extends object = BroRow> {
    skin?: BroSkin;
    theme?: BroUserTheme;
    components?: BroDeepPartial<BroSkinComponents>;
    css?: BroDeepPartial<BroConfigCSS>;
    texts?: Partial<BroTexts>;
    shadowsEnabled?: boolean;
    styleNonce?: string;
    server?: boolean;
    filtersTransform?: BroFiltersTransform;
    toolbar?: boolean;
    toolbarTitle?: string;
    searchDebounce?: number;
    header?: boolean;
    autoColumnWidth?: boolean;
    shortColumnTitle?: {
        shortColumnTitle(col: BroCol<T>): string;
    }["shortColumnTitle"];
    rowCounter?: boolean;
    rowDetailsComponent?: string;
    rowDetailsServer?: boolean;
    rowDetailsProgressMode?: BroProgressMode;
    rowDetailsIsland?: boolean;
    rowDetailsMotion?: "kinetic" | "eased";
    pageSize?: number;
    pageSizeOptions?: number[];
    stateAnimationEffect?: "alt";
    debug?: boolean;
    debugAnimation?: boolean;
}
type BroSkin = "mat" | "bs" | "nv" | (string & {});
declare type BroDeepPartial<T> = {
    [K in keyof T]?: T[K] extends (infer V) ? (V extends ((...args: never[]) => unknown) ? V : V extends readonly unknown[] ? V : V extends object ? BroDeepPartial<V> : V) : never;
};
interface BroSkinComponents {
    button: BroCustomElementConfig & {
        selector: string;
        iconSelector: string;
        beforeRender: (element: Element, value: string) => void;
    };
    dropdown?: {
        selector: string;
        css?: {
            button: {
                className: string;
            };
        };
    };
    filterDrawer: {
        beforeRender?: (closeButton: Element) => void;
    };
    fontIcon?: {
        html: (iconName: string) => string;
    };
    paginator: {
        selector: string;
        inputsAsProperties?: boolean;
        recreateOnReplaceRows?: boolean;
        css?: {
            ul?: {
                className?: string;
                li?: {
                    className?: string;
                    a?: {
                        className?: string;
                    };
                };
            };
        };
    };
    progressBar: {
        selector: string;
    };
    sortHeader: {
        selector: string;
        titleAsContent?: boolean;
        contentSelector: string;
        beforeRender?: (element: Element, value: string) => void;
        afterRender?: (element: Element, value: string) => void | (() => void);
    };
    state: {
        fontIcon?: boolean;
        lottie?: boolean;
        lottieHTML?: (iconSrc: string) => string;
        states: BroStates;
        statesDark?: BroStates;
    };
    switch?: {
        selector: string;
        css?: {
            div: {
                className: string;
                input: {
                    className: string;
                };
            };
        };
    };
    textEllipsis: {
        selector: string;
        afterRender?: (element: Element, value: string) => void | (() => void);
    };
    toolbar: {
        selector: string;
        css?: {
            nav: {
                className: string;
                div?: {
                    className?: string;
                };
            };
        };
    };
    toolbarMain: {
        selector: string;
        css?: {
            toolbarTitle: {
                className: string;
            };
            navbarCollapse: {
                className: string;
                ul: {
                    className?: string;
                    li: {
                        className: string;
                        a: {
                            className: string;
                        };
                    };
                };
            };
        };
        beforeRender?: (searchButton: Element, value: string) => void;
        buttons?: (BroButton | BroDropdown)[];
    };
    toolbarSearch: {
        beforeRender?: (backButton: Element, clearButton: Element) => void;
    };
}
interface BroButton {
    label?: string;
    buttonClassName?: string | null;
    buttonTitle: string;
    buttonTooltip?: string;
    iconHTML?: string;
    mode?: "button" | "link";
    eventType: string;
}
interface BroDropdown {
    buttonClassName?: string | null;
    buttonTitle: string;
    buttonTooltip?: string;
    iconHTML?: string;
    label?: string;
    mode: "select" | "dropdown" | "navbar-dropdown";
    options: BroDropdownOption[];
}
declare type BroDropdownOption = {
    value?: string;
    iconHTML?: string;
    title?: string;
    divider?: true;
    header?: string;
};
interface BroStates {
    loading: [
        string,
        string
    ];
    "no-data": [
        string,
        string
    ];
    "not-found"?: [
        string,
        string
    ];
    fail: [
        string,
        string
    ];
}
interface BroConfigCSS {
    table?: {
        className?: string;
        thead?: {
            className?: string;
            tr?: {
                className?: string;
                th?: {
                    className?: string;
                };
            };
        };
        tbody?: {
            className?: string;
            tr?: {
                className?: string;
                td?: {
                    className?: string;
                };
            };
        };
    };
    shadow?: {
        className?: string;
    };
}
interface BroTexts {
    rowCounter: string;
    rowCounterName: string;
    filters: string;
    close: string;
    pagination: string;
    pageNavigation: string;
    itemsPerPage: string;
    firstPage: string;
    previousPage: string;
    nextPage: string;
    lastPage: string;
    first: string;
    previous: string;
    next: string;
    last: string;
    rangeLabel: (page: number, pageSize: number, length: number) => string;
    loadingProgress: string;
    states: Partial<Record<keyof BroStates, string>>;
    search: string;
    searchField: string;
    back: string;
    clear: string;
    noItems: string;
    detailsLoading: string;
}
type BroFiltersTransform = {
    filtersTransform(rows: BroRow[], filters: BroFilters): BroRow[];
}["filtersTransform"];
declare type BroProgressMode = "indeterminate" | "determinate";
interface BroSkinConfig {
    themeAttribute?: string;
    css: BroConfigCSS;
    components: BroSkinComponents;
    elements?: Record<string, string>;
}
interface BroResolvedConfig extends Omit<BroConfig, "skin" | "theme" | "components" | "css" | "texts" | "shadowsEnabled" | "toolbarTitle" | "shortColumnTitle" | "rowCounter" | "pageSize" | "pageSizeOptions"> {
    skin: BroSkin;
    theme: BroUserTheme;
    themeAttribute?: string;
    components: BroSkinComponents;
    css: BroConfigCSS;
    texts: BroTexts;
    shadowsEnabled: boolean;
    toolbarTitle: string;
    shortColumnTitle: (col: BroCol) => string;
    rowCounter: boolean;
    pageSize: number;
    pageSizeOptions: number[];
    prerender?: boolean;
}
interface BroCellElement<T extends object = BroRow> {
    row?: T;
    col?: BroCol<T>;
}
interface BroConfiguredElement {
    config?: BroConfig;
}
interface BroRowDetailsElement<T extends object = BroRow> {
    row?: T;
    server?: string;
}
interface BroSortHeader {
    activeSort?: BroColSort;
    arrowPosition: "before" | "after";
    dataType: string;
    headerTitle: string;
    iconHTML?: string;
    sortId: string;
    tooltip: string;
}
interface BroTextEllipsis {
    containerClassName: string | null;
    value: string;
}
interface BroProgressBar {
    color: string;
    mode: BroProgressMode;
    value: string;
}
interface BroToolbarElement {
    contentClassName: string;
    appendToolbarContent(...nodes: (Node | string)[]): void;
}
interface BroToolbarMain extends BroToolbarElement {
    toolbarTitle: string;
}
interface BroPaginatorElement {
    pageIndex: number;
    pageSize: number;
    length: number;
    pageSizeOptions: number[];
    showFirstLastButtons: boolean;
    disabled: boolean;
}
interface BroPaginatorPageEvent {
    pageIndex: number;
    previousPageIndex?: number;
    pageSize: number;
    length: number;
}
interface BroFilterDrawerHTMLElement extends HTMLElement {
    opened: boolean;
    mode: "side" | "over";
    texts?: Partial<BroTexts>;
    toggle(): void;
    addEventListener<T extends object = BroRow, A extends string = string>(type: "bro-action", listener: (this: BroFilterDrawerHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends keyof BroFilterDrawerHTMLElementEventMap>(type: K, listener: (this: BroFilterDrawerHTMLElement, event: BroFilterDrawerHTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<T extends object = BroRow, A extends string = string>(type: "bro-action", listener: (this: BroFilterDrawerHTMLElement, event: CustomEvent<BroActionDetail<T, A>>) => void, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends keyof BroFilterDrawerHTMLElementEventMap>(type: K, listener: (this: BroFilterDrawerHTMLElement, event: BroFilterDrawerHTMLElementEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
interface BroFilterDrawerHTMLElementEventMap extends HTMLElementEventMap {
    "bro-filters-open": CustomEvent<null>;
    "bro-filters-close": CustomEvent<null>;
    "bro-action": CustomEvent<BroActionDetail>;
}
declare global {
    interface HTMLElementTagNameMap {
        "table-bro": TableBroHTMLElement;
        "table-bro-filter-drawer-container": BroFilterDrawerHTMLElement;
    }
}
export declare function prerenderTableBro<T extends object>(element: HTMLElement, options: BroConfigureOptions<T>): void;
export declare function isPrerendered(element: Element): boolean;
export interface BroView {
    selector?: string;
    template?(...args: unknown[]): string;
    el?: HTMLElement;
    events?(): void;
    render(...args: unknown[]): Node | void;
    renderAnimation?(...args: unknown[]): void;
}
export declare function fitCellItems(row: HTMLElement, signal: AbortSignal): void;
export declare function resolveTexts(texts?: Partial<BroTexts>): BroTexts;
export declare class BroDom {
    readonly document: Document;
    constructor(document: Document);
    createElement<T = HTMLElement>(tag: string): HTMLElement & T;
    createTextNode(value: string): Text;
    createTemplate(html: string): HTMLTemplateElement;
    createFromHTML<T = HTMLElement>(html: string): HTMLElement & T;
}
declare namespace events_d_exports {
    export { actionEvent, columnsWidthEvent, detailsServerFailedEvent, detailsServerLoadedEvent, detailsToggleEvent, errorEvent, filtersCloseEvent, filtersFilterEvent, filtersOpenEvent, filtersServerLoadedEvent, filtersSortEvent, filtersToggleEvent, paginatorPageEvent, themeChangeEvent, toolbarEvent, toolbarMoreExportEvent, toolbarSearchCloseEvent, toolbarSearchOpenEvent };
}
declare const actionEvent = "bro-action";
declare const toolbarEvent = "bro-toolbar";
declare const toolbarSearchOpenEvent = "bro-toolbar-search-open";
declare const toolbarSearchCloseEvent = "bro-toolbar-search-close";
declare const toolbarMoreExportEvent = "bro-toolbar-more-export";
declare const filtersFilterEvent = "bro-filters-filter";
declare const filtersToggleEvent = "bro-filters-toggle";
declare const filtersOpenEvent = "bro-filters-open";
declare const filtersCloseEvent = "bro-filters-close";
declare const filtersSortEvent = "bro-filters-sort";
declare const filtersServerLoadedEvent = "bro-filters-server-loaded";
declare const columnsWidthEvent = "bro-columns-width";
declare const detailsToggleEvent = "bro-details-toggle";
declare const detailsServerLoadedEvent = "bro-details-server-loaded";
declare const detailsServerFailedEvent = "bro-details-server-failed";
declare const paginatorPageEvent = "bro-paginator-page";
declare const themeChangeEvent = "bro-theme-change";
declare const errorEvent = "bro-error";
type BroActionArgs<A extends string> = A extends BroTableAction ? (undefined extends BroActionDataMap[A] ? [
    data?: BroActionDataMap[A]
] : [
    data: BroActionDataMap[A]
]) : [
    data?: BroCellActionData
];
export declare function dispatchAction<A extends string>(target: Element, action: A, ...[data]: BroActionArgs<A>): void;
declare type BroMotionEndReason = "done" | "replaced" | "cancel" | "cancelAll" | "aborted" | "skip" | "error";
declare interface BroAnimateParamsBase {
    timing?(timeFraction: number): number;
    draw(progress: number): void;
    duration: number;
    skip?(): boolean;
    label?: string;
    onEnd?(reason: BroMotionEndReason): void;
}
declare interface BroAnimateParams extends BroAnimateParamsBase {
    timing(timeFraction: number): number;
}
declare interface BroKineticParams extends BroAnimateParamsBase {
    distance?: number;
}
interface BroClock {
    now(): number;
    request(callback: (time: number) => void): void;
}
interface BroMotionTrackInfo {
    key: string | null;
    label: string;
    kind: "eased" | "kinetic";
    elapsed: number;
    progress: number | null;
}
interface BroMotionEnd {
    label: string;
    reason: BroMotionEndReason;
    duration: number;
}
export declare class BroMotion {
    private readonly signal;
    private readonly debug?;
    private readonly clock;
    readonly history: BroMotionEnd[];
    durationScale: number;
    private running;
    private scheduled;
    private idleResolvers;
    private frames;
    private kineticGroup;
    private pausedAt;
    private lag;
    private readonly frame;
    constructor(signal: AbortSignal, debug?: boolean | undefined, clock?: BroClock);
    get paused(): boolean;
    animate(key: string | null, params: BroAnimateParams): void;
    animateKinetic(key: string | null, params: BroKineticParams): void;
    cancel(key: string): void;
    cancelAll(): void;
    pause(): void;
    resume(): void;
    step(ms?: number): void;
    tracks(): BroMotionTrackInfo[];
    idle(): Promise<void>;
    private joinKineticGroup;
    private startTrack;
    private removeTracks;
    private endTrack;
    private now;
    private schedule;
    private draw;
}
declare class BroFrame {
    reads: number;
    writes: number;
    animations: number;
    private readTasks;
    private writeTasks;
    private animationTasks;
    read(task: () => void): void;
    write(task: () => void): void;
    animate(task: () => void): void;
    flush(): void;
}
interface BroIslandRow {
    readonly number: number;
    readonly tr: HTMLElement;
    readonly auxTr: HTMLElement | null;
    readonly detailsTr: HTMLElement | null;
    readonly open: boolean;
}
interface BroBodyLayoutExtension {
    readonly bodyClassName: string;
    readonly detailsBorderWidth: number;
    rowsRendered(container: HTMLElement, rowsLength: number, first: number, last: number, height?: number): void;
    rowsAdded(from: number, count: number, first?: number, last?: number): void;
    rowsRemoved(from: number, count: number): void;
    rowAdded(row: BroIslandRow): void;
    rowRemoved(row: BroIslandRow): void;
    rowsMoved(rowsLength: number): void;
    rowResized(row: BroIslandRow, detailsHeight: number): void;
    detailsRemoved?(row: BroIslandRow): void;
    windowReset(): void;
    windowMoved(): void;
    heightsChanged(): void;
    gapsHeight(first: number, last: number): number;
    gapsBefore(rowNumber: number): number;
    detailsToggled(frame: BroFrame, row: BroIslandRow): void;
    rowsChanging(): void;
    rowsChanged(): void;
}
interface BroIslandTable {
    readonly styles: Readonly<{
        rowHeight: number;
        islandSpaceSize: number;
        kineticTimeConstant: number;
    }>;
    readonly shadowClassName: string;
    readonly cellClassName: string;
    readonly colSpan: number;
    readonly detailsClassName: string;
    readonly server: boolean;
    rows(): BroIslandRow[];
    rowHeights(): number[];
    window(): {
        top: number;
        height: number;
        lastRow: number;
    };
    headerTable(): HTMLElement | null;
    paginator(): HTMLElement | null;
    animateKinetic(key: string | null, params: BroKineticParams): void;
}
interface BroIslandDetailsModule {
    create(table: BroIslandTable): BroBodyLayoutExtension;
}
export declare function useIslandDetails(impl: BroIslandDetailsModule): void;
export declare function registerSkin(name: BroSkin, config: BroSkinConfig): void;
export declare function defineTableBroFilterDrawerContainer(): void;
export declare const broCellSelectors: Readonly<{
    ellipsisContainer: string;
    ellipsis: string;
}>;
export { type BroActionDataMap, type BroActionDetail, type BroAdvancedFilterGroup, type BroAppendRowsOptions, type BroButton, type BroCellActionData, type BroCellElement, type BroCol, type BroColDataType, type BroColSort, type BroConfig, type BroConfigCSS, type BroConfigureOptions, type BroConfiguredElement, type BroCustomElementConfig, type BroCustomElementValueFn, type BroDeepPartial, type BroDropdown, type BroDropdownOption, type BroEmptyState, type BroErrorCode, type BroErrorDetail, type BroFilterCondition, type BroFilterDrawerHTMLElement, type BroFilterDrawerHTMLElementEventMap, type BroFilterValue, type BroFilters, type BroFiltersTransform, type BroPageChange, type BroPaginatorElement, type BroPaginatorPageEvent, type BroProgressBar, type BroProgressMode, type BroQuery, type BroReplaceRowsOptions, type BroResolvedConfig, type BroRow, type BroRowDetailsElement, type BroSkin, type BroSkinComponents, type BroSkinConfig, type BroSortDirection, type BroSortHeader, type BroSortSpec, type BroStates, type BroTableAction, type BroTableState, type BroTextEllipsis, type BroTexts, type BroToolbarElement, type BroToolbarMain, type TableBroHTMLElement, type TableBroHTMLElementEventMap, events_d_exports as events };
```

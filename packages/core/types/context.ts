import type {BroDataState}              from '../controller/state';
import type {BroMotion}                 from '../shared/motion';
import type {BroThemeService}           from '../shared/theme.service';
import type {BroCol, BroResolvedConfig} from './table-bro';

/** The sizes and timings of the skin, in px and ms. The geometry, the shadows and the animations read them as numbers. */
export interface BroSkinStyles {
  /** The height of a body row. */
  readonly rowHeight: number;
  /** The space for the shadows around the body; 0 with shadowsEnabled: false. */
  readonly shadowSize: number;
  /** The space between the islands of the table, as between the table and its filter drawer. */
  readonly islandSpaceSize: number;
  /** The z-index of the body container while the refresh overlay is shown. */
  readonly tableBodyContainerZIndex: number;
  /** The opacity of the refresh overlay in the light theme. */
  readonly refreshOverlayOpacity: number;
  /** The opacity of the refresh overlay in the dark theme. */
  readonly refreshOverlayOpacityDark: number;
  /** The duration of the eased animations: body height, header progress, refresh overlay, details progress, details button. */
  readonly detailsDuration: number;
  /** The curve of the eased row details and of the turn of their button: a timing of the motion. */
  readonly detailsEasing: (x: number) => number;
  /** The time constant of the kinetic animations: 1 - e^(-t / kineticTimeConstant). */
  readonly kineticTimeConstant: number;
  /** The duration of the turn of the icon of a table state: loading, no data, not found, failed. */
  readonly stateIconDuration: number;
  /** The duration of the fade-in of the message of a table state. */
  readonly stateMessageDuration: number;
  /** The factor of the durations of every animation: 0 under prefers-reduced-motion: reduce. */
  readonly durationScale: number;
}

/**
 * The data of one <table-bro> instance: columns, config, logical state, geometry, the views registry, the theme.
 * createContext() creates it at render, before the controller and the first view.
 * It has no methods, so a view cannot call the controller through the context.
 * The models, the views and the layout of the body take the context, so the fields of their types are declared next to
 * them (declare module): columns in model/columns.ts, model in model/models.ts, view in view/shared/views.ts and layout
 * in view/features/body-layout/body-layout.ts. This file imports none of them, so their imports make no cycle.
 */
export interface BroContext {
  /** The instance columns, including the service "No" column. They do not change after init. */
  readonly cols: BroCol[];
  /** The instance config with shadowsEnabled normalized. It does not change after init. */
  readonly config: BroResolvedConfig;
  /** The sizes and timings of the skin. */
  readonly styles: BroSkinStyles;
  /** The logical state of the instance. Read only: the controller writes it. */
  readonly state: Readonly<BroDataState>;
  /** The <table-bro> element of the instance; the table events are sent and listened to on it. */
  readonly host: HTMLElement;
  /** All view animations of the instance. */
  readonly motion: BroMotion;
  /** The computed theme. */
  readonly themeService: BroThemeService;
  /** The lifecycle of the current connection: listeners and timers are removed when the element is disconnected. */
  readonly signal: AbortSignal;
}

/** The same object whose state fields are writable. Only the controller constructor takes it. */
export interface BroControllerContext extends BroContext {
  /** The logical state of the instance, writable for the controller. */
  readonly state: BroDataState;
}

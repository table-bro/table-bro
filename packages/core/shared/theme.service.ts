import type {BroTheme, BroUserTheme} from '../types/theme';
import {themeChangeEvent}            from './events';

/** The dark theme class, which the table puts on its host. */
const darkThemeClass = 'bro-dark-theme';
/** The light theme class, which the table puts on its host: the skins keep it out of the dark styles of an ancestor. */
const lightThemeClass = 'bro-light-theme';

const userThemes: BroUserTheme[] = ['light', 'dark', 'auto'];

export class BroThemeService {
  /** The target of the bro-theme-change events of the table: the element of the table. */
  readonly themeChanges: EventTarget;

  /** The theme from the config; used when there is no attribute. */
  readonly configTheme: BroUserTheme;
  /** The explicit theme from the theme attribute or property; null when not set. */
  explicitTheme: BroUserTheme | null = null;

  private prefersDarkMediaQuery!: MediaQueryList;
  private _theme!: BroTheme;

  /** The first theme computation at render does not send bro-theme-change. */
  private initialized: boolean = false;

  /** The handler is created once, so unsubscribing uses the same reference. */
  private readonly systemThemeListener: (event: MediaQueryListEvent) => void = this.eventListener.bind(this);
  private systemThemeSubscribed: boolean = false;

  /**
   * @param configTheme - the theme from the config
   * @param tableBroEl - the host of the table
   * @param signal - the signal of the table, which ends the subscription to the system theme
   * @param debug - the table warns about an invalid theme
   * @param themeAttribute - the attribute of the color mode of the library of the skin, which the host gets with its theme
   */
  constructor(configTheme: BroUserTheme,
              private tableBroEl: HTMLElement,
              private readonly signal: AbortSignal,
              private readonly debug?: boolean,
              private readonly themeAttribute?: string) {
    this.configTheme = configTheme;
    this.themeChanges = this.tableBroEl;

    this.setExplicitTheme(<BroUserTheme | null>this.tableBroEl.getAttribute('theme'));

    this.initialized = true;
  }

  /** The computed theme: 'light' | 'dark'. */
  get theme(): BroTheme {
    return this._theme;
  }

  /**
   * The explicit theme from the theme attribute; null returns the config theme. An invalid value counts as missing.
   * The only place that subscribes to matchMedia: the subscription exists only while the effective theme is 'auto'.
   */
  setExplicitTheme(theme: BroUserTheme | null): void {
    if (theme !== null && !userThemes.includes(theme)) {
      if (this.debug) {
        console.warn(`[table-bro] The theme "${theme}" is ignored, expected one of: ${userThemes.join(', ')}.`);
      }

      theme = null;
    }

    this.explicitTheme = theme;

    const userTheme = (this.explicitTheme !== null) ? this.explicitTheme : this.configTheme;

    if (userTheme === 'auto') {
      if (!this.prefersDarkMediaQuery) {
        this.prefersDarkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      }

      this.subscribeToSystemTheme();

      this.setTheme(this.getSystemTheme(this.prefersDarkMediaQuery.matches));
    } else {
      this.unsubscribeFromSystemTheme();

      this.setTheme(userTheme);
    }
  }

  /** Ends the subscription to the system theme and takes the class of the theme that this service put off the host. */
  destroy() {
    this.unsubscribeFromSystemTheme();
    this.removeHostTheme();
  }

  private subscribeToSystemTheme(): void {
    if (!this.systemThemeSubscribed) {
      this.prefersDarkMediaQuery.addEventListener('change', this.systemThemeListener, {signal: this.signal});

      this.systemThemeSubscribed = true;
    }
  }

  private unsubscribeFromSystemTheme(): void {
    if (this.systemThemeSubscribed) {
      this.prefersDarkMediaQuery.removeEventListener('change', this.systemThemeListener);

      this.systemThemeSubscribed = false;
    }
  }

  private eventListener(event: MediaQueryListEvent) {
    this.setTheme(this.getSystemTheme(event.matches));
  }

  /**
   * bro-theme-change is sent only when the computed theme actually changes.
   */
  private setTheme(theme: BroTheme): void {
    const previousTheme = this._theme;

    this._theme = theme;

    this.renderHostClass();

    if (this.initialized && this._theme !== previousTheme) {
      this.dispatchThemeChange();
    }
  }

  /**
   * The host gets the class of its theme and the attribute of the color mode of the library of the skin: 'auto' takes the
   * theme of the system, and a page that keeps one theme sets 'light' or 'dark'.
   */
  private renderHostClass(): void {
    this.themedElements().forEach(el => {
      el.classList.toggle(darkThemeClass, this._theme === 'dark');
      el.classList.toggle(lightThemeClass, this._theme === 'light');

      if (this.themeAttribute) {
        el.setAttribute(this.themeAttribute, this._theme);
      }
    });
  }

  /** Takes the class and the attribute of the theme that this service put off the host. */
  private removeHostTheme(): void {
    this.themedElements().forEach(el => {
      el.classList.remove(darkThemeClass, lightThemeClass);

      if (this.themeAttribute) {
        el.removeAttribute(this.themeAttribute);
      }
    });
  }

  /** The host, and the filter drawer around the table, whose header and card stand next to the table and take its theme. */
  private themedElements(): Element[] {
    const drawer = this.tableBroEl.closest('table-bro-filter-drawer-container');

    return drawer ? [this.tableBroEl, drawer] : [this.tableBroEl];
  }

  private getSystemTheme(matchesDark: boolean): BroTheme {
    return matchesDark ? 'dark' : 'light';
  }

  private dispatchThemeChange() {
    this.tableBroEl.dispatchEvent(
      new CustomEvent<BroTheme>(themeChangeEvent, {
        bubbles: false,
        detail: this._theme
      })
    );
  }
}

/**
 * A view of the core or of a skin: the element that it renders from its template and keeps.
 * @group Rendering helpers
 */
export interface BroView {
  /** The class name or the tag name that the view gives its element. */
  selector?: string;

  /**
   * The HTML of the element, which render inserts.
   * @param args - the data that the view needs for the HTML
   */
  template?(...args: unknown[]): string;

  /** The element that the view renders and keeps. */
  el?: HTMLElement;

  /** Adds the listeners to the rendered element. */
  events?(): void;

  /**
   * Renders the element of the view and returns it, or fills the element in place and returns nothing.
   * @param args - the data of the render
   */
  render(...args: unknown[]): Node | void;

  /**
   * Renders the view frame by frame during an animation.
   * @param args - the data of the animation
   */
  renderAnimation?(...args: unknown[]): void;
}

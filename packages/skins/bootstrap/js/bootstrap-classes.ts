/** Bootstrap classes the bs skin uses, with the members that it calls; the classes of the bootstrap package fit them. */
export interface BroBootstrapClasses {
  Tooltip: {
    /**
     * The tooltip of an element, created on the first call.
     * @param element - the element of the tooltip
     * @param config - the text of the tooltip and its side
     */
    getOrCreateInstance(element: Element, config: {title: string; placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right'}): BroBootstrapInstance;
  };
  /** The dropdown of a toggle button. */
  Dropdown: new (toggle: Element) => BroBootstrapInstance;
}

/** An instance of a Bootstrap class: the skin disposes of it with its element. */
export interface BroBootstrapInstance {
  /** Removes the listeners and the data of the instance from its element. */
  dispose(): void;
}

let classes: BroBootstrapClasses | undefined;

/**
 * Gives the bs skin the Bootstrap classes of the page, for example `useBootstrap({Tooltip, Dropdown})` after
 * `import {Tooltip, Dropdown} from 'bootstrap'`. Without this call the skin takes them from window.bootstrap, which
 * the Bootstrap script creates.
 */
export function useBootstrap(bootstrap: BroBootstrapClasses): void {
  classes = bootstrap;
}

/** The classes passed to useBootstrap(), otherwise window.bootstrap. */
export function bootstrapClasses(): BroBootstrapClasses {
  // The bs skin needs Bootstrap: without it a dropdown or a tooltip fails visibly
  return <BroBootstrapClasses>(classes || (<Window & {bootstrap?: BroBootstrapClasses}>window).bootstrap);
}

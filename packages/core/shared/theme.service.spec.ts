import {describe, expect, it, vi} from 'vitest';

import {BroThemeService} from './theme.service';

describe('BroThemeService', () => {
  it('gives the host the class and the attribute of its theme, auto by the system, and takes them off at its end', () => {
    const host = document.createElement('div');
    const lifecycle = new AbortController();
    const system = vi.spyOn(window, 'matchMedia').mockReturnValue(<MediaQueryList><unknown>Object.assign(new EventTarget(), {matches: true}));
    const service = new BroThemeService('auto', host, lifecycle.signal, false, 'data-bs-theme');

    // The system is dark
    expect(Array.from(host.classList)).toEqual(['bro-dark-theme']);
    expect(host.getAttribute('data-bs-theme')).toBe('dark');

    service.setExplicitTheme('light');
    expect(Array.from(host.classList)).toEqual(['bro-light-theme']);
    expect(host.getAttribute('data-bs-theme')).toBe('light');

    service.setExplicitTheme(null);
    expect(Array.from(host.classList)).toEqual(['bro-dark-theme']);

    service.destroy();
    expect(host.className).toBe('');
    expect(host.hasAttribute('data-bs-theme')).toBe(false);
    system.mockRestore();
  });

  it('gives its theme to the filter drawer around the table, whose header and card stand next to it', () => {
    const drawer = document.createElement('table-bro-filter-drawer-container');
    const host = drawer.appendChild(document.createElement('div'));
    const service = new BroThemeService('dark', host, new AbortController().signal, false, 'data-bs-theme');

    expect(Array.from(drawer.classList)).toEqual(['bro-dark-theme']);
    expect(drawer.getAttribute('data-bs-theme')).toBe('dark');

    service.setExplicitTheme('light');
    expect(Array.from(drawer.classList)).toEqual(['bro-light-theme']);

    service.destroy();
    expect(drawer.className).toBe('');
  });

  it('takes a light or a dark theme of the config as its own', () => {
    const host = document.createElement('div');
    const service = new BroThemeService('dark', host, new AbortController().signal);

    expect(service.theme).toBe('dark');
    expect(Array.from(host.classList)).toEqual(['bro-dark-theme']);
  });

  it('tells a change of the computed theme once, and not the first one', () => {
    const host = document.createElement('div');
    const changes: string[] = [];

    host.addEventListener('bro-theme-change', event => changes.push((<CustomEvent<string>>event).detail));

    const service = new BroThemeService('light', host, new AbortController().signal);

    service.setExplicitTheme('light');
    service.setExplicitTheme('dark');
    service.setExplicitTheme('dark');

    expect(changes).toEqual(['dark']);
  });

  it('ignores a theme it does not know, with a warning under debug', () => {
    const host = document.createElement('div');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const service = new BroThemeService('light', host, new AbortController().signal, true);

    service.setExplicitTheme(<'dark'><unknown>'purple');

    expect(service.theme).toBe('light');
    expect(warn).toHaveBeenCalledWith('[table-bro] The theme "purple" is ignored, expected one of: light, dark, auto.');
    warn.mockRestore();
  });

  it('listens to the system theme only under auto, once, and stops with the table', () => {
    const query = new FakeMediaQueryList();
    const host = document.createElement('div');
    const lifecycle = new AbortController();

    vi.spyOn(window, 'matchMedia').mockReturnValue(<MediaQueryList><unknown>query);

    const service = new BroThemeService('auto', host, lifecycle.signal);

    service.setExplicitTheme(null);
    expect(query.listeners.size).toBe(1);

    query.dispatchEvent(Object.assign(new Event('change'), {matches: true}));
    expect(service.theme).toBe('dark');

    service.setExplicitTheme('light');
    expect(query.listeners.size).toBe(0);

    service.setExplicitTheme(null);
    expect(query.listeners.size).toBe(1);

    service.destroy();
    expect(query.listeners.size).toBe(0);

    service.setExplicitTheme(null);
    lifecycle.abort();
    expect(query.listeners.size).toBe(0);
  });
});

/** A media query of the system theme that counts its live listeners. */
class FakeMediaQueryList extends EventTarget {
  matches = false;
  readonly listeners = new Set<EventListenerOrEventListenerObject>();

  override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions): void {
    this.listeners.add(listener);
    options?.signal?.addEventListener('abort', () => this.listeners.delete(listener));
    super.addEventListener(type, listener, options);
  }

  override removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners.delete(listener);
    super.removeEventListener(type, listener);
  }
}

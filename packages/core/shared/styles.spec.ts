import {afterEach, describe, expect, it} from 'vitest';

import type {BroConfig}             from '../types/table-bro';
import {cubicBezier, easeInOutSine} from '../view/shared/animation';
import {cssEasing, resolveStyles}   from './styles';

describe('resolveStyles', () => {
  const nodes: Element[] = [];

  // The registration of the core CSS (packages/core/styles/_custom-properties.scss)
  const registered = `
    @property --bro-row-height {syntax: '<length>'; inherits: true; initial-value: 0px;}
    @property --bro-shadow-size {syntax: '<length>'; inherits: true; initial-value: 0px;}
    @property --bro-details-duration {syntax: '<time>'; inherits: true; initial-value: 0s;}
    @property --bro-kinetic-time-constant {syntax: '<time>'; inherits: true; initial-value: 0s;}`;

  const nvSkin = `
    :where(.nv) {
      --bro-row-height: 40px; --bro-shadow-size: 48px; --bro-island-space-size: 24px;
      --bro-table-body-container-z-index: 2; --bro-refresh-overlay-opacity: 0.5; --bro-refresh-overlay-opacity-dark: 0.12;
      --bro-details-duration: 350ms; --bro-details-easing: cubic-bezier(.37, 0, .63, 1); --bro-kinetic-time-constant: 350ms; --bro-duration-scale: 1;
      --bro-state-icon-duration: 500ms; --bro-state-message-duration: 0.75s;
    }`;

  /** A host with the skin class, styled the way the core CSS and the skin CSS style it. */
  function host(css: string = '', className: string = 'nv'): HTMLElement {
    const style: HTMLStyleElement = document.createElement('style');

    style.textContent = registered + nvSkin + css;
    document.head.append(style);

    const el: HTMLElement = document.createElement('div');

    el.className = className;
    document.body.append(el);

    nodes.push(style, el);

    return el;
  }

  const config = (overrides: Partial<BroConfig> = {}): BroConfig => <BroConfig>{skin: 'nv', shadowsEnabled: true, ...overrides};

  afterEach(() => {
    nodes.splice(0).forEach(node => node.remove());
  });

  it('reads every size and timing of the skin in px and ms', () => {
    const {detailsEasing, ...styles} = resolveStyles(host(), config());

    expect(styles).toEqual({
      rowHeight: 40,
      shadowSize: 48,
      islandSpaceSize: 24,
      tableBodyContainerZIndex: 2,
      refreshOverlayOpacity: 0.5,
      refreshOverlayOpacityDark: 0.12,
      detailsDuration: 350,
      kineticTimeConstant: 350,
      stateIconDuration: 500,
      stateMessageDuration: 750,
      durationScale: 1
    });
    expect(detailsEasing(0.5)).toBeCloseTo(0.5, 5);
    expect(Object.isFrozen(resolveStyles(host(), config()))).toBe(true);
  });

  it('takes an override of the table, computed to px and ms by the registration', () => {
    const el: HTMLElement = host(`
      html {font-size: 16px;}
      .nv.e2e-row {--bro-row-height: calc(2.5rem + 4px); --bro-details-duration: 0.2s;}`, 'nv e2e-row');
    const styles = resolveStyles(el, config());

    expect(styles.rowHeight).toBe(44);
    expect(styles.detailsDuration).toBe(200);
  });

  it('gives no space for the shadows of a table without shadows', () => {
    expect(resolveStyles(host(), config({shadowsEnabled: false})).shadowSize).toBe(0);
  });
});

describe('cssEasing', () => {
  it('reads a cubic-bezier of CSS as a timing from 0 to 1', () => {
    const easing = cssEasing(' cubic-bezier(.2, 0, 0, 1)');

    expect([easing(0), easing(1)]).toEqual([0, 1]);
    // The standard curve of Material 3 starts fast: at a quarter of the time it has most of its way
    expect(easing(0.25)).toBeGreaterThan(0.6);
    expect(easing(0.25)).toBeCloseTo(cubicBezier(0.2, 0, 0, 1)(0.25), 10);
  });

  it('reads the keywords of CSS, and linear as it is', () => {
    expect(cssEasing('ease')(0.3)).toBeCloseTo(cubicBezier(0.25, 0.1, 0.25, 1)(0.3), 10);
    expect(cssEasing('linear')(0.3)).toBe(0.3);
  });

  it('keeps the curve of easeInOutSine by its cubic-bezier, and for a curve of another kind', () => {
    // The skins set cubic-bezier(.37, 0, .63, 1), the curve of easeInOutSine within a hundredth
    for (const x of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(Math.abs(cssEasing('cubic-bezier(.37, 0, .63, 1)')(x) - easeInOutSine(x))).toBeLessThan(0.01);
    }

    expect(cssEasing('steps(4)')).toBe(easeInOutSine);
  });
});

import {createTableState}               from '../controller/state';
import {createColumns}                  from '../model/columns';
import type {BroModels}                 from '../model/models';
import type {BroControllerContext}      from '../types/context';
import type {BroCol, BroResolvedConfig} from '../types/table-bro';
import {BroBodyLayout}                  from '../view/features/body-layout/body-layout';
import type {BroViews}                  from '../view/shared/views';
import {BroDom}                         from './dom';
import {BroMotion}                      from './motion';
import {prerenderStyles, resolveStyles} from './styles';
import {BroThemeService}                from './theme.service';

/**
 * Creates the instance context. It is called on every render of the element, before the controller and the first view,
 * so every field is set before the first read. The element is connected and has the class of its skin by then,
 * so the sizes and timings of the skin come from the computed style of the host. A server DOM computes no style: the
 * prerender has no sizes and timings of the skin (prerenderStyles).
 */
export function createContext(host: HTMLElement, cols: BroCol[], config: BroResolvedConfig, signal: AbortSignal): BroControllerContext {
  const styles = config.prerender ? prerenderStyles : resolveStyles(host, config);

  const motion = new BroMotion(signal, config.debugAnimation);

  // The skin CSS gives 0 under prefers-reduced-motion: reduce, and every animation draws its end at once
  motion.durationScale *= styles.durationScale;

  return Object.freeze({
    cols,
    columns: createColumns(cols),
    config,
    styles,
    state: createTableState(config),
    model: <BroModels>{
      emptyRows: 0
    },
    host,
    dom: new BroDom(host.ownerDocument),
    view: <BroViews>{},
    layout: new BroBodyLayout(config),
    motion,
    themeService: new BroThemeService(config.theme, host, signal, config.debug, config.themeAttribute, config.prerender),
    signal
  });
}

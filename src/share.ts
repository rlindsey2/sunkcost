/**
 * Share links. A machine-and-model pair that has a card gets its own pre-built page
 * at /s/<hardware>/<model>/, so a link previews correctly on X, Slack or iMessage
 * with no code running at request time. The query string carries everything else.
 */
import { computeView } from './compute';
import { defaultState, serializeState, type State } from './state';
import type { Dataset } from './types';

const cardCache = new Map<string, boolean>();

/** The same rule scripts/build-og.ts uses to decide which cards (and so which share pages) exist. */
export function hasShareCard(hwId: string, modelId: string, data: Dataset): boolean {
  const key = `${hwId}|${modelId}`;
  let hit = cardCache.get(key);
  if (hit === undefined) {
    const v = computeView({ ...defaultState(data), hw: hwId, model: modelId }, data);
    hit = !!v.calc && v.price != null && v.model?.id === modelId;
    cardCache.set(key, hit);
  }
  return hit;
}

/** Path and query for a state: the pair's share page when one exists, the app root otherwise. */
export function sharePath(state: State, modelId: string | null | undefined, data: Dataset): string {
  const qs = new URLSearchParams(serializeState(state));
  if (modelId && hasShareCard(state.hw, modelId, data)) {
    qs.delete('hw');
    qs.delete('m');
    const rest = qs.toString();
    return `/s/${state.hw}/${modelId}/${rest ? `?${rest}` : ''}`;
  }
  return `/?${qs.toString()}`;
}

/** Share pages only exist where the site itself is served; elsewhere (a standalone copy) links point at the site. */
export function onSiteHost(data: Dataset): boolean {
  if (typeof location === 'undefined') return false;
  const site = new URL(data.defaults.site_url).hostname;
  const h = location.hostname;
  return h === site || h === `www.${site}` || h.endsWith('.pages.dev') || h === 'localhost' || h === '127.0.0.1';
}

/**
 * The query for the card a state draws, when its settings differ from the pair's pre-built card:
 * usage, input:output ratio, electricity, context, the price paid and the API price decline.
 * Sort, filters and cloud speed never reach the card, so they are left out; null means the
 * pre-built card already shows exactly this.
 */
export function cardQuery(state: State, data: Dataset): string | null {
  const pick = (s: State) => {
    const q = new URLSearchParams();
    q.set('u', String(Math.round(s.usage)));
    q.set('r', String(s.ratio));
    q.set('kwh', String(s.kwh));
    q.set('ctx', String(Math.round(s.ctx)));
    if (s.price != null) q.set('p', String(Math.round(s.price)));
    q.set('d', String(s.decline));
    return q.toString();
  };
  const mine = pick(state);
  return mine === pick({ ...defaultState(data), hw: state.hw, model: state.model }) ? null : mine;
}

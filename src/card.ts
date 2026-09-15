/**
 * One share card for one state: the SVG the build-time cards, the in-page download and the
 * on-demand card function all draw, so a card looks the same wherever it was made.
 */
import { computeView } from './compute';
import { renderOgCard, ogFigures } from './og';
import { fmtDuration } from './format';
import type { State } from './state';
import type { View } from './compute';
import type { Dataset } from './types';

export const CARD_FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

/** The view behind this state's card, or null when there is nothing honest to draw (no price, or the model does not fit). */
export function cardView(state: State, data: Dataset): View | null {
  const view = computeView(state, data);
  return view.calc && view.price != null && view.model && view.model.id === state.model ? view : null;
}

/** The card for this state, or null when cardView has nothing to draw. */
export function cardSvg(state: State, data: Dataset, fontFamily = CARD_FONT): string | null {
  const view = cardView(state, data);
  if (!view || !view.calc || view.price == null) return null;
  const c = view.calc;
  return renderOgCard({
    configLine: view.configLine,
    usageLine: view.usageLine,
    verdict: view.verdict.headline,
    subLine: view.verdict.sub,
    devicePriceUsd: view.price,
    dailySaving: c.dailySaving,
    breakevenDays: c.breakevenDays,
    decay: c.apiDeclinePerYear > 0 ? { cloudPerDay: c.cloudCostPerDay, localPerDay: c.localCostPerDay, decline: c.apiDeclinePerYear } : undefined,
    peakDays: c.bestPosition?.days ?? null,
    maxYears: data.defaults.waterline_max_years,
    dataChecked: data.defaults.data_last_checked,
    fontFamily,
    figures: ogFigures({
      devicePriceUsd: view.price,
      cloudCostPerMonth: c.cloudCostPerMonth,
      localTokensPerSec: view.throughput?.tokensPerSec ?? null,
      measurement: view.throughput?.measurement ?? 'unknown',
      breakevenLabel: c.breakevenDays === null ? 'never' : fmtDuration(c.breakevenDays),
      cloudLabel: state.sub != null ? 'Your bill / month' : undefined,
    }),
  });
}
